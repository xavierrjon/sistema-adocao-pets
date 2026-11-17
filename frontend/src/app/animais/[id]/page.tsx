"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdoptionContact } from "@/components/animals/AdoptionContact";
import { AnimalInfoTile } from "@/components/animals/AnimalInfoTile";
import { AnimalStatusBadge } from "@/components/animals/AnimalStatusBadge";
import {
  AnimalDetailsError,
  AnimalDetailsLoading,
  AnimalDetailsNotFound,
} from "@/components/animals/AnimalDetailsStates";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { speciesArticle } from "@/lib/species";
import { ApiError } from "@/services/api";
import { getAnimalById } from "@/services/animals";
import type { Animal } from "@/types/animal";

type DetailsState =
  | { status: "loading" }
  | { status: "found"; animal: Animal }
  | { status: "notFound" }
  | { status: "error" };

export default function AnimalDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const [state, setState] = useState<DetailsState>({ status: "loading" });

  const loadAnimal = useCallback(() => {
    setState({ status: "loading" });

    getAnimalById(id)
      .then((animal) => setState({ status: "found", animal }))
      .catch((error: unknown) => {
        setState(
          error instanceof ApiError && error.status === 404
            ? { status: "notFound" }
            : { status: "error" },
        );
      });
  }, [id]);

  useEffect(loadAnimal, [loadAnimal]);

  if (state.status === "loading") {
    return <AnimalDetailsLoading />;
  }

  if (state.status === "notFound") {
    return <AnimalDetailsNotFound />;
  }

  if (state.status === "error") {
    return <AnimalDetailsError onRetry={loadAnimal} />;
  }

  const { animal } = state;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/animais"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar
      </Link>

      <article className="mt-6 space-y-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="relative aspect-[16/9] bg-brand-50">
            {animal.imageUrl ? (
              <Image
                src={animal.imageUrl}
                alt={`Foto de ${animal.name}, ${speciesArticle(animal.species)} ${animal.species.toLowerCase()}`}
                fill
                sizes="(min-width: 896px) 896px, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <img
                src="/images/animals/fallback.svg"
                alt={`Ilustração de ${animal.name}, ${speciesArticle(animal.species)} ${animal.species.toLowerCase()}`}
                className="aspect-[16/9] w-full object-cover"
              />
            )}
          </div>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">{animal.name}</h1>
          <p className="font-semibold text-slate-600">
            {animal.species} · {animal.breed}
          </p>
          <AnimalStatusBadge status={animal.status} full />
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Informações do animal">
          <li>
            <AnimalInfoTile label="Sexo" value={animal.sex} />
          </li>
          <li>
            <AnimalInfoTile label="Porte" value={animal.size} />
          </li>
          <li>
            <AnimalInfoTile label="Espécie" value={animal.species} />
          </li>
          <li>
            <AnimalInfoTile label="Raça" value={animal.breed} />
          </li>
          <li>
            <AnimalInfoTile label="Responsável" value={animal.user?.name ?? "Não informado"} />
          </li>
        </ul>

        <section className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-brand-950">Sobre {animal.name}</h2>
          <p className="leading-relaxed text-slate-600">{animal.description}</p>
        </section>

        <footer className="border-t border-slate-200 pt-8">
          <AdoptionContact animalId={animal.id} animalName={animal.name} />
        </footer>
      </article>
    </div>
  );
}
