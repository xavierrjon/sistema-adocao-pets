import type {
  Animal,
  AnimalContact,
  CreateAnimalInput,
  UpdateAnimalInput,
} from "@/types/animal";
import { request } from "./api";

/** Filtros aceitos pela listagem pública (`GET /animals`). */
export type AnimalListFilters = {
  /** Pesquisa por nome, raça, descrição ou espécie. */
  q?: string;
  species?: string;
  sex?: string;
  size?: string;
};

export function getAnimals(filters: AnimalListFilters = {}): Promise<Animal[]> {
  const params = new URLSearchParams();

  const query = filters.q?.trim();
  if (query) params.set("q", query);
  if (filters.species) params.set("species", filters.species);
  if (filters.sex) params.set("sex", filters.sex);
  if (filters.size) params.set("size", filters.size);

  const search = params.toString();
  return request<Animal[]>(`/animals${search ? `?${search}` : ""}`);
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

/**
 * Campos do anúncio enviados no cadastro. O WhatsApp é opcional na tipagem
 * porque o formulário de edição não o pré-preenche (privacidade); o backend
 * valida a presença dele no cadastro.
 */
export type CreateAnimalFormData = Omit<CreateAnimalInput, "whatsapp"> & { whatsapp?: string };

export function createAnimal(data: CreateAnimalFormData, image?: File | null): Promise<Animal> {
  return request<Animal>("/animals", {
    method: "POST",
    body: buildAnimalFormData(data, { file: image ?? null, removeImage: false }),
  });
}

export function updateAnimal(
  id: string,
  data: UpdateAnimalInput,
  image?: { file?: File | null; removeImage?: boolean },
): Promise<Animal> {
  return request<Animal>(`/animals/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: buildAnimalFormData(data, image),
  });
}

export function deleteAnimal(id: string): Promise<void> {
  return request<void>(`/animals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Monta o multipart esperado pela API: campos como texto, o arquivo no campo
 * `image` e `removeImage=true` quando o usuário removeu a foto na edição.
 */
function buildAnimalFormData(
  data: Record<string, string | undefined>,
  image?: { file?: File | null; removeImage?: boolean },
): FormData {
  const form = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value != null && value !== "") {
      form.append(key, value);
    }
  }

  if (image?.file) {
    form.append("image", image.file);
  } else if (image?.removeImage) {
    form.append("removeImage", "true");
  }

  return form;
}
