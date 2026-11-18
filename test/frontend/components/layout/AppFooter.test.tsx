import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
}));

import { AppFooter } from "@/components/layout/AppFooter";

function renderFooter() {
  return render(
    <AppFooter>
      <footer data-testid="footer">Rodapé</footer>
    </AppFooter>,
  );
}

describe("AppFooter", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/";
  });

  it("exibe o rodapé nas páginas normais", () => {
    renderFooter();

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it.each(["/animais", "/animais/1"])("exibe o rodapé em %s", (pathname) => {
    navigationMocks.pathname = pathname;
    renderFooter();

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it.each(["/login", "/cadastro", "/login/"])("oculta o rodapé em %s", (pathname) => {
    navigationMocks.pathname = pathname;
    renderFooter();

    expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
  });
});
