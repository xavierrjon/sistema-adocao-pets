/** Artigo para frases como "um gato" / "uma ave". */
export function speciesArticle(species: string): string {
  return species.toLowerCase().endsWith("a") ? "uma" : "um";
}
