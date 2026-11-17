import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const prismaMock = vi.hoisted(() => ({
  animal: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma", () => ({ default: prismaMock }));

import app from "../src/server";
import { SESSION_COOKIE_NAME } from "../src/lib/auth";

const USER_ID = "3f1b8a52-6c1f-4c65-9d0b-2f4a1e7c9f11";
const OTHER_USER_ID = "8e4f2b10-7a6d-4c93-b5e1-2d3c4a5b6c7d";
const ANIMAL_ID = "9b2c7d44-1a3e-4f5b-8c6d-7e8f9a0b1c2d";
const TOKEN = "token-opaco-de-teste";
const COOKIE = `${SESSION_COOKIE_NAME}=${TOKEN}`;
const ORIGIN = "http://localhost:3000";

const animal = {
  id: ANIMAL_ID,
  name: "Rex",
  species: "Cachorro",
  breed: "SRD",
  sex: "Macho",
  size: "Medio",
  description: "Cachorro dócil.",
  status: "DISPONIVEL",
  whatsapp: "92999999999",
  userId: USER_ID,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  user: { id: USER_ID, name: "João Silva" },
};

const otherUsersAnimal = {
  ...animal,
  id: "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  userId: OTHER_USER_ID,
  user: { id: OTHER_USER_ID, name: "Maria Souza" },
};

const validBody = {
  name: "Rex",
  species: "Cachorro",
  breed: "SRD",
  sex: "Macho",
  size: "Medio",
  description: "Cachorro dócil.",
  whatsapp: "92999999999",
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.session.findUnique.mockResolvedValue({
    id: "c1e7f4a0-1234-4c8e-9f2a-5b6c7d8e9f01",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    user: { id: USER_ID, name: "João Silva", email: "joao@email.com" },
  });
});

describe("GET /api/health", () => {
  it("retorna status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/animals", () => {
  it("retorna a lista de animais sem autenticação", async () => {
    prismaMock.animal.findMany.mockResolvedValue([animal]);

    const response = await request(app).get("/api/animals");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Rex");
    expect(response.body[0].whatsapp).toBeUndefined();
    expect(response.body[0].user.whatsapp).toBeUndefined();
  });

  it("retorna lista vazia quando não há animais", async () => {
    prismaMock.animal.findMany.mockResolvedValue([]);

    const response = await request(app).get("/api/animals");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("GET /api/animals/me", () => {
  it("exige autenticação", async () => {
    const response = await request(app).get("/api/animals/me");

    expect(response.status).toBe(401);
    expect(prismaMock.animal.findMany).not.toHaveBeenCalled();
  });

  it("retorna apenas os animais do usuário autenticado", async () => {
    prismaMock.animal.findMany.mockResolvedValue([animal]);

    const response = await request(app).get("/api/animals/me").set("Cookie", COOKIE);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(prismaMock.animal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID } }),
    );
    expect(response.body[0].whatsapp).toBeUndefined();
  });
});

describe("GET /api/animals/:id", () => {
  it("retorna o animal encontrado sem autenticação", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);

    const response = await request(app).get(`/api/animals/${ANIMAL_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(ANIMAL_ID);
    expect(response.body.whatsapp).toBeUndefined();
    expect(response.body.user.whatsapp).toBeUndefined();
  });

  it("retorna 404 quando o animal não existe", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(null);

    const response = await request(app).get(`/api/animals/${ANIMAL_ID}`);

    expect(response.status).toBe(404);
  });

  it("retorna 400 para ID inválido", async () => {
    const response = await request(app).get("/api/animals/id-invalido");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Dados inválidos.");
  });
});

describe("GET /api/animals/:id/contact", () => {
  it("exige autenticação", async () => {
    const response = await request(app).get(`/api/animals/${ANIMAL_ID}/contact`);

    expect(response.status).toBe(401);
    expect(prismaMock.animal.findUnique).not.toHaveBeenCalled();
  });

  it("devolve o WhatsApp para usuário autenticado", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);

    const response = await request(app)
      .get(`/api/animals/${ANIMAL_ID}/contact`)
      .set("Cookie", COOKIE);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      animalId: ANIMAL_ID,
      animalName: "Rex",
      responsibleName: "João Silva",
      whatsapp: "92999999999",
    });
  });

  it("retorna 404 quando o animal não existe", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/animals/${ANIMAL_ID}/contact`)
      .set("Cookie", COOKIE);

    expect(response.status).toBe(404);
  });

  it("retorna 400 para ID inválido", async () => {
    const response = await request(app).get("/api/animals/id-invalido/contact").set("Cookie", COOKIE);

    expect(response.status).toBe(400);
  });
});

describe("POST /api/animals", () => {
  it("exige autenticação", async () => {
    const response = await request(app).post("/api/animals").send(validBody);

    expect(response.status).toBe(401);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });

  it("usa o usuário autenticado e ignora userId enviado pelo cliente", async () => {
    prismaMock.animal.create.mockResolvedValue(animal);

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ ...validBody, userId: OTHER_USER_ID });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("DISPONIVEL");
    expect(prismaMock.animal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ ...validBody, userId: USER_ID }),
    });
  });

  it("retorna 400 quando faltam campos obrigatórios", async () => {
    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ name: "Rex" });

    expect(response.status).toBe(400);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });

  it("retorna 400 para valores de enum inválidos", async () => {
    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ ...validBody, status: "INVALIDO" });

    expect(response.status).toBe(400);
  });
});

