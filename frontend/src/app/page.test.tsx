import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAnimal } from "@/test/animals";
import Home from "./page";

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

  it("exibe a mensagem principal do hero", async () => {
    render(await Home());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Encontre um novo companheiro que precisa de um lar",
    );
    expect(
      screen.getByRole("link", { name: "Encontrar animais 🐾" }),
    ).toHaveAttribute("href", "/animais");
  });

  it("exibe a busca e as categorias", async () => {
    render(await Home());

    expect(screen.getByRole("search")).toBeInTheDocument();
    for (const category of ["Todos", "Cães", "Gatos", "Aves", "Outros"]) {
      expect(screen.getByRole("link", { name: new RegExp(category) })).toBeInTheDocument();
    }
  });

  it("exibe animais disponíveis vindos da API com links para os detalhes", async () => {
    render(await Home());

    expect(screen.getByRole("heading", { name: "Animais disponíveis" })).toBeInTheDocument();
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes de Amber" })).toHaveAttribute(
      "href",
      "/animais/1",
    );
  });

  it("exibe apenas animais disponíveis nos destaques", async () => {
    render(await Home());

    expect(screen.queryByText("Mel")).not.toBeInTheDocument();
    expect(screen.queryByText("Bidu")).not.toBeInTheDocument();
  });
});
