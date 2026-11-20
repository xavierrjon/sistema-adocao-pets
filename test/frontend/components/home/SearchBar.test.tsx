import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerMocks.push }),
}));

import { SearchBar } from "@/components/home/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
  });

  it("usa botões compactos com ícone e rótulo acessível no mobile", () => {
    render(<SearchBar onToggleFilters={vi.fn()} activeFilterCount={1} />);

    const searchButton = screen.getByRole("button", { name: "Buscar" });
    expect(searchButton).toHaveClass("h-11", "w-11", "p-0", "sm:h-auto", "sm:w-auto", "sm:px-6");
    expect(searchButton.querySelector("svg")).toHaveClass("sm:hidden");
    expect(searchButton.querySelector("span")).toHaveClass("hidden", "sm:inline");

    const filtersButton = screen.getByRole("button", { name: "Mostrar filtros (1 ativo)" });
    expect(filtersButton).toHaveClass("h-11", "w-11", "p-0", "sm:h-auto", "sm:w-auto", "sm:px-6");
    expect(filtersButton.querySelectorAll("svg")[0]).toHaveClass("sm:hidden");
    expect(filtersButton.querySelectorAll("svg")[1]).toHaveClass("hidden", "sm:block");
    expect(filtersButton.querySelector("span[aria-hidden='true']")).toHaveClass("h-2", "w-2", "sm:hidden");
  });

  it("envia a busca ao clicar no botão de ícone", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SearchBar value="Toby" onChange={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith("Toby");
  });

  it("navega para a listagem quando não recebe um callback de busca", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    await user.type(screen.getByRole("searchbox"), "luna");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(routerMocks.push).toHaveBeenCalledWith("/animais?q=luna");
  });

  it("alterna o painel de filtros mantendo os atributos de acessibilidade", async () => {
    const user = userEvent.setup();
    const onToggleFilters = vi.fn();

    const { rerender } = render(
      <SearchBar onToggleFilters={onToggleFilters} filtersOpen={false} activeFilterCount={1} />,
    );

    const closedButton = screen.getByRole("button", { name: "Mostrar filtros (1 ativo)" });
    expect(closedButton).toHaveAttribute("aria-expanded", "false");
    expect(closedButton).not.toHaveAttribute("aria-controls");

    await user.click(closedButton);
    expect(onToggleFilters).toHaveBeenCalledOnce();

    rerender(<SearchBar onToggleFilters={onToggleFilters} filtersOpen activeFilterCount={1} />);

    const openButton = screen.getByRole("button", { name: "Ocultar filtros (1 ativo)" });
    expect(openButton).toHaveAttribute("aria-expanded", "true");
    expect(openButton).toHaveAttribute("aria-controls", "animal-filters");
  });
});
