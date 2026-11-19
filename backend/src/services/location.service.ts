/**
 * Consultas à API pública de localidades do IBGE, usadas para validar a
 * localização informada nos anúncios sem manter listas manuais no projeto.
 *
 * Documentação: https://servicodados.ibge.gov.br/api/docs/localidades
 */

import { HttpError } from "../lib/http-error";

const IBGE_API_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";
const REQUEST_TIMEOUT_MS = 5000;

type IbgeState = { sigla: string };
type IbgeCity = { nome: string };

let statesPromise: Promise<Set<string>> | undefined;
const citiesByState = new Map<string, Promise<Set<string>>>();

function ibgeUnavailable(): HttpError {
  return new HttpError(
    503,
    "Não foi possível validar a localização com a API do IBGE. Tente novamente em instantes.",
  );
}

async function fetchIbgeJson<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${IBGE_API_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw ibgeUnavailable();
  }

  if (!response.ok) {
    throw ibgeUnavailable();
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw ibgeUnavailable();
  }
}

/** Ignora acentos e caixa ao comparar nomes de municípios. */
function normalizeCity(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function getStates(): Promise<Set<string>> {
  if (!statesPromise) {
    statesPromise = fetchIbgeJson<IbgeState[]>("/estados?orderBy=nome")
      .then((states) => new Set(states.map((state) => state.sigla)))
      .catch((error: unknown) => {
        // Não guarda falhas em cache para permitir novas tentativas.
        statesPromise = undefined;
        throw error;
      });
  }

  return statesPromise;
}

function getCities(state: string): Promise<Set<string>> {
  const cached = citiesByState.get(state);
  if (cached) return cached;

  const request = fetchIbgeJson<IbgeCity[]>(`/estados/${encodeURIComponent(state)}/municipios?orderBy=nome`)
    .then((cities) => new Set(cities.map((city) => normalizeCity(city.nome))))
    .catch((error: unknown) => {
      citiesByState.delete(state);
      throw error;
    });

  citiesByState.set(state, request);
  return request;
}

/**
 * Verifica se a UF existe e se a cidade pertence a ela. A falha na consulta ao
 * IBGE impede a persistência de uma localização que não pôde ser confirmada.
 */
export async function assertValidLocation(state: string, city: string): Promise<void> {
  if (!/^[A-Z]{2}$/.test(state)) {
    throw new HttpError(400, "Estado deve ser a sigla (UF), como SP.");
  }

  const states = await getStates();
  if (!states.has(state)) {
    throw new HttpError(400, `Estado ${state} não é uma UF válida.`);
  }

  const cities = await getCities(state);
  if (!cities.has(normalizeCity(city))) {
    throw new HttpError(400, `A cidade "${city}" não pertence ao estado ${state}.`);
  }
}
