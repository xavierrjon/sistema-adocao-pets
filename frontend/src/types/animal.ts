/** Contrato de dados retornado pela API AdoteJá. */

export type AnimalStatus = "DISPONIVEL" | "EM_PROCESSO" | "ADOTADO";

export type AnimalOwner = {
  id: string;
  name: string;
  whatsapp: string;
};

export type Animal = {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  description: string;
  status: AnimalStatus;
  whatsapp: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: AnimalOwner;
};

export type User = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnimalInput = Pick<
  Animal,
  "name" | "species" | "breed" | "sex" | "size" | "description" | "whatsapp" | "userId"
> & { status?: AnimalStatus };

export type UpdateAnimalInput = Partial<CreateAnimalInput>;
