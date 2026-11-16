import Link from "next/link";
import { AnimalGrid } from "@/components/animals/AnimalGrid";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Animal } from "@/types/animal";

type FeaturedAnimalsProps = {
  animals: Animal[];
};

export function FeaturedAnimals({ animals }: FeaturedAnimalsProps) {
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
        <AnimalGrid animals={featured} />
      </div>
    </section>
  );
}
