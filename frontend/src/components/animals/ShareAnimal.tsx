"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon, ShareIcon } from "@/components/ui/icons";

/** Tempo em que o ícone de confirmação permanece visível após copiar. */
const CHECK_VISIBLE_MS = 2000;

/**
 * Link público do anúncio: sempre a página do animal em visualização,
 * nunca a listagem ou a home. Depende apenas da origem atual, sem
 * variáveis de ambiente adicionais.
 */
function buildAnimalUrl(animalId: string): string {
  return new URL(`/animais/${animalId}`, window.location.origin).toString();
}

type ShareFeedback =
  | { kind: "copied" }
  | { kind: "manual"; url: string; reason: "unavailable" | "failed" };

type ShareAnimalProps = {
  animalId: string;
  animalName: string;
};

export function ShareAnimal({ animalId, animalName }: ShareAnimalProps) {
  const [feedback, setFeedback] = useState<ShareFeedback | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const checkTimeoutRef = useRef<number | null>(null);

  // Garante que o timer do check não dispare após a desmontagem.
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current !== null) {
        window.clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  function showCheckBriefly() {
    setShowCheck(true);

    if (checkTimeoutRef.current !== null) {
      window.clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = window.setTimeout(() => {
      setShowCheck(false);
      setFeedback(null);
      checkTimeoutRef.current = null;
    }, CHECK_VISIBLE_MS);
  }

  /**
   * Alternativa de cópia quando a Web Share API não está disponível
   * ou falhou. Sem confirmação falsa: só reporta sucesso após o
   * `writeText` resolver; caso contrário, disponibiliza a URL para
   * cópia manual.
   */
  async function copyLink(url: string) {
    if (typeof navigator.clipboard?.writeText !== "function") {
      setFeedback({ kind: "manual", url, reason: "unavailable" });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback({ kind: "copied" });
      showCheckBriefly();
    } catch {
      setFeedback({ kind: "manual", url, reason: "failed" });
    }
  }

  async function handleShare() {
    // APIs do navegador são acessadas apenas em interação do usuário,
    // nunca durante a renderização (incluindo SSR).
    const url = buildAnimalUrl(animalId);
    setFeedback(null);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: animalName,
          text: `Conheça o anúncio de ${animalName} no AdoteJá!`,
          url,
        });
        // Compartilhamento concluído: sem confirmação adicional.
        return;
      } catch (error) {
        // Cancelamento pelo usuário: encerra silenciosamente, sem
        // mensagem de erro e sem cair no fallback de cópia.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // Outras falhas: tenta a cópia do link.
      }
    }

    await copyLink(url);
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        aria-label="Compartilhar anúncio"
      >
        {/* Container quadrado com flex centraliza o ícone no círculo. */}
        <span className="flex h-5 w-5 items-center justify-center">
          {showCheck ? (
            <CheckIcon
              key="check"
              data-testid="share-check-icon"
              className="h-5 w-5 animate-share-icon-pop"
              aria-hidden="true"
            />
          ) : (
            <ShareIcon key="share" className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
      </Button>

      {feedback?.kind === "copied" ? (
        <p role="status" className="text-right text-sm font-semibold text-brand-700">
          Link copiado!
        </p>
      ) : null}

      {feedback?.kind === "manual" ? (
        <div className="w-full max-w-md rounded-2xl bg-slate-50 px-4 py-3 text-left" role="status">
          <p className="text-sm font-semibold text-brand-950">
            {feedback.reason === "failed"
              ? "Não foi possível copiar o link automaticamente."
              : "A cópia automática não está disponível neste navegador."}
          </p>
          <label htmlFor="share-animal-url" className="mt-2 block text-sm text-slate-600">
            Copie o link do anúncio manualmente:
          </label>
          <input
            id="share-animal-url"
            type="text"
            readOnly
            value={feedback.url}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </div>
      ) : null}
    </div>
  );
}
