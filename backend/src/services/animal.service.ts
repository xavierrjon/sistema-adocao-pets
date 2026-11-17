import prisma from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import type { CreateAnimalInput, UpdateAnimalInput } from "../schemas/animal.schema";
import { deleteAnimalImage, type UploadedImage } from "./storage.service";

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
  imageUrl: string | null;
  imagePublicId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  /** Presente nas consultas com include; ausente no retorno direto de create/update. */
  user?: { id: string; name: string; whatsapp?: string | null } | null;
};

const publicUserSelect = {
  id: true,
  name: true,
} as const;

/** Remove o contato privado e os detalhes internos antes de expor o animal. */
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
    imageUrl: animal.imageUrl ?? null,
    userId: animal.userId,
    createdAt: animal.createdAt,
    updatedAt: animal.updatedAt,
    user: animal.user ? { id: animal.user.id, name: animal.user.name } : null,
  };
}

/** Busca o registro completo (inclusive dados internos de imagem). */
async function getAnimalRecord(id: string): Promise<AnimalRecord> {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: { user: { select: publicUserSelect } },
  });

  if (!animal) {
    throw new HttpError(404, "Animal não encontrado.");
  }

  return animal;
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
  return toPublicAnimal(await getAnimalRecord(id));
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

export async function createAnimal(userId: string, data: CreateAnimalInput, image?: UploadedImage) {
  const created = await prisma.animal.create({
    data: {
      ...data,
      userId,
      imageUrl: image?.url ?? null,
      imagePublicId: image?.publicId ?? null,
    },
  });

  return toPublicAnimal(created);
}

type ImageChange = {
  /** Imagem nova enviada na edição (substitui a existente). */
  newImage?: UploadedImage;
  /** Quando o usuário remove a imagem sem enviar outra. */
  removeImage?: boolean;
};

/**
 * Atualiza o anúncio após verificar a propriedade. O arquivo antigo no
 * armazenamento é removido somente depois que a atualização no banco é
 * concluída, evitando perder a imagem em caso de falha.
 */
export async function updateAnimal(
  id: string,
  userId: string,
  data: UpdateAnimalInput,
  imageChange: ImageChange = {},
) {
  const animal = await getAnimalRecord(id);

  if (animal.userId !== userId) {
    throw new HttpError(403, "Você não tem permissão para editar este animal.");
  }

  const imageFields: { imageUrl?: string | null; imagePublicId?: string | null } = {};

  if (imageChange.newImage) {
    imageFields.imageUrl = imageChange.newImage.url;
    imageFields.imagePublicId = imageChange.newImage.publicId;
  } else if (imageChange.removeImage) {
    imageFields.imageUrl = null;
    imageFields.imagePublicId = null;
  }

  const updated = await prisma.animal.update({ where: { id }, data: { ...data, ...imageFields } });

  // Substituição ou remoção concluída no banco: descarta o arquivo antigo.
  if (animal.imagePublicId && (imageChange.newImage || imageChange.removeImage)) {
    await deleteAnimalImage(animal.imagePublicId);
  }

  return toPublicAnimal(updated);
}

/**
 * Exclui o anúncio após verificar a propriedade e remove o arquivo associado
 * do armazenamento (falha de remoção é apenas registrada, sem desfazer a
 * exclusão do registro).
 */
export async function deleteAnimal(id: string, userId: string) {
  const animal = await getAnimalRecord(id);

  if (animal.userId !== userId) {
    throw new HttpError(403, "Você não tem permissão para excluir este animal.");
  }

  await prisma.animal.delete({ where: { id } });

  if (animal.imagePublicId) {
    await deleteAnimalImage(animal.imagePublicId);
  }
}
