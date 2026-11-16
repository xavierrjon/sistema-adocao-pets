import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { AnimalStatus } from "@/types/animal";

const STATUS_CONFIG: Record<AnimalStatus, { label: string; fullLabel: string; tone: BadgeTone }> = {
  DISPONIVEL: { label: "Disponível", fullLabel: "Disponível para adoção", tone: "success" },
  EM_PROCESSO: { label: "Em processo", fullLabel: "Em processo de adoção", tone: "warning" },
  ADOTADO: { label: "Adotado", fullLabel: "Adotado", tone: "neutral" },
};

type AnimalStatusBadgeProps = {
  status: AnimalStatus;
  /** Usa o texto completo, ideal para a página de detalhes. */
  full?: boolean;
  className?: string;
};

export function AnimalStatusBadge({ status, full = false, className }: AnimalStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge tone={config.tone} withDot className={className}>
      {full ? config.fullLabel : config.label}
    </Badge>
  );
}
