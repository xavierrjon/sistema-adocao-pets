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
 * Converte a categoria exibida na vitrine para o parâmetro `species` da API.
 * "Outros" é enviado como `Outro`, que o backend traduz para todas as espécies
 * que não são cães, gatos nem aves.
 */
export function categoryToSpecies(category: AnimalCategory): string | undefined {
  if (category === "Todos") return undefined;
  return CATEGORY_SPECIES[category]?.[0] ?? "Outro";
}
