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

const storageMocks = vi.hoisted(() => ({
  uploadAnimalImage: vi.fn(),
  deleteAnimalImage: vi.fn(),
}));

const locationMocks = vi.hoisted(() => ({
  assertValidLocation: vi.fn(),
}));

vi.mock("../src/lib/prisma", () => ({ default: prismaMock }));

vi.mock("../src/services/location.service", () => locationMocks);

vi.mock("../src/services/storage.service", () => ({
  ...storageMocks,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  detectImageMimeType: vi.fn(),
}));

import app from "../src/server";
import { SESSION_COOKIE_NAME } from "../src/lib/auth";
import { HttpError } from "../src/lib/http-error";

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
  state: "SP",
  city: "São Paulo",
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

// Arquivo válido para os testes de multipart: o conteúdo real (magic bytes) é
// verificado nos testes unitários de storage; aqui o serviço é simulado.
const PNG_FILE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

const UPLOADED_IMAGE = {
  url: "https://res.cloudinary.com/exemplo/image/upload/v1730000000/adoteja/animals/uuid.jpg",
  publicId: "adoteja/animals/novo-public-id",
};

const animalWithImage = {
  ...animal,
  imageUrl: "https://res.cloudinary.com/exemplo/image/upload/v1730000000/adoteja/animals/antigo.jpg",
  imagePublicId: "adoteja/animals/antigo-public-id",
};

const validBody = {
  name: "Rex",
  species: "Cachorro",
  breed: "SRD",
  sex: "Macho",
  size: "Medio",
  description: "Cachorro dócil.",
  whatsapp: "92999999999",
  state: "SP",
  city: "São Paulo",
};

beforeEach(() => {
  // reseta também implementações (mockRejectedValue de testes anteriores).
  vi.resetAllMocks();
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
    expect(response.body[0].state).toBe("SP");
    expect(response.body[0].city).toBe("São Paulo");
    expect(response.body[0].whatsapp).toBeUndefined();
    expect(response.body[0].user.whatsapp).toBeUndefined();
    expect(prismaMock.animal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "DISPONIVEL" } }),
    );
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
    expect(response.body.state).toBe("SP");
    expect(response.body.city).toBe("São Paulo");
    expect(locationMocks.assertValidLocation).toHaveBeenCalledWith("SP", "São Paulo");
    expect(prismaMock.animal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ ...validBody, userId: USER_ID }),
    });
  });

  it("cria o anúncio com status padrão DISPONIVEL quando não informado", async () => {
    prismaMock.animal.create.mockResolvedValue(animal);

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("DISPONIVEL");
    expect(prismaMock.animal.create.mock.calls[0][0].data).not.toHaveProperty("status");
  });

  it("persiste a localização informada no cadastro", async () => {
    prismaMock.animal.create.mockResolvedValue(animal);

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ ...validBody, state: "rj", city: "Rio de Janeiro" });

    expect(response.status).toBe(201);
    expect(locationMocks.assertValidLocation).toHaveBeenCalledWith("RJ", "Rio de Janeiro");
    expect(prismaMock.animal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ state: "RJ", city: "Rio de Janeiro" }),
    });
  });

  it("rejeita localização incompatível antes de criar o anúncio", async () => {
    locationMocks.assertValidLocation.mockRejectedValue(
      new HttpError(400, 'A cidade "Santos" não pertence ao estado RJ.'),
    );

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ ...validBody, state: "RJ", city: "Santos" });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("não pertence ao estado RJ");
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });

  it("rejeita UF com formato inválido", async () => {
    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ ...validBody, state: "São Paulo" });

    expect(response.status).toBe(400);
    expect(locationMocks.assertValidLocation).not.toHaveBeenCalled();
  });

  it("rejeita status inválido no cadastro", async () => {
    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ ...validBody, status: "INVALIDO" });

    expect(response.status).toBe(400);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
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

});

