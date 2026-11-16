export type AnimalCategory = "Todos" | "Cães" | "Gatos" | "Aves" | "Outros";

export const ANIMAL_CATEGORIES: { label: AnimalCategory; icon: string }[] = [
  { label: "Todos", icon: "🐾" },
  { label: "Cães", icon: "🐶" },
  { label: "Gatos", icon: "🐱" },
  { label: "Aves", icon: "🐦" },
  { label: "Outros", icon: "🐰" },
];

const CATEGORY_SPECIES: Partial<Record<AnimalCategory, string[]>> = {
  "Cães": ["Cachorro"],
  "Gatos": ["Gato"],
  "Aves": ["Ave"],
};

/**
 * Relaciona uma categoria de exibição às espécies de um animal.
 * A espécie virá da API futuramente; aqui apenas organizamos o filtro mockado.
 */
export function matchesCategory(animalSpecies: string, category: AnimalCategory): boolean {
  if (category === "Todos") return true;

  const species = CATEGORY_SPECIES[category];
  if (species) return species.includes(animalSpecies);

  // "Outros": qualquer espécie que não tenha categoria própria.
  const known = Object.values(CATEGORY_SPECIES).flat();
  return !known.includes(animalSpecies);
}
