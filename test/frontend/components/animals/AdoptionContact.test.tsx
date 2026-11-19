import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnimalStatus } from "@/types/animal";

const ANIMAL_ID = "11111111-1111-4111-8111-111111111111";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    isLoading: false,
  },
}));

const apiMocks = vi.hoisted(() => ({
  getAnimalContact: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationMocks.push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => `/animais/${ANIMAL_ID}`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    ...authMocks.state,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/services/animals", () => ({
  getAnimalContact: apiMocks.getAnimalContact,
}));

import { AdoptionContact } from "@/components/animals/AdoptionContact";

function renderContact(status: AnimalStatus = "DISPONIVEL") {
  return render(<AdoptionContact animalId={ANIMAL_ID} animalName="Amber" status={status} />);
}

describe("AdoptionContact", () => {
  beforeEach(() => {
    authMocks.state.isAuthenticated = false;
    authMocks.state.isLoading = false;
    navigationMocks.push.mockReset();
    apiMocks.getAnimalContact.mockReset();
  });

  it("envia visitantes para o login preservando o animal", async () => {
    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: "Quero adotar 🐾" }));

    expect(navigationMocks.push).toHaveBeenCalledWith(
      `/login?next=${encodeURIComponent(`/animais/${ANIMAL_ID}`)}`,
    );
    expect(apiMocks.getAnimalContact).not.toHaveBeenCalled();
  });

  it("mantém botão e links de autenticação visíveis para visitantes", () => {
    renderContact();

    expect(screen.getByRole("button", { name: "Quero adotar 🐾" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(`/animais/${ANIMAL_ID}`)}`,
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      `/cadastro?next=${encodeURIComponent(`/animais/${ANIMAL_ID}`)}`,
    );
  });

  it("desabilita a ação enquanto a sessão está sendo verificada", () => {
    authMocks.state.isLoading = true;
    renderContact();

    expect(screen.getByRole("button", { name: "Quero adotar 🐾" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
  });

  it("libera o contato para usuário autenticado sem exigir userId no frontend", async () => {
    authMocks.state.isAuthenticated = true;
    apiMocks.getAnimalContact.mockResolvedValue({
      animalId: ANIMAL_ID,
      animalName: "Amber",
      responsibleName: "João Silva",
      whatsapp: "92999998888",
    });

    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: "Quero adotar 🐾" }));

    await waitFor(() => expect(apiMocks.getAnimalContact).toHaveBeenCalledWith(ANIMAL_ID));
    expect(await screen.findByText("Responsável: João Silva")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp: (92) 99999-8888")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Falar no WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/92999998888"),
    );
    expect(navigationMocks.push).not.toHaveBeenCalled();
  });

  it("mostra erro quando o backend não devolve o contato", async () => {
    authMocks.state.isAuthenticated = true;
    apiMocks.getAnimalContact.mockRejectedValue(new Error("falha de rede"));

    const user = userEvent.setup();
    renderContact();

    await user.click(screen.getByRole("button", { name: "Quero adotar 🐾" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o contato do responsável.",
    );
  });

  it("não oferece adoção para animal adotado ou em processo", () => {
    renderContact("ADOTADO");

    expect(screen.queryByRole("button", { name: "Quero adotar 🐾" })).not.toBeInTheDocument();
    expect(screen.getByText("Adotado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver animais disponíveis" })).toHaveAttribute(
      "href",
      "/animais",
    );
    expect(apiMocks.getAnimalContact).not.toHaveBeenCalled();
  });
});
