"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimalFilters } from "@/components/animals/AnimalFilters";
import { AnimalGrid } from "@/components/animals/AnimalGrid";
import { AnimalsEmptyState, AnimalsErrorState } from "@/components/animals/AnimalStates";
import { SearchBar } from "@/components/home/SearchBar";
import { Button } from "@/components/ui/Button";
import { getAnimals } from "@/services/animals";
import { matchesCategory, type AnimalCategory } from "@/lib/categories";
import type { Animal } from "@/types/animal";

function isAnimalCategory(value: string | null): value is AnimalCategory {
  return ["Todos", "Cães", "Gatos", "Aves", "Outros"].includes(value ?? "");
}

function AnimaisContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria");
  // Busca vinda da home (?q=...) inicia o filtro.
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [category, setCategory] = useState<AnimalCategory>(
    isAnimalCategory(initialCategory) ? initialCategory : "Todos",
  );

  const loadAnimals = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    getAnimals()
      .then(setAnimals)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(loadAnimals, [loadAnimals]);

  function clearFilters() {
    setCategory("Todos");
    setQuery("");
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredAnimals = animals.filter((animal) => {
    const matchesQuery =
      !normalizedQuery ||
      [animal.name, animal.species, animal.breed ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesQuery && matchesCategory(animal.species, category);
  });

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

          <SearchBar value={query} onChange={setQuery} onSubmit={setQuery} placeholder="Buscar por nome, raça ou espécie..." />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-2">
          <AnimalFilters active={category} onSelect={setCategory} resultCount={filteredAnimals.length} isLoading={isLoading} />
        </div>

        <div className="mt-6">
          {hasError ? (
            <AnimalsErrorState onRetry={loadAnimals} />
          ) : !isLoading && filteredAnimals.length === 0 ? (
            normalizedQuery || category !== "Todos" ? (
              <AnimalsEmptyState onClearFilters={clearFilters} />
            ) : (
              <AnimalsEmptyState
                title="Ainda não há animais cadastrados"
                message="Em breve novos amiguinhos aparecerão por aqui."
              />
            )
          ) : (
            <AnimalGrid animals={filteredAnimals} isLoading={isLoading} />
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
