import { CategoryList } from "@/components/home/CategoryList";
import { FeaturedAnimals } from "@/components/home/FeaturedAnimals";
import { Hero } from "@/components/home/Hero";

export default function Home() {
  return (
    <>
      <Hero />

      <section
        className="mx-auto w-full max-w-6xl px-4 pt-6 pb-2 sm:px-6 lg:px-8"
        aria-label="Categorias de animais"
      >
        <CategoryList asLinks scrollable />
      </section>

      {/* A listagem carrega pelo cliente (ver FeaturedAnimals). */}
      <FeaturedAnimals />
    </>
  );
}
