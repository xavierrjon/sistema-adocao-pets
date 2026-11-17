import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import { makeAnimal } from "@/test/animals";
import MyAnimalsPage from "./page";

const navigationMocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/meus-animais",
  useSearchParams: () => navigationMocks.searchParams,
  useParams: () => ({}),
}));

const authMocks = vi.hoisted(() => ({
  state: {
    isAuthenticated: true,
    isLoading: false,
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Maria Silva", email: "maria@adoteja.test" },
    isAuthenticated: authMocks.state.isAuthenticated,
    isLoading: authMocks.state.isLoading,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/services/animals", () => ({
  listMyAnimals: vi.fn(),
  deleteAnimal: vi.fn(),
}));

import { deleteAnimal, listMyAnimals } from "@/services/animals";

const mockedListMyAnimals = vi.mocked(listMyAnimals);
const mockedDeleteAnimal = vi.mocked(deleteAnimal);

const animals = [
  makeAnimal({ id: "11111111-1111-4111-8111-111111111111", name: "Amber" }),
  makeAnimal({
    id: "22222222-2222-4222-8222-222222222222",
    name: "Toby",
    species: "Cachorro",
    breed: "Vira-lata",
    sex: "Macho",
    size: "Grande",
    status: "EM_PROCESSO",
  }),
];

beforeEach(() => {
  navigationMocks.searchParams = new URLSearchParams();
  authMocks.state.isAuthenticated = true;
  authMocks.state.isLoading = false;
  mockedDeleteAnimal.mockReset();
  mockedDeleteAnimal.mockResolvedValue(undefined);
  mockedListMyAnimals.mockReset();
  mockedListMyAnimals.mockResolvedValue(animals);
});

describe("Página Meus animais", () => {
  it("exibe o estado de carregamento enquanto busca os anúncios", () => {
    mockedListMyAnimals.mockReturnValue(new Promise(() => {}));

    render(<MyAnimalsPage />);

    expect(screen.getByText("Carregando seus animais...")).toBeInTheDocument();
  });

  it("lista os anúncios do usuário com ações de editar e excluir", async () => {
    render(<MyAnimalsPage />);

    expect(await screen.findByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.getByText("Em processo")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Editar anúncio de Amber" }),
    ).toHaveAttribute("href", `/meus-animais/${animals[0].id}/editar`);
    expect(
      screen.getByRole("button", { name: "Excluir anúncio de Toby" }),
    ).toBeInTheDocument();
  });

  it("exibe o estado vazio com acesso ao cadastro quando não há anúncios", async () => {
    mockedListMyAnimals.mockResolvedValue([]);

    render(<MyAnimalsPage />);

    expect(
      await screen.findByText("Você ainda não cadastrou nenhum animal"),
    ).toBeInTheDocument();
    const cadastrarLinks = screen.getAllByRole("link", { name: "Cadastrar animal" });
    expect(cadastrarLinks.length).toBeGreaterThan(0);
    for (const link of cadastrarLinks) {
      expect(link).toHaveAttribute("href", "/meus-animais/novo");
    }
  });

  it("exibe erro ao falhar o carregamento e permite tentar novamente", async () => {
    mockedListMyAnimals.mockRejectedValueOnce(new Error("fetch failed"));

    render(<MyAnimalsPage />);

    expect(
      await screen.findByText("Não foi possível carregar seus animais."),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Amber")).toBeInTheDocument();
    expect(mockedListMyAnimals).toHaveBeenCalledTimes(2);
  });

  it("exibe o feedback de sucesso vindo da navegação", async () => {
    navigationMocks.searchParams = new URLSearchParams("feedback=cadastrado");

    render(<MyAnimalsPage />);

    expect(
      await screen.findByText("Animal cadastrado com sucesso."),
    ).toBeInTheDocument();
  });

  it("abre a confirmação identificando o animal e permite cancelar", async () => {
    const user = userEvent.setup();
    render(<MyAnimalsPage />);

    await screen.findByText("Amber");
    await user.click(screen.getByRole("button", { name: "Excluir anúncio de Amber" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Excluir anúncio")).toBeInTheDocument();
    expect(within(dialog).getByText(/excluir o anúncio de/)).toBeInTheDocument();
    expect(within(dialog).getByText("Amber")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(mockedDeleteAnimal).not.toHaveBeenCalled();
    expect(screen.getByText("Amber")).toBeInTheDocument();
  });

  it("exclui o anúncio após confirmação e atualiza a listagem", async () => {
    const user = userEvent.setup();
    render(<MyAnimalsPage />);

    await screen.findByText("Amber");
    await user.click(screen.getByRole("button", { name: "Excluir anúncio de Amber" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(mockedDeleteAnimal).toHaveBeenCalledWith(animals[0].id);
    await waitFor(() => {
      expect(screen.queryByText("Amber")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.getByText("Anúncio excluído com sucesso.")).toBeInTheDocument();
  });

  it("exibe erro dentro do diálogo quando a exclusão falha e mantém o anúncio", async () => {
    mockedDeleteAnimal.mockRejectedValue(
      new ApiError("Você não tem permissão para excluir este animal.", 403),
    );

    const user = userEvent.setup();
    render(<MyAnimalsPage />);

    await screen.findByText("Amber");
    await user.click(screen.getByRole("button", { name: "Excluir anúncio de Amber" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    expect(
      await within(dialog).findByText("Você não tem permissão para excluir este animal."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Amber" })).toBeInTheDocument();
  });

  it("exibe mensagem de sessão expirada quando a exclusão retorna 401", async () => {
    mockedDeleteAnimal.mockRejectedValueOnce(
      new ApiError("Autenticação necessária.", 401),
    );

    const user = userEvent.setup();
    render(<MyAnimalsPage />);

    await screen.findByText("Amber");
    await user.click(screen.getByRole("button", { name: "Excluir anúncio de Amber" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    expect(
      await within(dialog).findByText("Sua sessão expirou. Faça login novamente para excluir o anúncio."),
    ).toBeInTheDocument();
  });

  it("evita exclusões duplicadas enquanto a operação está em andamento", async () => {
    let resolveDelete!: () => void;
    mockedDeleteAnimal.mockReturnValue(new Promise<void>((resolve) => (resolveDelete = resolve)));

    const user = userEvent.setup();
    render(<MyAnimalsPage />);

    await screen.findByText("Amber");
    await user.click(screen.getByRole("button", { name: "Excluir anúncio de Amber" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    const deletingButton = within(dialog).getByRole("button", { name: "Excluindo..." });
    expect(deletingButton).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeDisabled();

    await user.click(deletingButton);
    expect(mockedDeleteAnimal).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete();
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("redireciona para o login quando o visitante não está autenticado", () => {
    authMocks.state.isAuthenticated = false;
    mockedListMyAnimals.mockReturnValue(new Promise(() => {}));

    render(<MyAnimalsPage />);

    expect(screen.queryByText("Meus animais")).not.toBeInTheDocument();
  });
});
