import type { Animal } from "@/types/animal";
import { ANIMALS_MOCK } from "./mock-animals";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthResponse = {
  status: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Falha na requisição para ${path}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Simula a latência de uma requisição real enquanto a API não está integrada.
 * Ao conectar o backend, remover o delay e trocar pelos endpoints reais.
 */
function withMockDelay<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const api = {
  getHealth: () => request<HealthResponse>("/api/health"),

  // TODO(API): substituir por request<Animal[]>("/api/animals") na integração.
  getAnimals: (): Promise<Animal[]> => withMockDelay(ANIMALS_MOCK),

  // TODO(API): substituir por request<Animal>(`/api/animals/${id}`) na integração.
  getAnimalById: (id: string): Promise<Animal | null> =>
    withMockDelay(ANIMALS_MOCK.find((animal) => animal.id === id) ?? null),
};
