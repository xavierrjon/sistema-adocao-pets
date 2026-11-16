import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AnimaisPage from "./page";

describe("Página de animais", () => {
  it("exibe o título e os filtros", async () => {
    render(<AnimaisPage />);

    expect(screen.getByRole("heading", { name: "Animais para adoção" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Todos/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cães/ })).toBeInTheDocument();
  });

  it("carrega a lista de animais", async () => {
    render(<AnimaisPage />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Amber")).toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("9 animais encontrados");
  });

  it("filtra os animais por categoria", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Toby");

    await user.click(screen.getByRole("button", { name: /Gatos/ }));

    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.queryByText("Toby")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("3 animais encontrados");
  });

  it("filtra os animais pela busca", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Amber");

    const input = screen.getByLabelText("Buscar por nome, raça ou espécie");
    await user.type(input, "Amber");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("1 animal encontrado");
    });
    expect(screen.getByText("Amber")).toBeInTheDocument();
    expect(screen.queryByText("Toby")).not.toBeInTheDocument();
  });

  it("exibe o estado vazio quando nenhum animal corresponde aos filtros", async () => {
    const user = userEvent.setup();
    render(<AnimaisPage />);

    await screen.findByText("Amber");

    const input = screen.getByLabelText("Buscar por nome, raça ou espécie");
    await user.type(input, "zzz");

    expect(await screen.findByText("Nenhum animal encontrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeInTheDocument();
  });
});
