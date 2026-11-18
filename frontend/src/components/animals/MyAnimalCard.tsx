import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { AnimalStatusBadge } from "./AnimalStatusBadge";
import type { Animal } from "@/types/animal";

/** Formata a data de cadastro sem depender do fuso/local do navegador. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");

  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}`;
}

type MyAnimalCardProps = {
  animal: Animal;
  onOpenDelete: (animal: Animal) => void;
};

export function MyAnimalCard({ animal, onOpenDelete }: MyAnimalCardProps) {
  return (
    <li className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-brand-50">
            {animal.imageUrl ? (
              <Image
                src={animal.imageUrl}
                alt={`Foto de ${animal.name}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <img
                src="/images/animals/fallback.svg"
                alt={`Ilustração de ${animal.name}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-brand-950">{animal.name}</h3>
            <p className="text-sm text-slate-500">
              {animal.species}
              {animal.breed ? ` · ${animal.breed}` : ""}
              {` · ${animal.sex} · ${animal.size}`}
            </p>
            {formatDate(animal.createdAt) ? (
              <p className="mt-1 text-xs text-slate-400">Cadastrado em {formatDate(animal.createdAt)}</p>
            ) : null}
          </div>
        </div>

        <AnimalStatusBadge status={animal.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Link
          href={`/meus-animais/${animal.id}/editar`}
          className={buttonClasses({ variant: "outline", size: "sm" })}
          aria-label={`Editar anúncio de ${animal.name}`}
        >
          Editar
        </Link>

        <button
          type="button"
          onClick={() => onOpenDelete(animal)}
          className={buttonClasses({
            variant: "outline",
            size: "sm",
            className: "border-red-600 text-red-700 hover:bg-red-50 active:bg-red-100 focus-visible:outline-red-600",
          })}
          aria-label={`Excluir anúncio de ${animal.name}`}
        >
          Excluir
        </button>
      </div>
    </li>
  );
}
