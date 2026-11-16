import { CategoryList } from "@/components/home/CategoryList";
import type { AnimalCategory } from "@/lib/categories";

type AnimalFiltersProps = {
  active: AnimalCategory;
  onSelect: (category: AnimalCategory) => void;
  resultCount: number;
  /** Oculta a contagem enquanto a lista carrega. */
  isLoading?: boolean;
};

export function AnimalFilters({ active, onSelect, resultCount, isLoading = false }: AnimalFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <CategoryList active={active} onSelect={onSelect} />
      {!isLoading && (
        <p className="text-sm text-slate-500" role="status" aria-live="polite">
          {resultCount === 1 ? "1 animal encontrado" : `${resultCount} animais encontrados`}
        </p>
      )}
    </div>
  );
}
