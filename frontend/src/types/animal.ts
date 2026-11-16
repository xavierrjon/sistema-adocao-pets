export type AnimalStatus = "DISPONIVEL" | "EM_PROCESSO" | "ADOTADO";

export type Animal = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  sex: string;
  size: string;
  age?: string;
  description: string;
  status: AnimalStatus;
  location?: string;
  imageUrl?: string;
};
