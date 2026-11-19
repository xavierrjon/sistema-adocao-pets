import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../../backend/src/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    session: { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  },
}));

import app from "../../../backend/src/server";
import { getAllowedOrigins, isAllowedOrigin } from "../../../backend/src/lib/auth";

const PRODUCTION_ORIGIN = "https://adoteja-murex.vercel.app";
const LOCAL_ORIGIN = "http://localhost:3000";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("CORS", () => {
  it("responde ao preflight de /api/auth/login com a origem permitida e credenciais", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", PRODUCTION_ORIGIN)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(PRODUCTION_ORIGIN);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-methods"]).toContain("OPTIONS");
    expect(response.headers["access-control-allow-headers"]?.toLowerCase()).toContain(
      "content-type",
    );
    expect(response.headers["vary"]).toContain("Origin");
  });

  it("responde ao preflight de /api/auth/me com a origem permitida", async () => {
    const response = await request(app)
      .options("/api/auth/me")
      .set("Origin", PRODUCTION_ORIGIN)
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(PRODUCTION_ORIGIN);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("inclui os headers de CORS em requisições reais de /api/auth/me", async () => {
    const response = await request(app).get("/api/auth/me").set("Origin", PRODUCTION_ORIGIN);

    expect(response.headers["access-control-allow-origin"]).toBe(PRODUCTION_ORIGIN);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("preserva o ambiente local de desenvolvimento", async () => {
    const response = await request(app).options("/api/auth/login").set("Origin", LOCAL_ORIGIN);

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(LOCAL_ORIGIN);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("nunca devolve '*' como origem quando credenciais estão habilitadas", async () => {
    const response = await request(app).get("/api/health").set("Origin", PRODUCTION_ORIGIN);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).not.toBe("*");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("bloqueia preflight de origem não autorizada sem devolver headers de CORS", async () => {
    const response = await request(app)
      .options("/api/auth/login")
      .set("Origin", "https://origem-maliciosa.example")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.headers["access-control-allow-credentials"]).toBeUndefined();
  });

  it("bloqueia requisições reais de origem não autorizada", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://origem-maliciosa.example");

    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("getAllowedOrigins", () => {
  it("inclui as origens de produção mesmo sem FRONTEND_URL configurada", () => {
    vi.stubEnv("FRONTEND_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    expect(getAllowedOrigins()).toContain(PRODUCTION_ORIGIN);
    expect(getAllowedOrigins()).toContain("https://adoteja-am.vercel.app");
  });

  it("aceita várias origens em FRONTEND_URL e normaliza barras finais", () => {
    vi.stubEnv("FRONTEND_URL", "https://custom.example/, https://outro.example");

    expect(isAllowedOrigin("https://custom.example")).toBe(true);
    expect(isAllowedOrigin("https://outro.example")).toBe(true);
    expect(isAllowedOrigin("https://custom.example/")).toBe(true);
  });

  it("não considera origens parecidas ou vazias", () => {
    expect(isAllowedOrigin(undefined)).toBe(false);
    expect(isAllowedOrigin("")).toBe(false);
    expect(isAllowedOrigin("https://adoteja-murex.vercel.app.evil.example")).toBe(false);
    expect(isAllowedOrigin("https://adoteja-murex.vercel.app.br")).toBe(false);
  });
});
