import type { Request, Response } from "express";
import { getAuthenticatedUser } from "../middlewares/auth.middleware";
import * as animalService from "../services/animal.service";
import {
  animalParamsSchema,
  createAnimalSchema,
  updateAnimalSchema,
} from "../schemas/animal.schema";

export async function listAnimals(_request: Request, response: Response) {
  const animals = await animalService.listAnimals();
  response.status(200).json(animals);
}

export async function getAnimal(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  const animal = await animalService.getAnimalById(id);
  response.status(200).json(animal);
}

export async function createAnimal(request: Request, response: Response) {
  const data = createAnimalSchema.parse(request.body);
  const animal = await animalService.createAnimal(getAuthenticatedUser(request).id, data);
  response.status(201).json(animal);
}

export async function updateAnimal(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  const data = updateAnimalSchema.parse(request.body);
  const animal = await animalService.updateAnimal(id, getAuthenticatedUser(request).id, data);
  response.status(200).json(animal);
}

export async function deleteAnimal(request: Request, response: Response) {
  const { id } = animalParamsSchema.parse(request.params);
  await animalService.deleteAnimal(id, getAuthenticatedUser(request).id);
  response.status(204).send();
}