describe("POST /api/animals (multipart com imagem)", () => {
  it("cadastra o animal com a imagem enviada", async () => {
    storageMocks.uploadAnimalImage.mockResolvedValue(UPLOADED_IMAGE);
    prismaMock.animal.create.mockResolvedValue({ ...animal, imageUrl: UPLOADED_IMAGE.url });

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field("name", "Rex")
      .field("species", "Cachorro")
      .field("breed", "SRD")
      .field("sex", "Macho")
      .field("size", "Medio")
      .field("description", "Cachorro dócil.")
      .field("whatsapp", "92999999999")
      .field("state", "SP")
      .field("city", "São Paulo")
      .attach("image", PNG_FILE, { filename: "rex.png", contentType: "image/png" });

    expect(response.status).toBe(201);
    expect(storageMocks.uploadAnimalImage).toHaveBeenCalledWith(
      expect.objectContaining({ size: PNG_FILE.length }),
    );
    expect(prismaMock.animal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Rex",
        userId: USER_ID,
        imageUrl: UPLOADED_IMAGE.url,
        imagePublicId: UPLOADED_IMAGE.publicId,
      }),
    });
    expect(response.body.imageUrl).toBe(UPLOADED_IMAGE.url);
  });

  it("cadastra sem imagem quando nenhum arquivo é enviado", async () => {
    prismaMock.animal.create.mockResolvedValue(animal);

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field(validBody);

    expect(response.status).toBe(201);
    expect(storageMocks.uploadAnimalImage).not.toHaveBeenCalled();
    expect(prismaMock.animal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ imageUrl: null, imagePublicId: null }),
    });
  });

  it("não cria o anúncio quando o arquivo é inválido", async () => {
    storageMocks.uploadAnimalImage.mockRejectedValue(
      new HttpError(400, "Formato de imagem não suportado. Use JPEG, PNG ou WebP."),
    );

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field(validBody)
      .attach("image", Buffer.from("<html>fake</html>"), {
        filename: "fake.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(400);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });

  it("descarta a imagem enviada quando a criação falha no banco", async () => {
    storageMocks.uploadAnimalImage.mockResolvedValue(UPLOADED_IMAGE);
    prismaMock.animal.create.mockRejectedValue(new Error("falha no banco"));

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field(validBody)
      .attach("image", PNG_FILE, { filename: "rex.png", contentType: "image/png" });

    expect(response.status).toBe(500);
    expect(storageMocks.deleteAnimalImage).toHaveBeenCalledWith(UPLOADED_IMAGE.publicId);
  });

  it("falha o upload e não cria o anúncio quando o armazenamento não está configurado", async () => {
    storageMocks.uploadAnimalImage.mockRejectedValue(
      new HttpError(503, "Serviço de imagens não configurado."),
    );

    const response = await request(app)
      .post("/api/animals")
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field(validBody)
      .attach("image", PNG_FILE, { filename: "rex.png", contentType: "image/png" });

    expect(response.status).toBe(503);
    expect(prismaMock.animal.create).not.toHaveBeenCalled();
  });
});

describe("PUT /api/animals/:id (imagem)", () => {
  it("substitui a imagem e descarta a antiga do armazenamento", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animalWithImage);
    storageMocks.uploadAnimalImage.mockResolvedValue(UPLOADED_IMAGE);
    prismaMock.animal.update.mockResolvedValue({ ...animalWithImage, imageUrl: UPLOADED_IMAGE.url });

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field("name", "Rex")
      .attach("image", PNG_FILE, { filename: "novo.png", contentType: "image/png" });

    expect(response.status).toBe(200);
    expect(prismaMock.animal.update).toHaveBeenCalledWith({
      where: { id: ANIMAL_ID },
      data: expect.objectContaining({
        imageUrl: UPLOADED_IMAGE.url,
        imagePublicId: UPLOADED_IMAGE.publicId,
      }),
    });
    expect(storageMocks.deleteAnimalImage).toHaveBeenCalledWith("adoteja/animals/antigo-public-id");
  });

  it("remove a imagem quando removeImage=true é enviado", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animalWithImage);
    prismaMock.animal.update.mockResolvedValue({ ...animalWithImage, imageUrl: null, imagePublicId: null });

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field("name", "Rex")
      .field("removeImage", "true");

    expect(response.status).toBe(200);
    expect(prismaMock.animal.update).toHaveBeenCalledWith({
      where: { id: ANIMAL_ID },
      data: expect.objectContaining({ imageUrl: null, imagePublicId: null }),
    });
    expect(storageMocks.deleteAnimalImage).toHaveBeenCalledWith("adoteja/animals/antigo-public-id");
  });

  it("mantém a imagem quando nenhum arquivo ou remoção é enviado", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animalWithImage);
    prismaMock.animal.update.mockResolvedValue(animalWithImage);

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ name: "Thor" });

    expect(response.status).toBe(200);
    expect(storageMocks.uploadAnimalImage).not.toHaveBeenCalled();
    expect(storageMocks.deleteAnimalImage).not.toHaveBeenCalled();
    expect(prismaMock.animal.update).toHaveBeenCalledWith({
      where: { id: ANIMAL_ID },
      data: expect.objectContaining({ name: "Thor" }),
    });
  });

  it("bloqueia a substituição de imagem de anúncio de terceiros", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(otherUsersAnimal);

    const response = await request(app)
      .put(`/api/animals/${otherUsersAnimal.id}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .field("name", "Thor")
      .attach("image", PNG_FILE, { filename: "novo.png", contentType: "image/png" });

    expect(response.status).toBe(403);
    // O upload nem chega a acontecer: a propriedade é verificada antes.
    expect(storageMocks.uploadAnimalImage).not.toHaveBeenCalled();
    expect(prismaMock.animal.update).not.toHaveBeenCalled();
    expect(storageMocks.deleteAnimalImage).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/animals/:id (imagem)", () => {
  it("remove o arquivo associado ao excluir o anúncio", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animalWithImage);
    prismaMock.animal.delete.mockResolvedValue(animalWithImage);

    const response = await request(app)
      .delete(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN);

    expect(response.status).toBe(204);
    expect(storageMocks.deleteAnimalImage).toHaveBeenCalledWith("adoteja/animals/antigo-public-id");
  });

  it("não remove imagem de anúncio de terceiros", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(otherUsersAnimal);

    const response = await request(app)
      .delete(`/api/animals/${otherUsersAnimal.id}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN);

    expect(response.status).toBe(403);
    expect(prismaMock.animal.delete).not.toHaveBeenCalled();
    expect(storageMocks.deleteAnimalImage).not.toHaveBeenCalled();
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

  it.each(["DISPONIVEL", "EM_PROCESSO", "ADOTADO"])(
    "persiste o status %s na atualização",
    async (status) => {
      prismaMock.animal.findUnique.mockResolvedValue(animal);
      prismaMock.animal.update.mockResolvedValue({ ...animal, status });

      const response = await request(app)
        .put(`/api/animals/${ANIMAL_ID}`)
        .set("Cookie", COOKIE)
        .set("Origin", ORIGIN)
        .send({ status });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(status);
      expect(prismaMock.animal.update).toHaveBeenCalledWith({
        where: { id: ANIMAL_ID },
        data: { status },
      });
      expect(locationMocks.assertValidLocation).not.toHaveBeenCalled();
    },
  );

  it("bloqueia a alteração de status de anúncio de outro usuário", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(otherUsersAnimal);

    const response = await request(app)
      .put(`/api/animals/${otherUsersAnimal.id}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ status: "ADOTADO" });

    expect(response.status).toBe(403);
    expect(prismaMock.animal.update).not.toHaveBeenCalled();
  });

  it("atualiza a localização do próprio anúncio", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);
    prismaMock.animal.update.mockResolvedValue({ ...animal, state: "RJ", city: "Niterói" });

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ state: "rj", city: "Niterói" });

    expect(response.status).toBe(200);
    expect(response.body.state).toBe("RJ");
    expect(response.body.city).toBe("Niterói");
    expect(locationMocks.assertValidLocation).toHaveBeenCalledWith("RJ", "Niterói");
    expect(prismaMock.animal.update).toHaveBeenCalledWith({
      where: { id: ANIMAL_ID },
      data: { state: "RJ", city: "Niterói" },
    });
  });

  it("rejeita localização incompatível na atualização", async () => {
    prismaMock.animal.findUnique.mockResolvedValue(animal);
    locationMocks.assertValidLocation.mockRejectedValue(
      new HttpError(400, 'A cidade "Santos" não pertence ao estado RJ.'),
    );

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ state: "RJ", city: "Santos" });

    expect(response.status).toBe(400);
    expect(prismaMock.animal.update).not.toHaveBeenCalled();
  });

  it("exige estado e cidade juntos na atualização", async () => {
    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ state: "SP" });

    expect(response.status).toBe(400);
    expect(prismaMock.animal.update).not.toHaveBeenCalled();
  });

  it("mantém compatibilidade com anúncio sem localização ao alterar apenas o status", async () => {
    const legacyAnimal = { ...animal, state: null, city: null };
    prismaMock.animal.findUnique.mockResolvedValue(legacyAnimal);
    prismaMock.animal.update.mockResolvedValue({ ...legacyAnimal, status: "ADOTADO" });

    const response = await request(app)
      .put(`/api/animals/${ANIMAL_ID}`)
      .set("Cookie", COOKIE)
      .set("Origin", ORIGIN)
      .send({ status: "ADOTADO" });

    expect(response.status).toBe(200);
    expect(response.body.state).toBeNull();
    expect(response.body.city).toBeNull();
    expect(locationMocks.assertValidLocation).not.toHaveBeenCalled();
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
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/api/auth/me"]).toBeUndefined();
    expect(response.body.paths["/auth/me"]).toBeDefined();
  });

  it("retorna 404 para rota inexistente", async () => {
    const response = await request(app).get("/api/nao-existe");

    expect(response.status).toBe(404);
  });
});
