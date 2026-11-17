import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAnimal } from "@/test/animals";
import AnimaisPage from "./page";

vi.mock("@/services/animals", () => ({ getAnimals: vi.fn() }));

import { getAnimals } from "@/services/animals";
import type { Animal } from "@/types/animal";

const mockedGetAnimals = vi.mocked(getAnimals);

const animals: Animal[] = [
  makeAnimal({ id: "1", name: "Amber", species: "Gato", breed: "SRD" }),
  makeAnimal({ id: "2", name: "Toby", species: "Cachorro", breed: "Vira-lata" }),
  makeAnimal({
    id: "3",
    name: "Mel",
    species: "Cachorro",
    breed: "Shih Tzu",
    status: "EM_PROCESSO",
  }),
];

describe("Página de animais", () => {
  beforeEach(() => {
    mockedGetAnimals.mockReset();
    mockedGetAnimals.mockResolvedValue(animals);
  });

  it("exibe o título e os filtros", async () => {
    render(<AnimaisPage />);

    expect(screen.getByRole("heading", { name: "Animais para adoção" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Todos/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cães/ })).toBeInTheDocument();
  });

  it("carrega os animais retornados pela API", async () => {
    let resolveRequest!: (value: Animal[]) => void;
    mockedGetAnimals.mockReturnValue(new Promise<Animal[]>((resolve) => (resolveRequest = resolve)));

    render(<AnimaisPage />);

    expect(screen.getByText("Carregando animais...")).toBeInTheDocument();

    await act(async () => {
      resolveRequest(animals);
    });

    expect(await screen.findByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("3 animais encontrados");
    expect(mockedGetAnimals).toHaveBeenCalledTimes(1);
  });

  it("filtra os animais por categoria", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.click(screen.getByRole("button", { name: /Gatos/ }));

    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.queryByText("Toby")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado");
  });

  it("filtra os animais pela busca", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Amber");

    const input = screen.getByLabelText("Buscar por nome, raça ou espécie");
    await user.type(input, "Toby");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado");
    });
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
  });

  it("exibe o estado vazio quando a API retorna uma lista vazia", async () => {
    mockedGetAnimals.mockResolvedValue([]);
    render(<AnimaisPage />);

    expect(await screen.findByText("Ainda não há animais cadastrados")).toBeInTheDocument();
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
  });

  it("exibe o estado vazio quando nenhum animal corresponde aos filtros", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Amber");

    const input = screen.getByLabelText("Buscar por nome, raça ou espécie");
    await user.type(input, "zzz");

    expect(await screen.findByText("Nenhum animal encontrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeInTheDocument();
  });

  it("exibe mensagem de erro sem expor detalhes técnicos", async () => {
    mockedGetAnimals.mockRejectedValue(new Error("fetch failed: 500"));
    render(<AnimaisPage />);

    expect(await screen.findByText("Não foi possível carregar os animais.")).toBeInTheDocument();
    expect(screen.queryByText("fetch failed")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
