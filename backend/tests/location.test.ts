import { afterEach, describe, expect, it, vi } from "vitest";

function jsonResponse(data: unknown): Response {
  return { ok: true, json: async () => data } as Response;
}

function errorResponse(): Response {
  return { ok: false, json: async () => ({}) } as Response;
}

/** Cada teste importa o módulo novamente para evitar o cache compartilhado. */
async function loadLocationService() {
  vi.resetModules();
  return import("../src/services/location.service");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("serviço de localização (IBGE)", () => {
  it("aceita uma cidade válida mesmo com caixa e acentos diferentes", async () => {
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = String(input);

      if (url.includes("/estados?")) {
        return Promise.resolve(jsonResponse([{ sigla: "SP" }, { sigla: "RJ" }]));
      }

      if (url.includes("/SP/municipios")) {
        return Promise.resolve(jsonResponse([{ nome: "São Paulo" }, { nome: "Campinas" }]));
      }

      return Promise.resolve(errorResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    const { assertValidLocation } = await loadLocationService();

    await expect(assertValidLocation("SP", "sao paulo")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejeita UF inexistente sem consultar os municípios", async () => {
    const fetchMock = vi.fn((input: string | URL | Request) => {
      if (String(input).includes("/estados?")) {
        return Promise.resolve(jsonResponse([{ sigla: "SP" }]));
      }
      return Promise.resolve(errorResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    const { assertValidLocation } = await loadLocationService();

    await expect(assertValidLocation("XX", "São Paulo")).rejects.toMatchObject({
      statusCode: 400,
      message: "Estado XX não é uma UF válida.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejeita cidade que não pertence à UF informada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string | URL | Request) => {
        const url = String(input);

        if (url.includes("/estados?")) {
          return Promise.resolve(jsonResponse([{ sigla: "RJ" }]));
        }

        if (url.includes("/RJ/municipios")) {
          return Promise.resolve(jsonResponse([{ nome: "Rio de Janeiro" }, { nome: "Niterói" }]));
        }

        return Promise.resolve(errorResponse());
      }),
    );

    const { assertValidLocation } = await loadLocationService();

    await expect(assertValidLocation("RJ", "Santos")).rejects.toMatchObject({
      statusCode: 400,
      message: 'A cidade "Santos" não pertence ao estado RJ.',
    });
  });

  it("retorna 503 quando o IBGE não responde", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("rede indisponível"))));

    const { assertValidLocation } = await loadLocationService();

    await expect(assertValidLocation("SP", "São Paulo")).rejects.toMatchObject({ statusCode: 503 });
  });

  it("reutiliza o cache de estados e municípios entre validações", async () => {
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = String(input);

      if (url.includes("/estados?")) {
        return Promise.resolve(jsonResponse([{ sigla: "SP" }]));
      }

      if (url.includes("/SP/municipios")) {
        return Promise.resolve(jsonResponse([{ nome: "São Paulo" }]));
      }

      return Promise.resolve(errorResponse());
    });
    vi.stubGlobal("fetch", fetchMock);

    const { assertValidLocation } = await loadLocationService();

    await assertValidLocation("SP", "São Paulo");
    await assertValidLocation("SP", "sao paulo");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
