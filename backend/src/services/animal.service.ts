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

export async function createAnimal(data: CreateAnimalInput) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true },
  });

  if (!user) {
    throw new HttpError(404, "Usuário não encontrado.");
  }

  return prisma.animal.create({ data });
}

export async function updateAnimal(id: string, data: UpdateAnimalInput) {
  await getAnimalById(id);

  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    });

    if (!user) {
      throw new HttpError(404, "Usuário não encontrado.");
    }
  }

  return prisma.animal.update({ where: { id }, data });
}

export async function deleteAnimal(id: string) {
  await getAnimalById(id);
  await prisma.animal.delete({ where: { id } });
}
