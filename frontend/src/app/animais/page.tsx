"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AnimalFilters,
  type AnimalSexFilter,
  type AnimalSizeFilter,
} from "@/components/animals/AnimalFilters";
import { AnimalGrid } from "@/components/animals/AnimalGrid";
import { AnimalsEmptyState, AnimalsErrorState } from "@/components/animals/AnimalStates";
import { SearchBar } from "@/components/home/SearchBar";
import { Button } from "@/components/ui/Button";
import { getAnimals } from "@/services/animals";
import { categoryToSpecies, type AnimalCategory } from "@/lib/categories";
import type { Animal } from "@/types/animal";

const SEARCH_DEBOUNCE_MS = 300;

function isAnimalCategory(value: string | null): value is AnimalCategory {
  return ["Todos", "Cães", "Gatos", "Aves", "Outros"].includes(value ?? "");
}

function AnimaisContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria");
  const initialQuery = searchParams.get("q") ?? "";

  // Busca vinda da home (?q=...) inicia o filtro.
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [category, setCategory] = useState<AnimalCategory>(
    isAnimalCategory(initialCategory) ? initialCategory : "Todos",
  );
  const [sex, setSex] = useState<AnimalSexFilter>("");
  const [size, setSize] = useState<AnimalSizeFilter>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Evita uma requisição a cada tecla; o termo só é consultado após a pausa.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === debouncedQuery) return;

    const timeout = setTimeout(() => setDebouncedQuery(trimmed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query, debouncedQuery]);

  // Pesquisa e filtros são resolvidos pelo backend em uma única consulta.
  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setHasError(false);

    getAnimals({
      q: debouncedQuery || undefined,
      species: categoryToSpecies(category),
      sex: sex || undefined,
      size: size || undefined,
    })
      .then((result) => {
        if (active) setAnimals(result);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, category, sex, size, retryKey]);

  function handleSearch(value: string) {
    setQuery(value);
    // O envio do formulário não espera o debounce.
    setDebouncedQuery(value.trim());
  }

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setCategory("Todos");
    setSex("");
    setSize("");
  }

  const isDebouncing = query.trim() !== debouncedQuery;
  const isBusy = isLoading || isDebouncing;
  const activeFilterCount =
    (category !== "Todos" ? 1 : 0) + (sex !== "" ? 1 : 0) + (size !== "" ? 1 : 0);
  const hasActiveFilters = query.trim() !== "" || activeFilterCount > 0;
  const isInitialLoading = isLoading && animals.length === 0;

  return (
    <>
      <section className="bg-gradient-to-b from-brand-100 via-brand-50 to-background pb-10 pt-12">
        <div className="mx-auto w-full max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
              Animais para adoção
            </h1>
            <p className="text-slate-600">
              Todos esses amiguinhos estão procurando uma família para chamar de sua.
            </p>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            onToggleFilters={() => setIsFiltersOpen((isOpen) => !isOpen)}
            filtersOpen={isFiltersOpen}
            activeFilterCount={activeFilterCount}
            placeholder="Buscar por nome, raça, descrição ou espécie..."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {isFiltersOpen && (
          <div id="animal-filters" className="mt-4">
            <AnimalFilters
              activeCategory={category}
              onCategoryChange={setCategory}
              sex={sex}
              onSexChange={setSex}
              size={size}
              onSizeChange={setSize}
              onClearFilters={clearFilters}
              hasActiveFilters={activeFilterCount > 0}
            />
          </div>
        )}

        <div className="mt-6">
          {!hasError && (
            <p className="mb-4 text-sm text-slate-500" role="status" aria-live="polite">
              {isBusy
                ? "Atualizando resultados..."
                : animals.length === 1
                  ? "1 animal encontrado"
                  : `${animals.length} animais encontrados`}
            </p>
          )}

          {hasError ? (
            <AnimalsErrorState onRetry={() => setRetryKey((value) => value + 1)} />
          ) : isInitialLoading ? (
            <AnimalGrid animals={[]} isLoading />
          ) : animals.length === 0 ? (
            hasActiveFilters ? (
              <AnimalsEmptyState onClearFilters={clearFilters} />
            ) : (
              <AnimalsEmptyState
                title="Ainda não há animais cadastrados"
                message="Em breve novos amiguinhos aparecerão por aqui."
              />
            )
          ) : (
            <div aria-busy={isBusy} className={isBusy ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <AnimalGrid animals={animals} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function AnimaisPage() {
  return (
    <Suspense fallback={<AnimaisLoadingFallback />}>
      <AnimaisContent />
    </Suspense>
  );
}

function AnimaisLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Button variant="secondary" disabled>
        Carregando animais...
      </Button>
    </div>
  );
}
