import type { ReactNode } from "react";

type AnimalInfoTileProps = {
  label: string;
  value: ReactNode;
  /** Ícone opcional exibido acima do valor. */
  icon?: ReactNode;
};

/** Bloco colorido de informação, como "Sexo", "Idade" e "Porte". */
export function AnimalInfoTile({ label, value, icon }: AnimalInfoTileProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-brand-50 px-4 py-3">
      <span className="flex items-center gap-1.5 text-base font-extrabold text-brand-950">
        {icon}
        {value}
      </span>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
}
