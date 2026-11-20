import { CategoryList } from "@/components/home/CategoryList";
import { FeaturedAnimals } from "@/components/home/FeaturedAnimals";
import { Hero } from "@/components/home/Hero";
import { SearchBar } from "@/components/home/SearchBar";

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Busca de animais">
        <SearchBar />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8" aria-label="Categorias de animais">
        <CategoryList asLinks />
      </section>

      {/* A listagem carrega pelo cliente (ver FeaturedAnimals). */}
      <FeaturedAnimals />
    </>
  );
}
