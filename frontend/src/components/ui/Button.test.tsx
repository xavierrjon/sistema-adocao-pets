import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza o conteúdo", () => {
    render(<Button>Encontrar animais</Button>);

    expect(screen.getByRole("button", { name: "Encontrar animais" })).toBeInTheDocument();
  });

  it("aplica a variante primary por padrão", () => {
    render(<Button>Quero adotar</Button>);

    expect(screen.getByRole("button", { name: "Quero adotar" })).toHaveClass("bg-brand-600");
  });

  it("aplica variantes personalizadas", () => {
    render(<Button variant="outline">Entrar</Button>);

    expect(screen.getByRole("button", { name: "Entrar" })).toHaveClass("border-brand-600");
  });

  it("dispara o evento de clique", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Clique</Button>);
    await user.click(screen.getByRole("button", { name: "Clique" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
