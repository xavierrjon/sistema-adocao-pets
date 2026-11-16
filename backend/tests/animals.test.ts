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
}));

vi.mock("../src/lib/prisma", () => ({ default: prismaMock }));

import app from "../src/server";

const USER_ID = "3f1b8a52-6c1f-4c65-9d0b-2f4a1e7c9f11";
const ANIMAL_ID = "9b2c7d44-1a3e-4f5b-8c6d-7e8f9a0b1c2d";

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
};

const validBody = {
  name: "Rex",
  species: "Cachorro",
  breed: "SRD",
  sex: "Macho",
  size: "Medio",
  description: "Cachorro dócil.",
  whatsapp: "92999999999",
  userId: USER_ID,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("retorna status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/animals", () => {
  it("retorna a lista de animais", async () => {
    prismaMock.animal.findMany.mockResolvedValue([animal]);

    const response = await request(app).get("/api/animals");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Rex");
  });

  it("retorna lista vazia quando não há animais", async () => {
    prismaMock.animal.findMany.mockResolvedValue([]);

    const response = await request(app).get("/api/animals");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("GET /api/animals/:id", () => {
  it("retorna o animal encontrado", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);

    const response = await request(app).get(`/api/animals/${ANIMAL_ID}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(ANIMAL_ID);
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

describe("POST /api/animals", () => {
  it("cria o animal e retorna 201", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: USER_ID });
    prismaMock.animal.create.mockResolvedValue(animal);

    const response = await request(app).post("/api/animals").send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("DISPONIVEL");
  });

  it("retorna 400 quando faltam campos obrigatórios", async () => {
    const response = await request(app).post("/api/animals").send({ name: "Rex" });

    expect(response.status).toBe(400);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });

  it("retorna 400 para valores de enum inválidos", async () => {
    const response = await request(app)
      .post("/api/animals")
      .send({ ...validBody, status: "INVALIDO" });

    expect(response.status).toBe(400);
  });

  it("retorna 404 quando o usuário não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/api/animals").send(validBody);

    expect(response.status).toBe(404);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });
});

describe("PUT /api/animals/:id", () => {
  it("atualiza o animal", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);
    prismaMock.animal.update.mockResolvedValue({ ...animal, name: "Thor" });

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .send({ name: "Thor" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Thor");
  });

  it("retorna 404 quando o animal não existe", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .send({ name: "Thor" });

    expect(response.status).toBe(404);
  });

  it("retorna 400 quando o corpo está vazio", async () => {
    const response = await request(app).put(`/api/animals/${ANIMAL_ID}`).send({});

    expect(response.status).toBe(400);
  });

  it("retorna 400 para status inválido", async () => {
    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .send({ status: "INVALIDO" });

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/animals/:id", () => {
  it("remove o animal e retorna 204", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);
    prismaMock.animal.delete.mockResolvedValue(animal);

    const response = await request(app).delete(`/api/animals/${ANIMAL_ID}`);

    expect(response.status).toBe(204);
    expect(prismaMock.animal.delete).toHaveBeenCalledWith({ where: { id: ANIMAL_ID } });
  });

  it("retorna 404 quando o animal não existe", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(null);

    const response = await request(app).delete(`/api/animals/${ANIMAL_ID}`);

    expect(response.status).toBe(404);
    expect(prismaMock.animal.delete).not.toHaveBeenCalled();
  });
});

describe("GET /api/users/:id", () => {
  it("retorna o usuário encontrado", async () => {
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

describe("rotas inexistentes", () => {
  it("retorna 404", async () => {
    const response = await request(app).get("/api/nao-existe");

    expect(response.status).toBe(404);
  });
});
