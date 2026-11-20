import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthHeader } from "@/components/auth/AuthHeader";

describe("AuthHeader", () => {
  it("usa a logo oficial da marca", () => {
    render(<AuthHeader />);

    const logo = screen.getByRole("img", { name: "AdoteJá" });
    expect(logo).toHaveAttribute("src", "/images/logo-adoteja.svg");
    // Nas telas de autenticação a logo é maior que a padrão (h-21) da navbar.
    expect(logo).toHaveClass("h-24", "sm:h-32", "lg:h-36");
  });
});
