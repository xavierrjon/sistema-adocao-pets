import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
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

  it("exibe animais em destaque com links para os detalhes", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Animais disponíveis" })).toBeInTheDocument();
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes de Amber" })).toHaveAttribute(
      "href",
      "/animais/1",
    );
  });

  it("exibe apenas animais disponíveis nos destaques", () => {
    render(<Home />);

    // Mel (EM_PROCESSO) e Bidu (ADOTADO) não aparecem entre os destaques.
    expect(screen.queryByText("Mel")).not.toBeInTheDocument();
    expect(screen.queryByText("Bidu")).not.toBeInTheDocument();
  });
});
