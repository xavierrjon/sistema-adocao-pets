/** Contrato de dados retornado pela API AdoteJá. */

export type AnimalStatus = "DISPONIVEL" | "EM_PROCESSO" | "ADOTADO";

export type AnimalOwner = {
  id: string;
  name: string;
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
  /** Sigla da UF (IBGE). Ausente/null em anúncios cadastrados antes da localização. */
  state?: string | null;
  /** Município (IBGE). Ausente/null em anúncios cadastrados antes da localização. */
  city?: string | null;
  /** URL pública da foto. `null` quando o anúncio ainda não tem imagem. */
  imageUrl?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: AnimalOwner | null;
};

/** Contato do responsável: retornado apenas para usuários autenticados. */
export type AnimalContact = {
  animalId: string;
  animalName: string;
  responsibleName: string;
  whatsapp: string;
};

export type CreateAnimalInput = Pick<
  Animal,
  "name" | "species" | "breed" | "sex" | "size" | "description"
> & {
  state: string;
  city: string;
  whatsapp: string;
  status?: AnimalStatus;
};

export type UpdateAnimalInput = Partial<CreateAnimalInput>;
