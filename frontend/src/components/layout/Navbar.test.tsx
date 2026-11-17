import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => navigationMocks.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

import { Navbar } from "./Navbar";

describe("Navbar", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/";
  });

  it("exibe a marca e os links principais", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "AdoteJá — página inicial" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "AdoteJá" })).toHaveAttribute(
      "src",
      "/images/logo-adoteja.svg",
    );
    expect(screen.getByRole("link", { name: "Início" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Animais" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("marca o link ativo conforme a página atual", () => {
    navigationMocks.pathname = "/animais";
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Animais" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("abre e fecha o menu mobile", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const toggle = screen.getByRole("button", { name: "Abrir menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Navegação principal (mobile)" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
