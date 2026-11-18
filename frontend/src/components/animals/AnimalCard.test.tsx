import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeAnimal } from "@/test/animals";
import { AnimalCard } from "./AnimalCard";

// next/image exige a configuração do Next em tempo de build; nos testes de
// componente substituímos pelo <img> equivalente.
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

const mockAnimal = makeAnimal();

describe("AnimalCard", () => {
  it("renderiza as informações do animal vindas da API", () => {
    render(<AnimalCard {...mockAnimal} />);

    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.getByText("Gato · SRD")).toBeInTheDocument();
    expect(screen.getByText("São Paulo - SP")).toBeInTheDocument();
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

  it("exibe a foto do animal quando ele possui imagem", () => {
    render(
      <AnimalCard {...mockAnimal} imageUrl="https://res.cloudinary.com/exemplo/foto.jpg" />,
    );

    const image = screen.getByAltText("Foto de Amber, um gato");
    expect(image).toHaveAttribute("src", "https://res.cloudinary.com/exemplo/foto.jpg");
    expect(screen.queryByAltText("Ilustração de Amber, um gato")).not.toBeInTheDocument();
  });
});
