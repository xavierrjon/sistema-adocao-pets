import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimalCard } from "./AnimalCard";

const mockAnimal = {
  id: "1",
  name: "Amber",
  species: "Gato",
  breed: "SRD",
  location: "Manaus, AM",
  imageUrl: "/images/animals/amber.svg",
  status: "DISPONIVEL" as const,
};

describe("AnimalCard", () => {
  it("renderiza as informações do animal", () => {
    render(<AnimalCard {...mockAnimal} />);

    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Gato · SRD")).toBeInTheDocument();
    expect(screen.getByText("Manaus, AM")).toBeInTheDocument();
    expect(screen.getByText("Disponível")).toBeInTheDocument();
  });

  it("linka para a página de detalhes", () => {
    render(<AnimalCard {...mockAnimal} />);

    const link = screen.getByRole("link", { name: "Ver detalhes de Amber" });
    expect(link).toHaveAttribute("href", "/animais/1");
  });

  it("exibe a imagem com texto alternativo", () => {
    render(<AnimalCard {...mockAnimal} />);

    const image = screen.getByAltText("Ilustração de Amber, um gato");
    expect(image).toHaveAttribute("src", "/images/animals/amber.svg");
  });

  it("não exibe localização quando ausente", () => {
    render(<AnimalCard {...mockAnimal} location={undefined} />);

    expect(screen.queryByText("Manaus, AM")).not.toBeInTheDocument();
  });
});
