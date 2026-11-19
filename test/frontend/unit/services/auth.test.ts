import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import { getCurrentUser, login, logout, register } from "@/services/auth";

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const user = { id: "1", name: "João Silva", email: "joao@email.com" };

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("serviço de autenticação", () => {
  it("cadastra usuário enviando JSON para a API", async () => {
    fetchMock.mockResolvedValue(jsonResponse(user, 201));

    const result = await register({ name: "João Silva", email: "joao@email.com", password: "SenhaSegura123" });

    expect(result).toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name: "João Silva",
          email: "joao@email.com",
          password: "SenhaSegura123",
        }),
      }),
    );
  });

  it("envia rememberMe no login e mantém cookies habilitados", async () => {
    fetchMock.mockResolvedValue(jsonResponse(user));

    await login({ email: user.email, password: "SenhaSegura123", rememberMe: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: user.email,
          password: "SenhaSegura123",
          rememberMe: true,
        }),
      }),
    );
  });

  it("recupera o usuário atual sem gravar tokens no navegador", async () => {
    fetchMock.mockResolvedValue(jsonResponse(user));

    expect(await getCurrentUser()).toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/me",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it("encerra a sessão na API", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Sessão encerrada." }));

    expect(await logout()).toEqual({ message: "Sessão encerrada." });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  it("padroniza erros da API", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "E-mail ou senha inválidos." }, 401));

    await expect(login({ email: user.email, password: "errada" })).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "E-mail ou senha inválidos.",
    } satisfies Partial<ApiError>);
  });
});
