import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnimalDetailsPage from "./page";

describe("Página de detalhes do animal", () => {
  it("exibe as informações principais do animal", async () => {
    const page = await AnimalDetailsPage({ params: Promise.resolve({ id: "1" }) });
    render(page);

    expect(screen.getByRole("heading", { name: "Amber", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Disponível para adoção")).toBeInTheDocument();
    expect(screen.getByText("Fêmea")).toBeInTheDocument();
    expect(screen.getByText("1 ano")).toBeInTheDocument();
    expect(screen.getByText("Médio")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sobre Amber" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quero adotar 🐾" })).toBeInTheDocument();
  });

  it("linka de volta para a listagem", async () => {
    const page = await AnimalDetailsPage({ params: Promise.resolve({ id: "1" }) });
    render(page);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/animais");
  });
});
