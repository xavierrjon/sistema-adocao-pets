"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRightIcon, CloseIcon, FilterIcon, SearchIcon } from "@/components/ui/icons";

type SearchBarProps = {
  /** Valor controlado (opcional) para uso em páginas que filtram em memória. */
  value?: string;
  onChange?: (value: string) => void;
  /** Chamado ao enviar o formulário; sem ele, navega para `/animais?q=...`. */
  onSubmit?: (query: string) => void;
  /** Exibe o botão que abre e fecha o painel de filtros. */
  onToggleFilters?: () => void;
  filtersOpen?: boolean;
  /** Quantidade de filtros ativos, mostrada como badge no botão. */
  activeFilterCount?: number;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onToggleFilters,
  filtersOpen = false,
  activeFilterCount = 0,
  placeholder = "Buscar por nome, raça ou espécie...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState("");

  const isControlled = value !== undefined;
  const query = isControlled ? value : internalValue;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(query);
      return;
    }

    const trimmed = query.trim();
    router.push(trimmed ? `/animais?q=${encodeURIComponent(trimmed)}` : "/animais");
  }

  function handleChange(nextValue: string) {
    if (isControlled) {
      onChange?.(nextValue);
    } else {
      setInternalValue(nextValue);
    }
  }

  function handleClear() {
    handleChange("");
    onSubmit?.("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar animais"
      className={`flex items-center gap-2 sm:gap-3 ${className}`}
    >
      {/* No mobile a seta fica dentro do campo; no desktop ela volta a ser o botão ao lado. */}
      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <Input
            type="search"
            name="q"
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder={placeholder}
            aria-label="Buscar por nome, raça ou espécie"
            className={`pl-11 ${query ? "pr-20 sm:pr-12" : "pr-11 sm:pr-5"}`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              title="Limpar busca"
              className="absolute right-10 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-2"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          aria-label="Buscar"
          className="absolute right-1.5 top-1/2 h-8 w-8 shrink-0 p-0 -translate-y-1/2 sm:static sm:h-auto sm:w-auto sm:translate-y-0 sm:px-6 sm:py-3"
        >
          <ArrowRightIcon className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </div>
      {onToggleFilters && (
        <Button
          type="button"
          variant={filtersOpen ? "secondary" : "outline"}
          size="icon"
          onClick={onToggleFilters}
          aria-expanded={filtersOpen}
          aria-controls={filtersOpen ? "animal-filters" : undefined}
          aria-label={
            `${filtersOpen ? "Ocultar" : "Mostrar"} filtros` +
            (activeFilterCount > 0
              ? ` (${activeFilterCount} ${activeFilterCount === 1 ? "ativo" : "ativos"})`
              : "")
          }
          className="sm:h-auto sm:w-auto sm:px-6 sm:py-3"
        >
          <FilterIcon className="h-5 w-5 sm:hidden" />
          <FilterIcon className="hidden h-4 w-4 sm:block" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilterCount > 0 && (
            <>
              {/* No mobile, um ponto discreto sinaliza filtros ativos sem ocupar espaço. */}
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-600 sm:hidden" />
              <span className="hidden h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-extrabold text-white sm:inline-flex">
                {activeFilterCount}
              </span>
            </>
          )}
        </Button>
      )}
    </form>
  );
}
