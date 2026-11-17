import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../src/lib/http-error";
import {
  MAX_IMAGE_SIZE_BYTES,
  deleteAnimalImage,
  detectImageMimeType,
  uploadAnimalImage,
} from "../src/services/storage.service";

const PNG_FILE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const JPEG_FILE = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const WEBP_FILE = Buffer.concat([
  Buffer.from("RIFF", "ascii"),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP", "ascii"),
]);
const TEXT_FILE = Buffer.from("<html>conteudo falsificado</html>", "utf8");

const CLOUDINARY_ENV = {
  CLOUDINARY_CLOUD_NAME: "adoteja-teste",
  CLOUDINARY_API_KEY: "chave-de-teste",
  CLOUDINARY_API_SECRET: "segredo-de-teste",
};

describe("detectImageMimeType", () => {
  it("reconhece JPEG pelo magic bytes", () => {
    expect(detectImageMimeType(JPEG_FILE)).toBe("image/jpeg");
  });

  it("reconhece PNG pelo magic bytes", () => {
    expect(detectImageMimeType(PNG_FILE)).toBe("image/png");
  });

  it("reconhece WebP pelo magic bytes", () => {
    expect(detectImageMimeType(WEBP_FILE)).toBe("image/webp");
  });

  it("rejeita conteúdo que não é imagem", () => {
    expect(detectImageMimeType(TEXT_FILE)).toBeNull();
  });

  it("rejeita buffers vazios ou truncados", () => {
    expect(detectImageMimeType(Buffer.alloc(0))).toBeNull();
    expect(detectImageMimeType(PNG_FILE.subarray(0, 4))).toBeNull();
  });
});

describe("uploadAnimalImage", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejeita arquivos acima do limite", async () => {
    const bigFile = { buffer: PNG_FILE, size: MAX_IMAGE_SIZE_BYTES + 1 };

    await expect(uploadAnimalImage(bigFile)).rejects.toMatchObject({
      statusCode: 413,
      message: "A imagem deve ter no máximo 5 MB.",
    });
  });

  it("rejeita conteúdo que não é imagem", async () => {
    await expect(uploadAnimalImage({ buffer: TEXT_FILE, size: TEXT_FILE.length })).rejects.toMatchObject({
      statusCode: 400,
      message: "Formato de imagem não suportado. Use JPEG, PNG ou WebP.",
    });
  });

  it("informa que o serviço não está configurado quando faltam credenciais", async () => {
    for (const key of Object.keys(CLOUDINARY_ENV)) {
      vi.stubEnv(key, "");
    }

    await expect(uploadAnimalImage({ buffer: PNG_FILE, size: PNG_FILE.length })).rejects.toMatchObject({
      statusCode: 503,
    });
  });

  it("envia a imagem assinada e devolve URL e public_id", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", CLOUDINARY_ENV.CLOUDINARY_CLOUD_NAME);
    vi.stubEnv("CLOUDINARY_API_KEY", CLOUDINARY_ENV.CLOUDINARY_API_KEY);
    vi.stubEnv("CLOUDINARY_API_SECRET", CLOUDINARY_ENV.CLOUDINARY_API_SECRET);

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          secure_url: "https://res.cloudinary.com/adoteja-teste/image/upload/v1/adoteja/animals/x.png",
          public_id: "adoteja/animals/x",
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await uploadAnimalImage({ buffer: PNG_FILE, size: PNG_FILE.length });

    expect(result).toEqual({
      url: "https://res.cloudinary.com/adoteja-teste/image/upload/v1/adoteja/animals/x.png",
      publicId: "adoteja/animals/x",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/adoteja-teste/image/upload");

    const form = init.body as FormData;
    expect(form.get("api_key")).toBe(CLOUDINARY_ENV.CLOUDINARY_API_KEY);
    // Credencial privada nunca vai no corpo além do campo assinado.
    expect(String(form.get("signature"))).not.toContain(CLOUDINARY_ENV.CLOUDINARY_API_SECRET);
    // public_id é UUID: nome não previsível.
    expect(String(form.get("public_id"))).toMatch(/^adoteja\/animals\/[0-9a-f-]{36}$/);
  });

  it("falha com 502 quando o serviço de armazenamento responde erro", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", CLOUDINARY_ENV.CLOUDINARY_CLOUD_NAME);
    vi.stubEnv("CLOUDINARY_API_KEY", CLOUDINARY_ENV.CLOUDINARY_API_KEY);
    vi.stubEnv("CLOUDINARY_API_SECRET", CLOUDINARY_ENV.CLOUDINARY_API_SECRET);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("erro", { status: 500 })));

    await expect(uploadAnimalImage({ buffer: PNG_FILE, size: PNG_FILE.length })).rejects.toBeInstanceOf(
      HttpError,
    );
    await expect(
      uploadAnimalImage({ buffer: PNG_FILE, size: PNG_FILE.length }),
    ).rejects.toMatchObject({ statusCode: 502 });
  });

  it("falha com 502 quando não há conexão com o serviço", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", CLOUDINARY_ENV.CLOUDINARY_CLOUD_NAME);
    vi.stubEnv("CLOUDINARY_API_KEY", CLOUDINARY_ENV.CLOUDINARY_API_KEY);
    vi.stubEnv("CLOUDINARY_API_SECRET", CLOUDINARY_ENV.CLOUDINARY_API_SECRET);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    await expect(uploadAnimalImage({ buffer: PNG_FILE, size: PNG_FILE.length })).rejects.toMatchObject({
      statusCode: 502,
    });
  });
});

describe("deleteAnimalImage", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("não chama o serviço quando não há credenciais", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await deleteAnimalImage("adoteja/animals/x");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("chama o endpoint destroy e não propaga falhas", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", CLOUDINARY_ENV.CLOUDINARY_CLOUD_NAME);
    vi.stubEnv("CLOUDINARY_API_KEY", CLOUDINARY_ENV.CLOUDINARY_API_KEY);
    vi.stubEnv("CLOUDINARY_API_SECRET", CLOUDINARY_ENV.CLOUDINARY_API_SECRET);

    const fetchMock = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteAnimalImage("adoteja/animals/x")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((fetchMock.mock.calls[0][0] as string)).toContain("/image/destroy");
  });
});
