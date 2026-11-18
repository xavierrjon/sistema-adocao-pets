import type { AnimalStatus } from "@/types/animal";

/** Textos compartilhados por badges, controles e mensagens de status. */
export const ANIMAL_STATUS_LABELS: Record<
  AnimalStatus,
  { label: string; fullLabel: string; help: string }
> = {
  DISPONIVEL: {
    label: "Disponível",
    fullLabel: "Disponível para adoção",
    help: "O animal está procurando uma família.",
  },
  EM_PROCESSO: {
    label: "Em processo",
    fullLabel: "Em processo de adoção",
    help: "Existe uma adoção em andamento.",
  },
  ADOTADO: {
    label: "Adotado",
    fullLabel: "Adotado",
    help: "A adoção foi concluída.",
  },
};

export const ANIMAL_STATUS_VALUES = Object.keys(ANIMAL_STATUS_LABELS) as AnimalStatus[];

export function getAnimalStatusLabel(status: AnimalStatus, full = false): string {
  const labels = ANIMAL_STATUS_LABELS[status];
  return full ? labels.fullLabel : labels.label;
}
