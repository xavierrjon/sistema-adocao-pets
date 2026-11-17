import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { speciesArticle } from "@/lib/species";
import { AnimalStatusBadge } from "./AnimalStatusBadge";
import type { Animal } from "@/types/animal";

const FALLBACK_IMAGE = "/images/animals/fallback.svg";

export type AnimalCardProps = Pick<Animal, "id" | "name" | "species" | "breed" | "status" | "imageUrl">;

export function AnimalCard({ id, name, species, breed, status, imageUrl }: AnimalCardProps) {
  return (
    <Link
      href={`/animais/${id}`}
      aria-label={`Ver detalhes de ${name}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Foto de ${name}, ${speciesArticle(species)} ${species.toLowerCase()}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <img
            src={FALLBACK_IMAGE}
            alt={`Ilustração de ${name}, ${speciesArticle(species)} ${species.toLowerCase()}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <AnimalStatusBadge status={status} className="absolute left-3 top-3 shadow-sm" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="text-lg font-extrabold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500">
          {species}
          {breed ? ` · ${breed}` : ""}
        </p>
        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
          Ver detalhes
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
