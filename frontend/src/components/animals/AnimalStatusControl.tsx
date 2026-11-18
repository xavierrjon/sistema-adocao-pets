"use client";

import { useId } from "react";
import { ANIMAL_STATUS_LABELS, ANIMAL_STATUS_VALUES } from "@/lib/animal-status";
import type { AnimalStatus } from "@/types/animal";

type AnimalStatusControlProps = {
  status: AnimalStatus;
  isUpdating: boolean;
  error?: string | null;
  onRequestChange: (status: AnimalStatus) => void;
};

/** Controle textual de status; a mudança só é aplicada após confirmação. */
export function AnimalStatusControl({
  status,
  isUpdating,
  error,
  onRequestChange,
}: AnimalStatusControlProps) {
  const selectId = useId();
  const helpId = `${selectId}-help`;
  const errorId = `${selectId}-error`;

  return (
    <div className="min-w-0">
      <label htmlFor={selectId} className="block text-xs font-bold text-slate-500">
        Status do anúncio
      </label>

      <select
        id={selectId}
        value={status}
        disabled={isUpdating}
        aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
        aria-busy={isUpdating}
        onChange={(event) => onRequestChange(event.target.value as AnimalStatus)}
        className="mt-1 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {ANIMAL_STATUS_VALUES.map((value) => (
          <option key={value} value={value}>
            {ANIMAL_STATUS_LABELS[value].label}
          </option>
        ))}
      </select>

      <p id={helpId} className="mt-1 text-xs text-slate-400">
        {ANIMAL_STATUS_LABELS[status].help}
      </p>

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
