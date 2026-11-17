import type {
  Animal,
  AnimalContact,
  CreateAnimalInput,
  UpdateAnimalInput,
} from "@/types/animal";
import { request } from "./api";

export type HealthResponse = {
  status: string;
};

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export function getAnimals(): Promise<Animal[]> {
  return request<Animal[]>("/animals");
}

export function getAnimalById(id: string): Promise<Animal> {
  return request<Animal>(`/animals/${encodeURIComponent(id)}`);
}

/** Contato do responsável: exige sessão ativa (cookie). */
export function getAnimalContact(id: string): Promise<AnimalContact> {
  return request<AnimalContact>(`/animals/${encodeURIComponent(id)}/contact`);
}

/** Lista os animais do usuário autenticado (rota protegida por sessão). */
export function listMyAnimals(): Promise<Animal[]> {
  return request<Animal[]>("/animals/me");
}

export function createAnimal(data: CreateAnimalInput): Promise<Animal> {
  return request<Animal>("/animals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAnimal(id: string, data: UpdateAnimalInput): Promise<Animal> {
  return request<Animal>(`/animals/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAnimal(id: string): Promise<void> {
  return request<void>(`/animals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
