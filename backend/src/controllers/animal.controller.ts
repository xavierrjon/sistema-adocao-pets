import type { Request, Response } from "express";
import { getAuthenticatedUser } from "../middlewares/auth.middleware";
import * as animalService from "../services/animal.service";
import * as locationService from "../services/location.service";
import * as storageService from "../services/storage.service";
import {
  animalParamsSchema,
  createAnimalSchema,
  updateAnimalSchema,
} from "../schemas/animal.schema";

export async function listAnimals(_request: Request, response: Response) {
  const animals = await animalService.listAnimals();
  response.status(200).json(animals);
}

export async function listMyAnimals(request: Request, response: Response) {
  const animals = await animalService.listUserAnimals(getAuthenticatedUser(request).id);
  response.status(200).json(animals);
}

export async function getAnimal(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  const animal = await animalService.getAnimalById(id);
  response.status(200).json(animal);
}

export async function getContact(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  const contact = await animalService.getAnimalContact(id);
  response.status(200).json(contact);
}

export async function createAnimal(request: Request, response: Response) {
  const data = createAnimalSchema.parse(request.body);

  // Valida a localização antes de qualquer efeito externo (upload de imagem).
  await locationService.assertValidLocation(data.state, data.city);

  // O upload ocorre antes da criação do registro; se o banco falhar depois,
  // o arquivo recém-enviado é descartado para não deixar órfãos.
  const uploadedImage = request.file
    ? await storageService.uploadAnimalImage({ buffer: request.file.buffer, size: request.file.size })
    : undefined;

  try {
    const animal = await animalService.createAnimal(getAuthenticatedUser(request).id, data, uploadedImage);
    response.status(201).json(animal);
  } catch (error) {
    if (uploadedImage) {
      await storageService.deleteAnimalImage(uploadedImage.publicId);
    }
    throw error;
  }
}

export async function updateAnimal(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  const data = updateAnimalSchema.parse(request.body);
  const userId = getAuthenticatedUser(request).id;

  // A propriedade é verificada antes do upload: terceiros não devem
  // conseguir disparar envios para o armazenamento.
  await animalService.assertAnimalOwnership(id, userId, "editar");

  // Edições parciais (por exemplo, apenas status) não precisam revalidar a
  // localização já persistida; anúncios antigos sem localização continuam
  // funcionando normalmente.
  if (data.state && data.city) {
    await locationService.assertValidLocation(data.state, data.city);
  }

  const uploadedImage = request.file
    ? await storageService.uploadAnimalImage({ buffer: request.file.buffer, size: request.file.size })
    : undefined;

  try {
    const animal = await animalService.updateAnimal(id, userId, data, {
      newImage: uploadedImage,
      // Campo texto do multipart: "true" indica que o usuário removeu a imagem.
      removeImage: !uploadedImage && request.body.removeImage === "true",
    });
    response.status(200).json(animal);
  } catch (error) {
    if (uploadedImage) {
      await storageService.deleteAnimalImage(uploadedImage.publicId);
    }
    throw error;
  }
}

export async function deleteAnimal(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  await animalService.deleteAnimal(id, getAuthenticatedUser(request).id);
  response.status(204).send();
}
