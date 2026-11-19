import type { ReactNode } from "react";
import { CategoryList } from "@/components/home/CategoryList";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import type { AnimalCategory } from "@/lib/categories";

export type AnimalSexFilter = "" | "Macho" | "Femea";
export type AnimalSizeFilter = "" | "Pequeno" | "Medio" | "Grande";

type AnimalFiltersProps = {
  activeCategory: AnimalCategory;
  onCategoryChange: (category: AnimalCategory) => void;
  sex: AnimalSexFilter;
  onSexChange: (sex: AnimalSexFilter) => void;
  size: AnimalSizeFilter;
  onSizeChange: (size: AnimalSizeFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

const SEX_OPTIONS: { value: AnimalSexFilter; label: string }[] = [
  { value: "", label: "Todos os sexos" },
  { value: "Macho", label: "Macho" },
  { value: "Femea", label: "Fêmea" },
];

const SIZE_OPTIONS: { value: AnimalSizeFilter; label: string }[] = [
  { value: "", label: "Todos os portes" },
  { value: "Pequeno", label: "Pequeno" },
  { value: "Medio", label: "Médio" },
  { value: "Grande", label: "Grande" },
];

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

function FilterSelect({ id, label, value, onChange, children }: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
      >
        {children}
      </select>
    </div>
  );
}

type ActiveFilter = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

export function AnimalFilters({
  activeCategory,
  onCategoryChange,
  sex,
  onSexChange,
  size,
  onSizeChange,
  onClearFilters,
  hasActiveFilters,
}: AnimalFiltersProps) {
  const activeFilters: ActiveFilter[] = [];

  if (activeCategory !== "Todos") {
    activeFilters.push({
      key: "category",
      label: "Espécie",
      value: activeCategory,
      onRemove: () => onCategoryChange("Todos"),
    });
  }

  if (sex) {
    activeFilters.push({
      key: "sex",
      label: "Sexo",
      value: SEX_OPTIONS.find((option) => option.value === sex)?.label ?? sex,
      onRemove: () => onSexChange(""),
    });
  }

  if (size) {
    activeFilters.push({
      key: "size",
      label: "Porte",
      value: SIZE_OPTIONS.find((option) => option.value === size)?.label ?? size,
      onRemove: () => onSizeChange(""),
    });
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-slate-900">Filtrar animais</h2>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <p id="species-filter-label" className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Espécie
          </p>
          <CategoryList active={activeCategory} onSelect={onCategoryChange} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FilterSelect
            id="filter-sex"
            label="Sexo"
            value={sex}
            onChange={(value) => onSexChange(value as AnimalSexFilter)}
          >
            {SEX_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            id="filter-size"
            label="Porte"
            value={size}
            onChange={(value) => onSizeChange(value as AnimalSizeFilter)}
          >
            {SIZE_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>

        {activeFilters.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
            {activeFilters.map((filter) => (
              <li key={filter.key}>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm font-semibold text-brand-800 ring-1 ring-brand-200">
                  {filter.label}: {filter.value}
                  <button
                    type="button"
                    onClick={filter.onRemove}
                    aria-label={`Remover filtro ${filter.label}`}
                    title={`Remover filtro ${filter.label}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