describe("PUT /api/animals/:id", () => {
  it("atualiza animal próprio", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);
    prismaMock.animal.update.mockResolvedValue({ ...animal, name: "Thor" });

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ name: "Thor" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Thor");
  });

  it("retorna 403 ao tentar editar animal de outro usuário", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(otherUsersAnimal);

    const response = await request(app)
      .put(`/api/animals/${otherUsersAnimal.id}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ name: "Thor" });

    expect(response.status).toBe(403);
    expect(prismaMock.animal.update).not.toHaveBeenCalled();
  });

  it("retorna 404 quando o animal não existe", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ name: "Thor" });

    expect(response.status).toBe(404);
  });

  it("retorna 400 quando o corpo está vazio", async () => {
    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({});

    expect(response.status).toBe(400);
  });

  it("retorna 400 para status inválido", async () => {
    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ status: "INVALIDO" });

    expect(response.status).toBe(400);
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app).put(`/api/animals/${ANIMAL_ID}`).send({ name: "Thor" });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/animals/:id", () => {
  it("remove animal próprio e retorna 204", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);
    prismaMock.animal.delete.mockResolvedValue(animal);

    const response = await request(app)
      .delete(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN);

    expect(response.status).toBe(204);
    expect(prismaMock.animal.delete).toHaveBeenCalledWith({ where: { id: ANIMAL_ID } });
  });

  it("retorna 403 ao tentar excluir animal de outro usuário", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(otherUsersAnimal);

    const response = await request(app)
      .delete(`/api/animals/${otherUsersAnimal.id}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN);

    expect(response.status).toBe(403);
    expect(prismaMock.animal.delete).not.toHaveBeenCalled();
  });

  it("retorna 404 quando o animal não existe", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN);

    expect(response.status).toBe(404);
    expect(prismaMock.animal.delete).not.toHaveBeenCalled();
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app).delete(`/api/animals/${ANIMAL_ID}`);

    expect(response.status).toBe(401);
  });
});

describe("GET /api/users/:id", () => {
  it("retorna o usuário encontrado sem senha", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      name: "Maria",
      email: "maria@email.com",
      whatsapp: "92999999999",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await request(app).get(`/api/users/${USER_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("maria@email.com");
    expect(response.body.password).toBeUndefined();
    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.whatsapp).toBeUndefined();
  });

  it("retorna 404 quando o usuário não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app).get(`/api/users/${USER_ID}`);

    expect(response.status).toBe(404);
  });

  it("retorna 400 para ID inválido", async () => {
    const response = await request(app).get("/api/users/id-invalido");

    expect(response.status).toBe(400);
  });
});

describe("documentação e rotas inexistentes", () => {
  it("publica o documento OpenAPI", async () => {
    const response = await request(app).get("/api/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.1.0");
    expect(response.body.paths["/api/auth/me"]).toBeUndefined();
    expect(response.body.paths["/auth/me"]).toBeDefined();
  });

  it("retorna 404 para rota inexistente", async () => {
    const response = await request(app).get("/api/nao-existe");

    expect(response.status).toBe(404);
  });
});
