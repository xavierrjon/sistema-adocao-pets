"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { buttonClasses } from "./Button";

type ConfirmDialogProps = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  isPending?: boolean;
  error?: string | null;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

/** Diálogo de confirmação acessível, com foco preso, Escape e retorno de foco. */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pendingLabel = "Salvando...",
  isPending = false,
  error,
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!isPending) onCancel();
      return;
    }

    if (event.key !== "Tab") return;

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
        aria-labelledby={titleId}
        aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-extrabold text-brand-950">
          {title}
        </h2>

        <div id={descriptionId} className="mt-2 text-sm text-slate-600">
          {description}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className={buttonClasses({ variant: "outline", size: "md" })}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={buttonClasses({
              variant: "primary",
              size: "md",
              className:
                tone === "danger"
                  ? "bg-red-600 shadow-red-600/25 hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600"
                  : "",
            })}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
