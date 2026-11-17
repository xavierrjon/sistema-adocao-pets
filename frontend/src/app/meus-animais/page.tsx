"use client";

import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AnimalStatusBadge } from "@/components/animals/AnimalStatusBadge";
import { Button } from "@/components/ui/Button";
import { listMyAnimals } from "@/services/animals";
import type { Animal } from "@/types/animal";

function MyAnimalsContent() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadAnimals = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    listMyAnimals()
      .then(setAnimals)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(loadAnimals, [loadAnimals]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">Meus animais</h1>
      <p className="mt-2 text-slate-600">Anúncios cadastrados com a sua conta.</p>

      <div className="mt-8">
        {isLoading ? (
          <p role="status" className="text-sm text-slate-500">
            Carregando seus animais...
          </p>
        ) : hasError ? (
          <div className="space-y-3 rounded-2xl bg-red-50 px-4 py-3">
            <p role="alert" className="text-sm font-semibold text-red-700">
              Não foi possível carregar seus animais.
            </p>
            <Button variant="outline" size="sm" onClick={loadAnimals}>
              Tentar novamente
            </Button>
          </div>
        ) : animals.length === 0 ? (
          <p className="text-sm text-slate-500">Você ainda não cadastrou nenhum animal.</p>
        ) : (
          <ul className="space-y-3">
            {animals.map((animal) => (
              <li
                key={animal.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100"
              >
                <div>
                  <p className="font-bold text-brand-950">{animal.name}</p>
                  <p className="text-sm text-slate-500">
                    {animal.species}
                    {animal.breed ? ` · ${animal.breed}` : ""}
                  </p>
                </div>
                <AnimalStatusBadge status={animal.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function MyAnimalsPage() {
  return (
    <ProtectedRoute>
      <MyAnimalsContent />
    </ProtectedRoute>
  );
}
