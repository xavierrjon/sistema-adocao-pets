/** Formata a localização persistida no padrão "Cidade - UF". */
export function formatAnimalLocation(city?: string | null, state?: string | null): string | null {
  const parts = [city?.trim(), state?.trim()].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" - ") : null;
}
