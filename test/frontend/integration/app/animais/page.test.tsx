import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAnimal } from "@test/fixtures/animals";
import AnimaisPage from "@/app/animais/page";

vi.mock("@/services/animals", () => ({ getAnimals: vi.fn() }));

import { getAnimals, type AnimalListFilters } from "@/services/animals";
import type { Animal } from "@/types/animal";

const mockedGetAnimals = vi.mocked(getAnimals);

const animals: Animal[] = [
  makeAnimal({ id: "1", name: "Amber", species: "Gato", breed: "SRD", sex: "Femea", size: "Medio" }),
  makeAnimal({
    id: "2",
    name: "Toby",
    species: "Cachorro",
    breed: "Vira-lata",
    sex: "Macho",
    size: "Grande",
  }),
  makeAnimal({
    id: "3",
    name: "Mel",
    species: "Cachorro",
    breed: "Shih Tzu",
    sex: "Femea",
    size: "Pequeno",
    status: "EM_PROCESSO",
  }),
];

/** Reproduz no teste o contrato de pesquisa e filtros do backend. */
function filterAnimals(filters: AnimalListFilters = {}): Animal[] {
  const query = filters.q?.toLowerCase();
  const status = filters.status ?? "DISPONIVEL";

  return animals.filter((animal) => {
    if (animal.status !== status) return false;

    if (filters.species === "Outro") {
      if (["Cachorro", "Gato"].includes(animal.species)) return false;
    } else if (filters.species && animal.species !== filters.species) {
      return false;
    }

    if (filters.sex && animal.sex !== filters.sex) return false;
    if (filters.size && animal.size !== filters.size) return false;

    if (query) {
      const searchable = [animal.name, animal.species, animal.breed, animal.description]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

function lastFilters(): AnimalListFilters {
  return mockedGetAnimals.mock.calls.at(-1)?.[0] ?? {};
}

describe("Página de animais", () => {
  beforeEach(() => {
    mockedGetAnimals.mockReset();
    mockedGetAnimals.mockImplementation(async (filters) => filterAnimals(filters));
  });

  it("exibe o título, a busca e os controles de filtro", async () => {
    render(<AnimaisPage />);

    expect(screen.getByRole("heading", { name: "Animais para adoção" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Todos/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cães/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gatos/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Sexo")).toBeInTheDocument();
    expect(screen.getByLabelText("Porte")).toBeInTheDocument();
    expect(screen.getByLabelText("Status de adoção")).toBeInTheDocument();
  });

  it("carrega os animais disponíveis retornados pela API", async () => {
    let resolveRequest!: (value: Animal[]) => void;
    mockedGetAnimals.mockReturnValue(new Promise<Animal[]>((resolve) => (resolveRequest = resolve)));

    render(<AnimaisPage />);

    expect(screen.getByText("Carregando animais...")).toBeInTheDocument();

    await act(async () => {
      resolveRequest(filterAnimals());
    });

    expect(await screen.findByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.queryByText("Mel")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("2 animais encontrados");
    expect(mockedGetAnimals).toHaveBeenCalledTimes(1);
    expect(lastFilters()).toEqual({ status: "DISPONIVEL" });
  });

  it("filtra os animais por categoria usando a API", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.click(screen.getByRole("button", { name: /Gatos/ }));

    await screen.findByText("Amber");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));
    expect(screen.queryByText("Toby")).not.toBeInTheDocument();
    expect(lastFilters()).toEqual({ species: "Gato", status: "DISPONIVEL" });
  });

  it("pesquisa pela API após o debounce", async () => {
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
    expect(lastFilters()).toEqual({ q: "Toby", status: "DISPONIVEL" });
  });

  it("combina espécie, sexo e porte na mesma consulta", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.click(screen.getByRole("button", { name: /Cães/ }));
    await user.selectOptions(screen.getByLabelText("Sexo"), "Macho");
    await user.selectOptions(screen.getByLabelText("Porte"), "Grande");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado");
    });
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
    expect(lastFilters()).toEqual({
      species: "Cachorro",
      sex: "Macho",
      size: "Grande",
      status: "DISPONIVEL",
    });
  });

  it("filtra por status e remove o filtro individualmente", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.selectOptions(screen.getByLabelText("Status de adoção"), "EM_PROCESSO");

    expect(await screen.findByText("Mel")).toBeInTheDocument();
    expect(screen.queryByText("Toby")).not.toBeInTheDocument();
    expect(screen.getByText("Status: Em processo")).toBeInTheDocument();
    expect(lastFilters()).toEqual({ status: "EM_PROCESSO" });

    await user.click(screen.getByRole("button", { name: "Remover filtro Status" }));

    await screen.findByText("Toby");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 animais encontrados"));
    expect(screen.queryByText("Status: Em processo")).not.toBeInTheDocument();
    expect(lastFilters()).toEqual({ status: "DISPONIVEL" });
  });

  it("combina pesquisa textual com filtros", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.type(screen.getByLabelText("Buscar por nome, raça ou espécie"), "Toby");
    await user.selectOptions(screen.getByLabelText("Sexo"), "Macho");

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));
    expect(lastFilters()).toEqual({ q: "Toby", sex: "Macho", status: "DISPONIVEL" });
  });

  it("limpa todos os filtros e restaura a listagem", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.click(screen.getByRole("button", { name: /Gatos/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 animais encontrados"));
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Todos/ })).toHaveAttribute("aria-pressed", "true");
    expect(lastFilters()).toEqual({ status: "DISPONIVEL" });
  });

  it("exibe o estado vazio quando a API retorna uma lista vazia", async () => {
    mockedGetAnimals.mockResolvedValue([]);
    render(<AnimaisPage />);

    expect(await screen.findByText("Ainda não há animais cadastrados")).toBeInTheDocument();
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
  });

  it("exibe o estado vazio e permite limpar quando nenhum animal corresponde", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Amber");

    await user.type(screen.getByLabelText("Buscar por nome, raça ou espécie"), "zzz");

    expect(await screen.findByText("Nenhum animal encontrado")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await screen.findByText("Amber");
    expect(lastFilters()).toEqual({ status: "DISPONIVEL" });
  });

  it("limpa apenas o termo de pesquisa", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Amber");

    await user.type(screen.getByLabelText("Buscar por nome, raça ou espécie"), "Toby");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));

    await user.click(screen.getByRole("button", { name: "Limpar busca" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 animais encontrados"));
    expect(screen.getByText("Amber")).toBeInTheDocument();
  });

  it("exibe mensagem de erro sem expor detalhes técnicos e permite tentar novamente", async () => {
    const user = userEvent.setup();
    mockedGetAnimals
      .mockRejectedValueOnce(new Error("fetch failed: 500"))
      .mockImplementation(async (filters) => filterAnimals(filters));

    render(<AnimaisPage />);

    expect(await screen.findByText("Não foi possível carregar os animais.")).toBeInTheDocument();
    expect(screen.queryByText("fetch failed")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Amber")).toBeInTheDocument();
  });
});
