/** Integração com a API pública de localidades do IBGE. */

const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";
const REQUEST_TIMEOUT_MS = 8000;

export type IbgeState = {
  sigla: string;
  nome: string;
};

type IbgeStateResponse = { sigla?: unknown; nome?: unknown };
type IbgeCityResponse = { nome?: unknown };

/**
 * Busca as UFs ordenadas por nome. O sinal permite cancelar a requisição quando
 * o formulário é desmontado ou o estado selecionado muda.
 */
export async function getStates(signal?: AbortSignal): Promise<IbgeState[]> {
  const data = await fetchIbge<unknown>(`${IBGE_BASE_URL}/estados?orderBy=nome`, signal);

  if (!Array.isArray(data)) {
    throw new Error("Resposta inesperada do IBGE ao carregar estados.");
  }

  const states = data
    .filter((item): item is IbgeStateResponse => Boolean(item) && typeof item === "object")
    .flatMap((item) => {
      if (typeof item.sigla !== "string" || typeof item.nome !== "string") return [];
      return [{ sigla: item.sigla.toUpperCase(), nome: item.nome }];
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  if (states.length === 0) {
    throw new Error("Nenhum estado foi retornado pelo IBGE.");
  }

  return states;
}

/** Busca os municípios de uma UF, ordenados por nome. */
export async function getCities(state: string, signal?: AbortSignal): Promise<string[]> {
  const sigla = state.trim().toUpperCase();
  if (!sigla) return [];

  const data = await fetchIbge<unknown>(
    `${IBGE_BASE_URL}/estados/${encodeURIComponent(sigla)}/municipios?orderBy=nome`,
    signal,
  );

  if (!Array.isArray(data)) {
    throw new Error("Resposta inesperada do IBGE ao carregar cidades.");
  }

  const cities = data
    .filter((item): item is IbgeCityResponse => Boolean(item) && typeof item === "object")
    .flatMap((item) => (typeof item.nome === "string" ? [item.nome] : []))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  if (cities.length === 0) {
    throw new Error("Nenhum município foi retornado pelo IBGE.");
  }

  return cities;
}

async function fetchIbge<T>(url: string, externalSignal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const abort = () => controller.abort();
  if (externalSignal?.aborted) {
    abort();
  } else {
    externalSignal?.addEventListener("abort", abort, { once: true });
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Serviço de localidades indisponível.");
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abort);
  }
}
