"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimalGrid } from "@/components/animals/AnimalGrid";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getAnimals } from "@/services/animals";
import type { Animal } from "@/types/animal";

/**
 * Listagem em destaque da home. Carrega pelo navegador, como a página
 * `/animais`: com `NEXT_PUBLIC_API_URL=/api`, a URL relativa só resolve
 * via rewrite no cliente (o `fetch` do servidor não aceita URL relativa).
 */
export function FeaturedAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getAnimals()
      .then((result) => {
        if (active) setAnimals(result);
      })
      .catch(() => {
        // A home continua disponível mesmo quando a API não responde.
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featured = animals.filter((animal) => animal.status === "DISPONIVEL").slice(0, 6);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-950">Animais disponíveis</h2>
          <p className="text-slate-600">Conheça quem está esperando por uma chance de ser feliz.</p>
        </div>
        <Link
          href="/animais"
          className={buttonClasses({ variant: "secondary", size: "md", className: "w-fit" })}
        >
          Ver todos
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8">
        <AnimalGrid animals={featured} isLoading={isLoading} />
      </div>
    </section>
  );
}
