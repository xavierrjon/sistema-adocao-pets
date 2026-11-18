import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import { makeAnimal } from "@/test/animals";
import AnimalDetailsPage from "./page";

const navigationMocks = vi.hoisted(() => ({
  id: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01",
}));

const authMocks = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    isLoading: false,
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: navigationMocks.id }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    ...authMocks.state,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/services/animals", () => ({ getAnimalById: vi.fn() }));

import { getAnimalById } from "@/services/animals";

const mockedGetAnimalById = vi.mocked(getAnimalById);
const animal = makeAnimal();

describe("Página de detalhes do animal", () => {
  beforeEach(() => {
    navigationMocks.id = animal.id;
    authMocks.state.isAuthenticated = false;
    authMocks.state.isLoading = false;
    mockedGetAnimalById.mockReset();
    mockedGetAnimalById.mockResolvedValue(animal);
  });

  it("exibe os dados do animal retornados pela API", async () => {
    render(<AnimalDetailsPage />);

    expect(screen.getByText("Carregando animais...")).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: "Amber", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Disponível para adoção")).toBeInTheDocument();
    expect(screen.getByText("Femea")).toBeInTheDocument();
    expect(screen.getByText("Medio")).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("São Paulo - SP")).toBeInTheDocument();
    expect(screen.queryByText("31999999999")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sobre Amber" })).toBeInTheDocument();
    expect(mockedGetAnimalById).toHaveBeenCalledWith(animal.id);
  });

  it("exige login para adotar e preserva o animal como destino", async () => {
    render(<AnimalDetailsPage />);

    await screen.findByRole("heading", { name: "Amber", level: 1 });
    expect(
      screen.getByText("Entre na sua conta para entrar em contato com o responsável por este animal."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(`/animais/${animal.id}`)}`,
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      `/cadastro?next=${encodeURIComponent(`/animais/${animal.id}`)}`,
    );
  });

  it("linka de volta para a listagem", async () => {
    render(<AnimalDetailsPage />);

    await screen.findByRole("heading", { name: "Amber", level: 1 });
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/animais");
  });

  it("exibe estado de não encontrado quando a API retorna 404", async () => {
    mockedGetAnimalById.mockRejectedValue(new ApiError("Animal não encontrado.", 404));
    render(<AnimalDetailsPage />);

    expect(await screen.findByRole("heading", { name: "Animal não encontrado" })).toBeInTheDocument();
  });

  it("exibe erro de comunicação e permite tentar novamente", async () => {
    const user = userEvent.setup();
    mockedGetAnimalById
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce(animal);
    render(<AnimalDetailsPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Não foi possível carregar os detalhes do animal.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("fetch failed")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("heading", { name: "Amber", level: 1 })).toBeInTheDocument();
    expect(mockedGetAnimalById).toHaveBeenCalledTimes(2);
  });
});
