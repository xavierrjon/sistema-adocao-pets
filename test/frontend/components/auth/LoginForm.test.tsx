import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mocks.login,
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

import { LoginForm } from "@/components/auth/LoginForm";

const user = { id: "1", name: "João Silva", email: "joao@email.com" };

beforeEach(() => {
  mocks.login.mockReset();
  mocks.push.mockReset();
});

describe("LoginForm", () => {
  it("renderiza os campos e as ações esperadas", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("checkbox", { name: "Lembrar de mim" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute("href", "/cadastro");
    expect(screen.queryByText("Esqueceu a senha?")).not.toBeInTheDocument();
  });

  it("valida campos vazios e e-mail inválido", async () => {
    const event = userEvent.setup();
    render(<LoginForm />);

    await event.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();

    await event.type(screen.getByLabelText("E-mail"), "invalido");
    await event.type(screen.getByLabelText("Senha"), "SenhaSegura123");
    await event.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
  });

  it("mostra e oculta a senha", async () => {
    const event = userEvent.setup();
    render(<LoginForm />);

    const password = screen.getByLabelText("Senha");
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });

    expect(password).toHaveAttribute("type", "password");
    await event.click(toggle);
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");
  });

  it("envia credenciais com rememberMe e redireciona para o destino preservado", async () => {
    mocks.login.mockResolvedValue(user);
    const event = userEvent.setup();
    render(<LoginForm nextPath="/animais/cadastrar" />);

    await event.type(screen.getByLabelText("E-mail"), "  joao@email.com  ");
    await event.type(screen.getByLabelText("Senha"), "SenhaSegura123");
    await event.click(screen.getByRole("checkbox", { name: "Lembrar de mim" }));
    await event.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(mocks.login).toHaveBeenCalledWith({
        email: "joao@email.com",
        password: "SenhaSegura123",
        rememberMe: true,
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/animais/cadastrar");
  });

  it("exibe mensagem genérica para credenciais inválidas", async () => {
    mocks.login.mockRejectedValue(new ApiError("E-mail ou senha inválidos.", 401));
    const event = userEvent.setup();
    render(<LoginForm />);

    await event.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await event.type(screen.getByLabelText("Senha"), "SenhaSegura123");
    await event.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("impede envios repetidos durante o carregamento", async () => {
    let resolveLogin: ((value: typeof user) => void) | undefined;
    mocks.login.mockImplementation(
      () => new Promise<typeof user>((resolve) => { resolveLogin = resolve; }),
    );

    const event = userEvent.setup();
    render(<LoginForm />);

    await event.type(screen.getByLabelText("E-mail"), "joao@email.com");
    await event.type(screen.getByLabelText("Senha"), "SenhaSegura123");
    await event.click(screen.getByRole("button", { name: "Entrar" }));

    const submitting = await screen.findByRole("button", { name: "Entrando..." });
    expect(submitting).toBeDisabled();
    expect(mocks.login).toHaveBeenCalledOnce();

    resolveLogin?.(user);
    await waitFor(() => expect(mocks.push).toHaveBeenCalled());
  });
});
