"use client";

import Image from "next/image";
import type { MouseEvent } from "react";

const FALLBACK_IMAGE = "/images/animals/fallback.svg";

type AnimalImageFieldProps = {
  /** ID usado nas associações de acessibilidade (aria-describedby). */
  id: string;
  /** URL da imagem já salva no servidor (modo de edição). */
  existingImageUrl?: string | null;
  /** Prévia da imagem nova selecionada (objeto URL local). */
  previewUrl: string | null;
  /** Nome do arquivo selecionado, anunciado para leitores de tela. */
  selectedFileName: string | null;
  /** `true` quando o usuário removeu a imagem atual e ainda não escolheu outra. */
  willRemoveExisting: boolean;
  error?: string | null;
  isSubmitting: boolean;
  onSelectImage: () => void;
  onRemoveImage: () => void;
};

const ACTION_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 transition " +
  "hover:bg-brand-50 active:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 " +
  "disabled:pointer-events-none disabled:opacity-50";

const REMOVE_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition " +
  "hover:bg-red-50 active:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 " +
  "disabled:pointer-events-none disabled:opacity-50";

/**
 * Seletor de imagem do anúncio: botão estilizado (não usamos o input de
 * arquivo padrão), pré-visualização, substituição e remoção da imagem,
 * respeitando a identidade visual do AdoteJá.
 */
export function AnimalImageField({
  id,
  existingImageUrl,
  previewUrl,
  selectedFileName,
  willRemoveExisting,
  error,
  isSubmitting,
  onSelectImage,
  onRemoveImage,
}: AnimalImageFieldProps) {
  const hasSelection = Boolean(previewUrl);
  const showsExisting = !hasSelection && !willRemoveExisting && Boolean(existingImageUrl);
  const hasCurrentImage = hasSelection || showsExisting;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(" ") || undefined;

  function preventSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100" aria-labelledby={`${id}-heading`}>
      <div>
        <h2 id={`${id}-heading`} className="text-lg font-extrabold text-brand-950">
          Foto do animal
        </h2>
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          Opcional. Fotos reais ajudam na adoção: JPEG, PNG ou WebP, até 5 MB.
        </p>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-50 sm:aspect-[16/9]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Pré-visualização da imagem selecionada${selectedFileName ? `: ${selectedFileName}` : ""}`}
            className="h-full w-full object-cover"
          />
        ) : showsExisting && existingImageUrl ? (
          <Image
            src={existingImageUrl}
            alt="Foto atual do animal"
            fill
            sizes="(min-width: 768px) 700px, 100vw"
            className="object-cover"
          />
        ) : (
          <img
            src={FALLBACK_IMAGE}
            alt="Nenhuma imagem selecionada"
            className="h-full w-full object-cover opacity-60"
          />
        )}

        {isSubmitting && hasSelection ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70" aria-hidden="true">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-800 shadow-sm">
              Enviando imagem...
            </span>
          </div>
        ) : null}
      </div>

      {willRemoveExisting ? (
        <p role="status" className="text-sm text-amber-700">
          A imagem atual será removida do anúncio quando você salvar as alterações.
        </p>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {hasSelection
          ? `Imagem selecionada${selectedFileName ? `: ${selectedFileName}` : ""}.`
          : willRemoveExisting
            ? "Imagem marcada para remoção."
            : "Nenhuma imagem selecionada."}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSelectImage}
          disabled={isSubmitting}
          className={ACTION_BUTTON_CLASSES}
          aria-describedby={describedBy}
        >
          {hasCurrentImage ? "Substituir imagem" : "Selecionar imagem"}
        </button>

        {hasCurrentImage ? (
          <button
            type="button"
            onClick={(event) => {
              preventSubmit(event);
              onRemoveImage();
            }}
            disabled={isSubmitting}
            className={REMOVE_BUTTON_CLASSES}
          >
            Remover imagem
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </section>
  );
}
