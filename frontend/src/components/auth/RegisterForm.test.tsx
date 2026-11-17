import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: mocks.register,
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/cadastro",
  useSearchParams: () => new URLSearchParams(),
}));

import { RegisterForm } from "./RegisterForm";

beforeEach(() => {
  mocks.register.mockReset();
  mocks.push.mockReset();
});

function fillValidForm(event: ReturnType<typeof userEvent.setup>) {
  return event.type(screen.getByLabelText("Nome completo"), "João Silva")
    .then(() => event.type(screen.getByLabelText("E-mail"), "joao@email.com"))
    .then(() => event.type(screen.getByLabelText("Senha"), "SenhaSegura123"))
    .then(() => event.type(screen.getByLabelText("Confirmar senha"), "SenhaSegura123"));
}

describe("RegisterForm", () => {
  it("renderiza todos os campos e o link para login", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("Confirmar senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Criar conta" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
  });

  it("valida campos obrigatórios, e-mail e confirmação de senha", async () => {
    const event = userEvent.setup();
    render(<RegisterForm />);

    await event.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Informe seu nome completo.")).toBeInTheDocument();
    expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Crie uma senha.")).toBeInTheDocument();
    expect(screen.getByText("Confirme sua senha.")).toBeInTheDocument();

    await event.clear(screen.getByLabelText("E-mail"));
    await event.type(screen.getByLabelText("E-mail"), "invalido");
    await event.type(screen.getByLabelText("Senha"), "SenhaSegura123");
    await event.type(screen.getByLabelText("Confirmar senha"), "OutraSenha123");
    await event.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it("cadastra e encaminha para o login preservando o destino", async () => {
    mocks.register.mockResolvedValue(undefined);
    const event = userEvent.setup();
    render(<RegisterForm nextPath="/meus-animais" />);

    await fillValidForm(event);
    await event.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() =>
      expect(mocks.register).toHaveBeenCalledWith({
        name: "João Silva",
        email: "joao@email.com",
        password: "SenhaSegura123",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/login?next=%2Fmeus-animais");
  });

  it("mostra erro específico para e-mail já cadastrado", async () => {
    mocks.register.mockRejectedValue(new ApiError(409, "E-mail já cadastrado."));
    const event = userEvent.setup();
    render(<RegisterForm />);

    await fillValidForm(event);
    await event.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Este e-mail já está cadastrado.")).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("alterna a visibilidade da senha e da confirmação", async () => {
    const event = userEvent.setup();
    render(<RegisterForm />);

    await event.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");

    await event.click(screen.getByRole("button", { name: "Mostrar confirmação" }));
    expect(screen.getByLabelText("Confirmar senha")).toHaveAttribute("type", "text");

    await event.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
  });
});
