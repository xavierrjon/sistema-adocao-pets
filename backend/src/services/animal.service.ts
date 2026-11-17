import prisma from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import type { CreateAnimalInput, UpdateAnimalInput } from "../schemas/animal.schema";

type AnimalRecord = {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  description: string;
  status: string;
  whatsapp: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; whatsapp?: string | null } | null;
};

const publicUserSelect = {
  id: true,
  name: true,
} as const;

/** Remove o contato privado antes de expor o animal a qualquer visitante. */
function toPublicAnimal(animal: AnimalRecord) {
  return {
    id: animal.id,
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    sex: animal.sex,
    size: animal.size,
    description: animal.description,
    status: animal.status,
    userId: animal.userId,
    createdAt: animal.createdAt,
    updatedAt: animal.updatedAt,
    user: animal.user ? { id: animal.user.id, name: animal.user.name } : null,
  };
}

export async function listAnimals() {
  const animals = await prisma.animal.findMany({
    include: { user: { select: publicUserSelect } },
    orderBy: { createdAt: "desc" },
  });

  return animals.map(toPublicAnimal);
}

export async function listUserAnimals(userId: string) {
  const animals = await prisma.animal.findMany({
    where: { userId },
    include: { user: { select: publicUserSelect } },
    orderBy: { createdAt: "desc" },
  });

  return animals.map(toPublicAnimal);
}

export async function getAnimalById(id: string) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: { user: { select: publicUserSelect } },
  });

  if (!animal) {
    throw new HttpError(404, "Animal não encontrado.");
  }

  return toPublicAnimal(animal);
}

/** Contato do responsável: disponível somente para usuários autenticados. */
export async function getAnimalContact(id: string) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!animal) {
    throw new HttpError(404, "Animal não encontrado.");
  }

  return {
    animalId: animal.id,
    animalName: animal.name,
    responsibleName: animal.user.name,
    whatsapp: animal.whatsapp,
  };
}

export async function createAnimal(userId: string, data: CreateAnimalInput) {
  return prisma.animal.create({
    data: { ...data, userId },
  });
}

export async function updateAnimal(id: string, userId: string, data: UpdateAnimalInput) {
  const animal = await getAnimalById(id);

  if (animal.userId !== userId) {
    throw new HttpError(403, "Você não tem permissão para editar este animal.");
  }

  return prisma.animal.update({ where: { id }, data });
}

export async function deleteAnimal(id: string, userId: string) {
  const animal = await getAnimalById(id);

  if (animal.userId !== userId) {
    throw new HttpError(403, "Você não tem permissão para excluir este animal.");
  }

  await prisma.animal.delete({ where: { id } });
}
