import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAnimals } from "@/services/animals";

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse([]));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("serviço de animais", () => {
  it("busca a listagem sem parâmetros quando não há filtros", async () => {
    await getAnimals();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/animals",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("envia pesquisa e filtros na mesma consulta", async () => {
    await getAnimals({
      q: "  gato  ",
      species: "Gato",
      sex: "Femea",
      size: "Medio",
      status: "ADOTADO",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/animals?q=gato&species=Gato&sex=Femea&size=Medio&status=ADOTADO",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("ignora valores vazios", async () => {
    await getAnimals({ q: "   ", species: "", sex: "", size: "", status: undefined });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/animals",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
