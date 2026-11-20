import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryList } from "@/components/home/CategoryList";

describe("CategoryList", () => {
  it("mantém a lista fluida e os botões no modo padrão", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<CategoryList onSelect={onSelect} />);

    const list = screen.getByRole("list");
    expect(list).toHaveClass("flex", "flex-wrap", "gap-2");
    expect(list).not.toHaveClass("overflow-x-auto");
    for (const listItem of within(list).getAllByRole("listitem")) {
      expect(listItem).not.toHaveClass("shrink-0", "snap-start");
    }

    await user.click(screen.getByRole("button", { name: "Cães" }));
    expect(onSelect).toHaveBeenCalledWith("Cães");
  });

  it("usa carrossel com snap quando scrollable", () => {
    render(<CategoryList asLinks scrollable />);

    const list = screen.getByRole("list");
    expect(list).toHaveClass("flex", "snap-x", "snap-mandatory", "overflow-x-auto", "pb-2");
    expect(list).not.toHaveClass("flex-wrap");
    for (const listItem of within(list).getAllByRole("listitem")) {
      expect(listItem).toHaveClass("shrink-0", "snap-start");
    }
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute(
      "href",
      "/animais?categoria=Todos",
    );
  });
});
