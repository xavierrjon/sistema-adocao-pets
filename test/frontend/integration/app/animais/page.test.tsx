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

  return animals.filter((animal) => {
    // A vitrine pública nunca retorna animais adotados ou em processo.
    if (animal.status !== "DISPONIVEL") return false;

    if (filters.species === "Outro") {
      if (["Cachorro", "Gato", "Ave"].includes(animal.species)) return false;
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

async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Mostrar filtros/ }));
}

describe("Página de animais", () => {
  beforeEach(() => {
    mockedGetAnimals.mockReset();
    mockedGetAnimals.mockImplementation(async (filters) => filterAnimals(filters));
  });

  it("exibe o título e a busca, mantendo os filtros ocultos até clicar no ícone", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    expect(screen.getByRole("heading", { name: "Animais para adoção" })).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mostrar filtros/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cães/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Sexo")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Porte")).not.toBeInTheDocument();

    await openFilters(user);

    expect(screen.getByRole("button", { name: /Todos/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cães/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gatos/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Sexo")).toBeInTheDocument();
    expect(screen.getByLabelText("Porte")).toBeInTheDocument();
    expect(screen.queryByLabelText("Status de adoção")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ocultar filtros/ }));

    expect(screen.queryByRole("button", { name: /Cães/ })).not.toBeInTheDocument();
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
    expect(lastFilters()).toEqual({});
  });

  it("filtra os animais por categoria usando a API", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");
    await openFilters(user);

    await user.click(screen.getByRole("button", { name: /Gatos/ }));

    await screen.findByText("Amber");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));
    expect(screen.queryByText("Toby")).not.toBeInTheDocument();
    expect(lastFilters()).toEqual({ species: "Gato" });
  });

  it("filtra a categoria Aves usando a espécie Ave", async () => {
    const bird = makeAnimal({
      id: "4",
      name: "Pipoca",
      species: "Ave",
      breed: "Calopsita",
    });
    mockedGetAnimals.mockResolvedValue([bird]);

    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Pipoca");
    await openFilters(user);
    await user.click(screen.getByRole("button", { name: /Aves/ }));

    expect(lastFilters()).toEqual({ species: "Ave" });
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
    expect(lastFilters()).toEqual({ q: "Toby" });
  });

  it("combina espécie, sexo e porte na mesma consulta", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");
    await openFilters(user);

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
    });
  });

  it("remove um filtro individualmente", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");
    await openFilters(user);

    await user.selectOptions(screen.getByLabelText("Sexo"), "Macho");

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));
    expect(screen.getByText("Sexo: Macho")).toBeInTheDocument();
    expect(screen.queryByText("Amber")).not.toBeInTheDocument();
    expect(lastFilters()).toEqual({ sex: "Macho" });

    await user.click(screen.getByRole("button", { name: "Remover filtro Sexo" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 animais encontrados"));
    expect(screen.queryByText("Sexo: Macho")).not.toBeInTheDocument();
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(lastFilters()).toEqual({});
  });

  it("combina pesquisa textual com filtros", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");
    await openFilters(user);

    await user.type(screen.getByLabelText("Buscar por nome, raça ou espécie"), "Toby");
    await user.selectOptions(screen.getByLabelText("Sexo"), "Macho");

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));
    expect(lastFilters()).toEqual({ q: "Toby", sex: "Macho" });
  });

  it("limpa todos os filtros e restaura a listagem", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");
    await openFilters(user);

    await user.click(screen.getByRole("button", { name: /Gatos/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 animais encontrados"));
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Toby")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Todos/ })).toHaveAttribute("aria-pressed", "true");
    expect(lastFilters()).toEqual({});
  });

  it("mostra a quantidade de filtros ativos ao fechar o painel", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");
    await openFilters(user);

    await user.click(screen.getByRole("button", { name: /Gatos/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado"));

    await user.click(screen.getByRole("button", { name: /Ocultar filtros/ }));

    expect(screen.getByRole("button", { name: "Mostrar filtros (1 ativo)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gatos/ })).not.toBeInTheDocument();
    expect(lastFilters()).toEqual({ species: "Gato" });
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

    await user.click(screen.getByRole("button", { name: "Limpar busca e filtros" }));

    await screen.findByText("Amber");
    expect(lastFilters()).toEqual({});
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
