import { FeaturedAnimals } from "@/components/home/FeaturedAnimals";
import { Hero } from "@/components/home/Hero";

export default function Home() {
  return (
    <>
      <Hero />

      {/* A listagem carrega pelo cliente (ver FeaturedAnimals). */}
      <FeaturedAnimals />
    </>
  );
}
