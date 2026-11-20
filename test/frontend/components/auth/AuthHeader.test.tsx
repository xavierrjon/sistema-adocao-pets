import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthHeader } from "@/components/auth/AuthHeader";

describe("AuthHeader", () => {
  it("usa a logo oficial da marca", () => {
    render(<AuthHeader />);

    expect(screen.getByRole("img", { name: "AdoteJá" })).toHaveAttribute(
      "src",
      "/images/logo-adoteja.svg",
    );
  });
});
