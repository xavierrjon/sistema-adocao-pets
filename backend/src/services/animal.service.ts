import prisma from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import type { CreateAnimalInput, UpdateAnimalInput } from "../schemas/animal.schema";

const publicUserSelect = {
  id: true,
  name: true,
  whatsapp: true,
} as const;

export function listAnimals() {
  return prisma.animal.findMany({
    include: { user: { select: publicUserSelect } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAnimalById(id: string) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: { user: { select: publicUserSelect } },
  });

  if (!animal) {
    throw new HttpError(404, "Animal não encontrado.");
  }

  return animal;
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
