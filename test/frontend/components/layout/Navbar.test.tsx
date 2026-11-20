import { render, screen, waitFor, within } from "@testing-library/react";
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

import { Navbar } from "@/components/layout/Navbar";

function authenticate(name = "João Silva") {
  authMocks.state.user = { id: "1", name, email: "joao@email.com" };
  authMocks.state.isAuthenticated = true;
}

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
    const logo = screen.getByRole("img", { name: "AdoteJá" });
    expect(logo).toHaveAttribute("src", "/images/logo-adoteja.svg");
    expect(logo).toHaveClass("h-21");
    expect(screen.getByRole("link", { name: "Início" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Animais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
    expect(screen.queryByRole("link", { name: "Meus animais" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Abrir menu do usuário/ })).not.toBeInTheDocument();
  });

  it("marca o link ativo conforme a página atual", () => {
    navigationMocks.pathname = "/animais";
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Animais" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("coloca Meus animais na navegação principal quando logado", () => {
    authenticate();
    render(<Navbar />);

    const mainNav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(within(mainNav).getByRole("link", { name: "Meus animais" })).toHaveAttribute(
      "href",
      "/meus-animais",
    );
    expect(within(mainNav).getByRole("link", { name: "Início" })).toBeInTheDocument();
    expect(within(mainNav).getByRole("link", { name: "Animais" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });

  it("oferece logout dentro do menu do usuário", async () => {
    authenticate();
    authMocks.logout.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<Navbar />);

    expect(screen.getByText("Olá, João")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Olá, João/ }));

    expect(screen.getByRole("link", { name: "Meu perfil" })).toHaveAttribute("href", "/perfil");
    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(authMocks.logout).toHaveBeenCalledOnce();
    await waitFor(() => expect(navigationMocks.push).toHaveBeenCalledWith("/"));
  });

  it("deixa apenas Meu perfil e Sair dentro do dropdown", async () => {
    authenticate("Johnny Silva");

    const user = userEvent.setup();
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Meus animais" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();

    const accountButton = screen.getByRole("button", { name: /Olá, Johnny/ });
    await user.click(accountButton);

    expect(accountButton).toHaveAttribute("aria-expanded", "true");
    const accountMenu = screen.getByRole("navigation", { name: "Menu do usuário" });
    expect(within(accountMenu).getByRole("link", { name: "Meu perfil" })).toBeInTheDocument();
    expect(within(accountMenu).getByRole("button", { name: "Sair" })).toBeInTheDocument();
    expect(within(accountMenu).queryByRole("link", { name: "Meus animais" })).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(accountButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Meu perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meus animais" })).toBeInTheDocument();
  });

  it("não afirma que a sessão foi encerrada se o logout falhar", async () => {
    authenticate();
    authMocks.logout.mockRejectedValue(new Error("falha de rede"));

    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: /Olá, João/ }));
    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível encerrar a sessão");
    expect(navigationMocks.push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("mantém Meus animais no menu mobile e abre o dropdown pelo avatar", async () => {
    authenticate();
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Abrir menu" }));

    const mobileNav = screen.getByRole("navigation", { name: "Navegação principal (mobile)" });
    expect(within(mobileNav).getByRole("link", { name: "Meus animais" })).toBeInTheDocument();
    expect(within(mobileNav).queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Olá, João/ }));

    const accountMenu = screen.getByRole("navigation", { name: "Menu do usuário" });
    expect(within(accountMenu).getByRole("link", { name: "Meu perfil" })).toBeInTheDocument();
    expect(within(accountMenu).getByRole("button", { name: "Sair" })).toBeInTheDocument();
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
