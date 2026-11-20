import Link from "next/link";
import { ANIMAL_CATEGORIES, type AnimalCategory } from "@/lib/categories";

type CategoryListProps = {
  /** Categoria selecionada (usada no modo botão, dentro da página de animais). */
  active?: AnimalCategory;
  /** Seleciona uma categoria (usada no modo botão). */
  onSelect?: (category: AnimalCategory) => void;
  /** Renderiza os itens como links para `/animais?categoria=...` (usado na home). */
  asLinks?: boolean;
  /** Transforma a lista em um carrossel horizontal com snap (usado na home). */
  scrollable?: boolean;
  className?: string;
};

function baseChipClasses(isActive: boolean): string {
  return [
    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
    isActive
      ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25"
      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200",
  ].join(" ");
}

export function CategoryList({
  active,
  onSelect,
  asLinks = false,
  scrollable = false,
  className = "",
}: CategoryListProps) {
  const listClasses = scrollable
    ? `flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 ${className}`
    : `flex flex-wrap gap-2 ${className}`;
  const itemClasses = scrollable ? "shrink-0 snap-start" : "";

  if (asLinks) {
    return (
      <ul className={listClasses}>
        {ANIMAL_CATEGORIES.map(({ label, icon }) => (
          <li key={label} className={itemClasses}>
            <Link href={`/animais?categoria=${encodeURIComponent(label)}`} className={baseChipClasses(label === "Todos")}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={listClasses}>
      {ANIMAL_CATEGORIES.map(({ label, icon }) => {
        const isActive = label === active;

        return (
          <li key={label} className={itemClasses}>
            <button
              type="button"
              onClick={() => onSelect?.(label)}
              aria-pressed={isActive}
              className={baseChipClasses(isActive)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
