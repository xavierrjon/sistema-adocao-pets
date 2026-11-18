import { ANIMAL_STATUS_LABELS } from "@/lib/animal-status";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { AnimalStatus } from "@/types/animal";

const STATUS_TONES: Record<AnimalStatus, BadgeTone> = {
  DISPONIVEL: "success",
  EM_PROCESSO: "warning",
  ADOTADO: "neutral",
};

type AnimalStatusBadgeProps = {
  status: AnimalStatus;
  /** Usa o texto completo, ideal para a página de detalhes. */
  full?: boolean;
  className?: string;
};

export function AnimalStatusBadge({ status, full = false, className }: AnimalStatusBadgeProps) {
  const labels = ANIMAL_STATUS_LABELS[status];

  return (
    <Badge tone={STATUS_TONES[status]} withDot className={className}>
      {full ? labels.fullLabel : labels.label}
    </Badge>
  );
}
