"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { Animal } from "@/types/animal";

type DeleteAnimalDialogProps = {
  animal: Animal;
  isDeleting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteAnimalDialog({ animal, isDeleting, error, onConfirm, onCancel }: DeleteAnimalDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Devolve o foco ao elemento que abriu o diálogo quando ele é fechado.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!isDeleting) onCancel();
      return;
    }

    if (event.key !== "Tab") return;

    // Mantém a navegação por teclado dentro do diálogo.
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-animal-title"
        aria-describedby="delete-animal-description"
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id="delete-animal-title" className="text-lg font-extrabold text-brand-950">
          Excluir anúncio
        </h2>

        <p id="delete-animal-description" className="mt-2 text-sm text-slate-600">
          Tem certeza que deseja excluir o anúncio de{" "}
          <span className="font-bold">{animal.name}</span>? Esta ação não pode ser desfeita.
        </p>

        {error ? (
          <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={buttonClasses({ variant: "outline", size: "md" })}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={buttonClasses({
              variant: "primary",
              size: "md",
              className: "bg-red-600 shadow-red-600/25 hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600",
            })}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
