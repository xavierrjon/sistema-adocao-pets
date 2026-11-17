import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeAnimal } from "@/test/animals";
import { AnimalCard } from "./AnimalCard";

const mockAnimal = makeAnimal();

describe("AnimalCard", () => {
  it("renderiza as informações do animal vindas da API", () => {
    render(<AnimalCard {...mockAnimal} />);

    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Gato · SRD")).toBeInTheDocument();
    expect(screen.getByText("Disponível")).toBeInTheDocument();
  });

  it("linka para a página de detalhes usando o id real", () => {
    render(<AnimalCard {...mockAnimal} />);

    const link = screen.getByRole("link", { name: "Ver detalhes de Amber" });
    expect(link).toHaveAttribute("href", `/animais/${mockAnimal.id}`);
  });

  it("exibe a ilustração padrão com texto alternativo", () => {
    render(<AnimalCard {...mockAnimal} />);

    const image = screen.getByAltText("Ilustração de Amber, um gato");
    expect(image).toHaveAttribute("src", "/images/animals/fallback.svg");
  });
});
