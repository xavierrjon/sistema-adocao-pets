import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeAnimal } from "@test/fixtures/animals";
import { ShareAnimal } from "@/components/animals/ShareAnimal";

const animal = makeAnimal();
// Origem padrão do jsdom nos testes.
const EXPECTED_URL = `http://localhost:3000/animais/${animal.id}`;

/**
 * Substitui propriedades do `navigator` (Web Share / Clipboard) que não
 * podem ser simuladas por módulos. Aplicado sempre DEPOIS de
 * `userEvent.setup()`, que também substitui o `navigator.clipboard`.
 * Restaura o descritor original no afterEach para não vazar entre
 * testes nem depender da ordem.
 */
const navigatorRestorers: Array<() => void> = [];

function stubNavigatorProperty(property: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(window.navigator, property);
  const prototype = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(window.navigator),
    property,
  );

  Object.defineProperty(window.navigator, property, {
    value,
    configurable: true,
    writable: true,
  });

  navigatorRestorers.push(() => {
    if (original) {
      Object.defineProperty(window.navigator, property, original);
    } else if (prototype) {
      Object.defineProperty(window.navigator, property, prototype);
    } else {
      delete (window.navigator as unknown as Record<string, unknown>)[property];
    }
  });
}

// Resolve microtasks pendentes (promises de share/clipboard) para
// asserts negativos determinísticos.
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/** Esvazia a fila de microtasks sem depender de timers (usado com fake timers). */
async function flushMicrotasks() {
  await act(async () => {
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve();
    }
  });
}

function renderShare() {
  return render(<ShareAnimal animalId={animal.id} animalName={animal.name} />);
}

afterEach(() => {
  while (navigatorRestorers.length > 0) {
    const restore = navigatorRestorers.pop();
    restore?.();
  }
});

describe("ShareAnimal", () => {
  it("exibe o botão de compartilhamento com nome acessível", () => {
    renderShare();

    expect(screen.getByRole("button", { name: "Compartilhar anúncio" })).toBeInTheDocument();
  });

  it("aciona a Web Share API com título, texto e URL do anúncio visualizado", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubNavigatorProperty("share", share);
    const user = userEvent.setup();

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    await flush();

    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith({
      title: animal.name,
      text: `Conheça o anúncio de ${animal.name} no AdoteJá!`,
      url: EXPECTED_URL,
    });
    // Sem confirmação adicional quando o compartilhamento conclui.
    expect(screen.queryByText(/Link copiado/i)).not.toBeInTheDocument();
  });

  it("compartilha a URL da página do animal, nunca a da listagem ou da home", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubNavigatorProperty("share", share);
    const user = userEvent.setup();

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    await flush();

    const sharedUrl = share.mock.calls[0]?.[0]?.url as string;
    expect(sharedUrl).toBe(`http://localhost:3000/animais/${animal.id}`);
    expect(sharedUrl).not.toBe("http://localhost:3000/");
    expect(sharedUrl).not.toBe("http://localhost:3000/animais");
  });

  it("encerra silenciosamente quando o usuário cancela o compartilhamento (AbortError)", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("cancelado", "AbortError"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    stubNavigatorProperty("share", share);
    stubNavigatorProperty("clipboard", { writeText });

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    await flush();

    // Cancelamento não é falha: sem fallback de cópia e sem mensagens.
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("tenta copiar o link quando o compartilhamento falha por outro motivo", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockRejectedValue(new Error("NetworkError"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigatorProperty("share", share);
    stubNavigatorProperty("clipboard", { writeText });

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    expect(await screen.findByText(/Link copiado/i)).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(EXPECTED_URL);
  });

  it("copia o link quando a Web Share API não está disponível", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigatorProperty("share", undefined);
    stubNavigatorProperty("clipboard", { writeText });

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    expect(await screen.findByText(/Link copiado/i)).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(EXPECTED_URL);
  });

  it("exibe o feedback de sucesso somente após a cópia concluir", async () => {
    const user = userEvent.setup();
    let resolveCopy: (() => void) | undefined;
    const writeText = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveCopy = resolve;
        }),
    );
    stubNavigatorProperty("share", undefined);
    stubNavigatorProperty("clipboard", { writeText });

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    // Antes da cópia concluir, não há confirmação falsa.
    await flush();
    expect(screen.queryByText(/Link copiado/i)).not.toBeInTheDocument();

    resolveCopy?.();
    expect(await screen.findByText(/Link copiado/i)).toBeInTheDocument();
  });

  it("orienta cópia manual quando a Clipboard API não está disponível", async () => {
    const user = userEvent.setup();
    stubNavigatorProperty("share", undefined);
    stubNavigatorProperty("clipboard", undefined);

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    expect(await screen.findByText(/cópia automática não está disponível/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /link do anúncio/i })).toHaveValue(EXPECTED_URL);
    expect(screen.queryByText(/Link copiado/i)).not.toBeInTheDocument();
  });

  it("informa a falha e disponibiliza a URL quando a cópia falha", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("bloqueado"));
    stubNavigatorProperty("share", undefined);
    stubNavigatorProperty("clipboard", { writeText });

    renderShare();
    await user.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));

    expect(await screen.findByText(/não foi possível copiar/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /link do anúncio/i })).toHaveValue(EXPECTED_URL);
    expect(screen.queryByText(/Link copiado/i)).not.toBeInTheDocument();
  });

  it("troca o ícone para confirmação ao copiar e volta em seguida", async () => {
    // Apenas timers: o act do React depende de agendamento próprio,
    // que não pode ser interceptado pelos fake timers.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      // userEvent travaria com os fake timers do vitest; fireEvent cobre o caso.
      const writeText = vi.fn().mockResolvedValue(undefined);
      stubNavigatorProperty("share", undefined);
      stubNavigatorProperty("clipboard", { writeText });

      const { container } = renderShare();
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Compartilhar anúncio" }));
      });
      await flushMicrotasks();

      // Ícone de ok visível durante a confirmação da cópia.
      expect(screen.getByText(/Link copiado/i)).toBeInTheDocument();
      expect(container.querySelector('[data-testid="share-check-icon"]')).not.toBeNull();

      // Após o tempo de confirmação, o check e a mensagem somem sozinhos.
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(container.querySelector('[data-testid="share-check-icon"]')).toBeNull();
      expect(screen.queryByText(/Link copiado/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
