/** Aceita apenas caminhos locais, evitando open redirect em `?next=`. */
export function safeNextPath(value: string | string[] | null | undefined, fallback = "/"): string {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  if (candidate.includes("://") || candidate.includes("\\")) {
    return fallback;
  }

  return candidate;
}

export function withNext(path: string, next: string): string {
  return next === "/" ? path : `${path}?next=${encodeURIComponent(next)}`;
}
