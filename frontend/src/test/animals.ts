import type { Animal } from "@/types/animal";

export function makeAnimal(overrides: Partial<Animal> = {}): Animal {
  const base: Animal = {
    id: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01",
    name: "Amber",
    species: "Gato",
    breed: "SRD",
    sex: "Femea",
    size: "Medio",
    description: "Gatinha dócil e carinhosa que procura um novo lar.",
    status: "DISPONIVEL",
    userId: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
    createdAt: "2026-11-17T12:00:00.000Z",
    updatedAt: "2026-11-17T12:00:00.000Z",
    user: {
      id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
      name: "Maria Silva",
    },
  };

  return { ...base, ...overrides };
}
