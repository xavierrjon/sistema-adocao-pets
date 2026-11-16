import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimalInfoTile } from "@/components/animals/AnimalInfoTile";
import { AnimalStatusBadge } from "@/components/animals/AnimalStatusBadge";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, MapPinIcon } from "@/components/ui/icons";
import { api } from "@/lib/api";
import { speciesArticle } from "@/lib/species";

type AnimalDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AnimalDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const animal = await api.getAnimalById(id);

  return {
    title: animal ? `${animal.name} — AdoteJá` : "Animal não encontrado — AdoteJá",
    description: animal?.description,
  };
}

export default async function AnimalDetailsPage({ params }: AnimalDetailsPageProps) {
  const { id } = await params;
  const animal = await api.getAnimalById(id);

  if (!animal) {
    notFound();
  }

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
          <img
            src={animal.imageUrl ?? "/images/animals/fallback.svg"}
            alt={`Ilustração de ${animal.name}, ${speciesArticle(animal.species)} ${animal.species.toLowerCase()}`}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">{animal.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600">
            <span className="font-semibold">
              {animal.species}
              {animal.breed ? ` · ${animal.breed}` : ""}
            </span>
            {animal.location && (
              <span className="flex items-center gap-1.5 text-sm">
                <MapPinIcon className="h-4 w-4 text-brand-600" />
                {animal.location}
              </span>
            )}
          </div>
          <AnimalStatusBadge status={animal.status} full />
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Informações do animal">
          <li>
            <AnimalInfoTile label="Sexo" value={animal.sex} />
          </li>
          <li>
            <AnimalInfoTile label="Idade" value={animal.age ?? "Não informado"} />
          </li>
          <li>
            <AnimalInfoTile label="Porte" value={animal.size} />
          </li>
          <li>
            <AnimalInfoTile label="Espécie" value={animal.species} />
          </li>
          <li>
            <AnimalInfoTile label="Raça" value={animal.breed ?? "SRD"} />
          </li>
          <li>
            <AnimalInfoTile label="Localização" value={animal.location ?? "Não informado"} />
          </li>
        </ul>

        <section className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-brand-950">Sobre {animal.name}</h2>
          <p className="leading-relaxed text-slate-600">{animal.description}</p>
        </section>

        <footer className="space-y-3 border-t border-slate-200 pt-8">
          <Button size="lg" className="w-full sm:w-auto">
            Quero adotar 🐾
          </Button>
          <p className="text-sm text-slate-500">
            Em breve o contato será feito direto pelo WhatsApp. Por enquanto, essa ação é apenas visual.
          </p>
        </footer>
      </article>
    </div>
  );
}
