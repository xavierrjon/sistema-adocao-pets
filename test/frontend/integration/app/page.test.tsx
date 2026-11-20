import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAnimal } from "@test/fixtures/animals";
import Home from "@/app/page";

vi.mock("@/services/animals", () => ({ getAnimals: vi.fn() }));

import { getAnimals } from "@/services/animals";

const mockedGetAnimals = vi.mocked(getAnimals);

describe("Home", () => {
  beforeEach(() => {
    mockedGetAnimals.mockReset();
    mockedGetAnimals.mockResolvedValue([
      makeAnimal({ id: "1", name: "Amber", species: "Gato", status: "DISPONIVEL" }),
      makeAnimal({ id: "2", name: "Toby", species: "Cachorro", status: "DISPONIVEL" }),
      makeAnimal({ id: "3", name: "Mel", status: "EM_PROCESSO" }),
      makeAnimal({ id: "4", name: "Bidu", status: "ADOTADO" }),
    ]);
  });

  it("exibe a mensagem principal do hero", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Encontre um novo companheiro que precisa de um lar",
    );
    expect(
      screen.getByRole("link", { name: "Encontrar animais 🐾" }),
    ).toHaveAttribute("href", "/animais");
  });

  it("exibe a busca e as categorias", () => {
    render(<Home />);

    expect(screen.getByRole("search")).toBeInTheDocument();
    for (const category of ["Todos", "Cães", "Gatos", "Aves", "Outros"]) {
      expect(screen.getByRole("link", { name: new RegExp(category) })).toBeInTheDocument();
    }
  });

  it("carrega os animais automaticamente, sem interação do usuário", async () => {
    render(<Home />);

    // A listagem dispara a requisição por conta própria, sem "Buscar" ou "Ver todos".
    expect(mockedGetAnimals).toHaveBeenCalledTimes(1);
    expect(mockedGetAnimals).toHaveBeenCalledWith();

    await waitFor(() => {
      expect(screen.getByText("Amber")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "Ver detalhes de Amber" })).toHaveAttribute(
      "href",
      "/animais/1",
    );
  });

  it("exibe skeletons durante o carregamento automático", () => {
    mockedGetAnimals.mockReturnValue(new Promise(() => {}));

    render(<Home />);

    expect(screen.getByText("Carregando animais...")).toBeInTheDocument();
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
  });

  it("exibe apenas animais disponíveis nos destaques", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Amber")).toBeInTheDocument();
    });
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.queryByText("Mel")).not.toBeInTheDocument();
    expect(screen.queryByText("Bidu")).not.toBeInTheDocument();
  });

  it("mantém a home disponível quando a API falha", async () => {
    mockedGetAnimals.mockRejectedValue(new Error("API indisponível"));

    render(<Home />);

    await waitFor(() => {
      expect(mockedGetAnimals).toHaveBeenCalled();
    });
    // A página continua renderizada; apenas a listagem fica vazia.
    expect(screen.getByRole("search")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Carregando animais...")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
  });
});
