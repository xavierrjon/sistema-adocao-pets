import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../../../backend/src/lib/prisma", () => ({ default: prismaMock }));

import app from "../../../backend/src/server";
import { SESSION_COOKIE_NAME } from "../../../backend/src/lib/auth";
import { hashToken } from "../../../backend/src/lib/token";
import { hashPassword, verifyPassword } from "../../../backend/src/utils/password";

const USER_ID = "3f1b8a52-6c1f-4c65-9d0b-2f4a1e7c9f11";
const SESSION_ID = "c1e7f4a0-1234-4c8e-9f2a-5b6c7d8e9f01";
const TOKEN = "token-opaco-de-teste";
const COOKIE = `${SESSION_COOKIE_NAME}=${TOKEN}`;
const ORIGIN = "http://localhost:3000";

const publicUser = {
  id: USER_ID,
  name: "João Silva",
  email: "joao@email.com",
};

const registerBody = {
  name: "João Silva",
  email: "joao@email.com",
  password: "SenhaSegura123",
};

const validSession = {
  id: SESSION_ID,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  user: publicUser,
};

function cookieFrom(response: request.Response): string {
  const cookies = response.headers["set-cookie"];
  expect(cookies).toBeDefined();
  return Array.isArray(cookies) ? cookies[0] : String(cookies);
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.session.create.mockResolvedValue({ id: SESSION_ID });
  prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });
});

describe("POST /api/auth/register", () => {
  it("cadastra usuário com senha armazenada como hash e retorna dados públicos", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(publicUser);

    const response = await request(app).post("/api/auth/register").send(registerBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(publicUser);
    expect(response.body.password).toBeUndefined();
    expect(response.body.passwordHash).toBeUndefined();

    const created = prismaMock.user.create.mock.calls[0][0].data;
    expect(created.email).toBe("joao@email.com");
    expect(created.passwordHash).not.toBe(registerBody.password);
    expect(await verifyPassword(registerBody.password, created.passwordHash)).toBe(true);
  });

  it("normaliza o e-mail para minúsculas", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(publicUser);

    await request(app)
      .post("/api/auth/register")
      .send({ ...registerBody, email: "  JOAO@EMAIL.COM  " });

    expect(prismaMock.user.create.mock.calls[0][0].data.email).toBe("joao@email.com");
  });

  it("retorna 409 quando o e-mail já está cadastrado", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: USER_ID });

    const response = await request(app).post("/api/auth/register").send(registerBody);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("E-mail já cadastrado.");
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("retorna 400 para e-mail inválido", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...registerBody, email: "invalido" });

    expect(response.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("retorna 400 para senha curta", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...registerBody, password: "123" });

    expect(response.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("retorna 400 quando faltam campos obrigatórios", async () => {
    const response = await request(app).post("/api/auth/register").send({ name: "João" });

    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })]),
    );
  });
});

describe("POST /api/auth/login", () => {
  it("autentica, persiste a sessão e emite cookie HttpOnly com o token original", async () => {
    const passwordHash = await hashPassword(registerBody.password);
    prismaMock.user.findUnique.mockResolvedValue({ ...publicUser, passwordHash });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: registerBody.email, password: registerBody.password });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(publicUser);
    expect(response.body.passwordHash).toBeUndefined();

    const cookie = cookieFrom(response);
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
    expect(cookie).not.toContain("Max-Age");

    const token = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))?.[1];
    expect(token).toBeTruthy();
    expect(prismaMock.session.create).toHaveBeenCalledWith({
      data: {
        tokenHash: hashToken(token as string),
        userId: USER_ID,
        expiresAt: expect.any(Date),
      },
    });
  });

  it("usa mensagem genérica para senha incorreta", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...publicUser,
      passwordHash: await hashPassword("outra-senha"),
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: registerBody.email, password: "SenhaErrada123" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("E-mail ou senha inválidos.");
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("usa a mesma mensagem quando o e-mail não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "ninguem@email.com", password: "SenhaSegura123" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("E-mail ou senha inválidos.");
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("cria sessão de 30 dias e cookie persistente com rememberMe", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...publicUser,
      passwordHash: await hashPassword(registerBody.password),
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: registerBody.email, password: registerBody.password, rememberMe: true });

    expect(response.status).toBe(200);
    expect(cookieFrom(response)).toContain("Max-Age=2592000");

    const expiresAt = prismaMock.session.create.mock.calls[0][0].data.expiresAt as Date;
    expect(expiresAt.getTime() - Date.now()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  });

  it("mantém validade curta no banco quando rememberMe não é marcado", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...publicUser,
      passwordHash: await hashPassword(registerBody.password),
    });

    await request(app)
      .post("/api/auth/login")
      .send({ email: registerBody.email, password: registerBody.password });

    const expiresAt = prismaMock.session.create.mock.calls[0][0].data.expiresAt as Date;
    const remaining = expiresAt.getTime() - Date.now();
    expect(remaining).toBeGreaterThan(11 * 60 * 60 * 1000);
    expect(remaining).toBeLessThanOrEqual(12 * 60 * 60 * 1000);
  });

  it("retorna 400 para corpo inválido", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "invalido" });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("GET /api/auth/me", () => {
  it("retorna o usuário da sessão válida", async () => {
    prismaMock.session.findUnique.mockResolvedValue(validSession);

    const response = await request(app).get("/api/auth/me").set("Cookie", COOKIE);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(publicUser);
    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(TOKEN) },
      select: expect.any(Object),
    });
  });

  it("retorna 401 sem cookie", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 401 para token sem sessão", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const response = await request(app).get("/api/auth/me").set("Cookie", COOKIE);

    expect(response.status).toBe(401);
  });

  it("remove e rejeita sessão expirada", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      ...validSession,
      expiresAt: new Date(Date.now() - 1000),
    });

    const response = await request(app).get("/api/auth/me").set("Cookie", COOKIE);

    expect(response.status).toBe(401);
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { id: SESSION_ID } });
  });
});

describe("POST /api/auth/logout", () => {
  it("revoga a sessão e limpa o cookie", async () => {
    prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Sessão encerrada.");
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { tokenHash: hashToken(TOKEN) },
    });

    const cookie = cookieFrom(response);
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=;`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
  });

  it("responde 200 mesmo sem sessão ativa", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(200);
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });

  it("rejeita origem diferente quando há cookie de sessão", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", COOKIE)
      .set("Origin", "https://site-externo.com");

    expect(response.status).toBe(403);
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
  });
});

describe("utilitário de senha", () => {
  it("gera hashes distintos para a mesma senha e valida ambos", async () => {
    const first = await hashPassword("SenhaSegura123");
    const second = await hashPassword("SenhaSegura123");

    expect(first).not.toBe(second);
    expect(first).toMatch(/^\$2[aby]\$/);
    expect(await verifyPassword("SenhaSegura123", first)).toBe(true);
    expect(await verifyPassword("SenhaErrada", first)).toBe(false);
  }, 20000);
});
