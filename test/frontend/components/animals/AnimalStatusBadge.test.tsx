import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimalStatusBadge } from "@/components/animals/AnimalStatusBadge";

describe("AnimalStatusBadge", () => {
  it("exibe o status disponível", () => {
    render(<AnimalStatusBadge status="DISPONIVEL" />);

    expect(screen.getByText("Disponível")).toBeInTheDocument();
  });

  it("exibe o texto completo na página de detalhes", () => {
    render(<AnimalStatusBadge status="DISPONIVEL" full />);

    expect(screen.getByText("Disponível para adoção")).toBeInTheDocument();
  });

  it("exibe os demais status", () => {
    render(
      <>
        <AnimalStatusBadge status="EM_PROCESSO" />
        <AnimalStatusBadge status="ADOTADO" />
      </>,
    );

    expect(screen.getByText("Em processo")).toBeInTheDocument();
    expect(screen.getByText("Adotado")).toBeInTheDocument();
  });
});
