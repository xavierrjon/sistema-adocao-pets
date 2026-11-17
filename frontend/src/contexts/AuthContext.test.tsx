import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/services/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
  login: mocks.login,
  logout: mocks.logout,
  register: vi.fn(),
}));

import { AuthProvider, useAuth } from "./AuthContext";

const user = { id: "1", name: "João Silva", email: "joao@email.com" };

function Consumer() {
  const { user: currentUser, isAuthenticated, isLoading, login, logout } = useAuth();
  const [actionError, setActionError] = React.useState<string | null>(null);

  return (
    <div>
      <span data-testid="status">
        {isLoading ? "loading" : isAuthenticated ? "authenticated" : "anonymous"}
      </span>
      <span data-testid="name">{currentUser?.name ?? ""}</span>
      <button
        type="button"
        onClick={() => {
          setActionError(null);
          void login({ email: user.email, password: "SenhaSegura123" }).catch(
            () => setActionError("falha no login"),
          );
        }}
      >
        Entrar
      </button>
      <button
        type="button"
        onClick={() => {
          setActionError(null);
          void logout().catch(() => setActionError("falha no logout"));
        }}
      >
        Sair
      </button>
      {actionError ? <span data-testid="action-error">{actionError}</span> : null}
    </div>
  );
}

beforeEach(() => {
  mocks.getCurrentUser.mockReset();
  mocks.login.mockReset();
  mocks.logout.mockReset();
});

describe("AuthProvider", () => {
  it("recupera a sessão ao inicializar e expõe o usuário autenticado", async () => {
    mocks.getCurrentUser.mockResolvedValue(user);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    expect(await screen.findByTestId("status")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("name")).toHaveTextContent("João Silva");
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce();
  });

  it("considera usuário não autenticado quando não há sessão", async () => {
    mocks.getCurrentUser.mockRejectedValue(new ApiError(401, "Sessão inválida."));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId("status")).toHaveTextContent("anonymous");
  });

  it("consulta a sessão apenas uma vez", async () => {
    mocks.getCurrentUser.mockResolvedValue(user);

    const { rerender } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await screen.findByTestId("status");
    rerender(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(mocks.getCurrentUser).toHaveBeenCalledOnce();
  });

  it("atualiza o estado após login e limpa após logout", async () => {
    mocks.getCurrentUser.mockRejectedValue(new ApiError(401, "Sem sessão."));
    mocks.login.mockResolvedValue(user);
    mocks.logout.mockResolvedValue({ message: "Sessão encerrada." });

    const event = userEvent.setup();
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("anonymous"));
    await event.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByTestId("status")).toHaveTextContent("authenticated");

    await event.click(screen.getByRole("button", { name: "Sair" }));
    expect(await screen.findByTestId("status")).toHaveTextContent("anonymous");
  });

  it("mantém o estado autenticado se o logout falhar", async () => {
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.logout.mockRejectedValue(new ApiError(0, "Não foi possível conectar ao servidor."));

    const event = userEvent.setup();
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId("status")).toHaveTextContent("authenticated");
    await event.click(screen.getByRole("button", { name: "Sair" }));

    expect(await screen.findByTestId("action-error")).toHaveTextContent("falha no logout");
    expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
  });
});
