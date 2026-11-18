import { z } from "zod";

export const ANIMAL_SPECIES = ["Cachorro", "Gato", "Outro"] as const;
export const ANIMAL_SEXES = ["Macho", "Femea"] as const;
export const ANIMAL_SIZES = ["Pequeno", "Medio", "Grande"] as const;
export const ANIMAL_STATUSES = ["DISPONIVEL", "EM_PROCESSO", "ADOTADO"] as const;

const whatsappSchema = z
  .string()
  .trim()
  .regex(/^\d{10,11}$/, "WhatsApp deve conter 10 ou 11 dígitos.");

/** A UF é validada novamente contra a API do IBGE antes de persistir. */
const stateSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "Estado deve ser a sigla (UF), como SP.");

const citySchema = z
  .string()
  .trim()
  .min(1, "Cidade é obrigatória.")
  .max(120, "Cidade deve ter no máximo 120 caracteres.");

// O responsável pelo anúncio é sempre o usuário autenticado; userId nunca vem do cliente.
const animalFields = {
  name: z.string().trim().min(1, "Nome é obrigatório."),
  species: z.enum(ANIMAL_SPECIES, {
    message: `Espécie deve ser: ${ANIMAL_SPECIES.join(", ")}.`,
  }),
  breed: z.string().trim().min(1, "Raça é obrigatória."),
  sex: z.enum(ANIMAL_SEXES, {
    message: `Sexo deve ser: ${ANIMAL_SEXES.join(", ")}.`,
  }),
  size: z.enum(ANIMAL_SIZES, {
    message: `Porte deve ser: ${ANIMAL_SIZES.join(", ")}.`,
  }),
  description: z.string().trim().min(1, "Descrição é obrigatória."),
  whatsapp: whatsappSchema,
  status: z
    .enum(ANIMAL_STATUSES, {
      message: `Status deve ser: ${ANIMAL_STATUSES.join(", ")}.`,
    })
    .optional(),
};

/** Localização é obrigatória no cadastro e opcional apenas em edições parciais. */
const locationFields = {
  state: stateSchema,
  city: citySchema,
};

export const createAnimalSchema = z.object({ ...animalFields, ...locationFields });

export const updateAnimalSchema = z
  .object({ ...animalFields, ...locationFields })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  })
  .refine((data) => Boolean(data.state) === Boolean(data.city), {
    message: "Informe estado e cidade juntos.",
    path: ["state"],
  });

export const animalParamsSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido."),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
