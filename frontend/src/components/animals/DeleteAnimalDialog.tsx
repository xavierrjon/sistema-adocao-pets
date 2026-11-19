"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Animal } from "@/types/animal";

type DeleteAnimalDialogProps = {
  animal: Animal;
  isDeleting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteAnimalDialog({ animal, isDeleting, error, onConfirm, onCancel }: DeleteAnimalDialogProps) {
  return (
    <ConfirmDialog
      title="Excluir anúncio"
      description={
        <p>
          Tem certeza que deseja excluir o anúncio de <span className="font-bold">{animal.name}</span>? Esta ação não
          pode ser desfeita.
        </p>
      }
      confirmLabel="Excluir"
      pendingLabel="Excluindo..."
      isPending={isDeleting}
      error={error}
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
