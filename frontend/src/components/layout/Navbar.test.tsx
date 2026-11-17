import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  state: {
    user: null as { id: string; name: string; email: string } | null,
    isAuthenticated: false,
    isLoading: false,
  },
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationMocks.push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => navigationMocks.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    ...authMocks.state,
    login: vi.fn(),
    register: vi.fn(),
    logout: authMocks.logout,
    refresh: vi.fn(),
  }),
}));

import { Navbar } from "./Navbar";

describe("Navbar", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/";
    navigationMocks.push.mockReset();
    authMocks.logout.mockReset();
    authMocks.state.user = null;
    authMocks.state.isAuthenticated = false;
    authMocks.state.isLoading = false;
  });

  it("exibe a marca, os links principais e os links de autenticação", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "AdoteJá — página inicial" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "AdoteJá" })).toHaveAttribute(
      "src",
      "/images/logo-adoteja.svg",
    );
    expect(screen.getByRole("link", { name: "Início" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Animais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
    expect(screen.queryByRole("link", { name: "Meus animais" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });

  it("marca o link ativo conforme a página atual", () => {
    navigationMocks.pathname = "/animais";
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Animais" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("oferece logout para usuário autenticado", async () => {
    authMocks.state.user = { id: "1", name: "João Silva", email: "joao@email.com" };
    authMocks.state.isAuthenticated = true;
    authMocks.logout.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<Navbar />);

    expect(screen.getByText("Olá, João")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meus animais" })).toHaveAttribute("href", "/meus-animais");
    expect(screen.getByRole("link", { name: "Meu perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(authMocks.logout).toHaveBeenCalledOnce();
    await waitFor(() => expect(navigationMocks.push).toHaveBeenCalledWith("/"));
  });

  it("não afirma que a sessão foi encerrada se o logout falhar", async () => {
    authMocks.state.user = { id: "1", name: "João Silva", email: "joao@email.com" };
    authMocks.state.isAuthenticated = true;
    authMocks.logout.mockRejectedValue(new Error("falha de rede"));

    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível encerrar a sessão");
    expect(navigationMocks.push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("abre e fecha o menu mobile", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const toggle = screen.getByRole("button", { name: "Abrir menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Navegação principal (mobile)" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
