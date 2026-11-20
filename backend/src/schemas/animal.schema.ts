import { z } from "zod";

/** Espécies aceitas no cadastro e na edição de anúncios. */
export const ANIMAL_SPECIES = ["Cachorro", "Gato", "Ave", "Outro"] as const;
export const ANIMAL_SEXES = ["Macho", "Femea"] as const;
export const ANIMAL_SIZES = ["Pequeno", "Medio", "Grande"] as const;
export const ANIMAL_STATUSES = ["DISPONIVEL", "EM_PROCESSO", "ADOTADO"] as const;

/**
 * Espécies aceitas na filtragem da vitrine. "Ave" atende à categoria "Aves"
 * da home; "Outro" representa todas as demais espécies (por exemplo, coelhos).
 */
export const ANIMAL_SPECIES_FILTER = ["Cachorro", "Gato", "Ave", "Outro"] as const;

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

/** Normaliza parâmetros de consulta: remove espaços e trata vazios como ausentes. */
const normalizeFilterValue = (value: unknown) =>
  typeof value === "string" ? value.trim() || undefined : value;

const filterParam = <T extends z.ZodType>(schema: T) =>
  z.preprocess(normalizeFilterValue, schema.optional());

/**
 * Pesquisa e filtros da listagem pública. Todos os parâmetros são opcionais e
 * combináveis; a vitrine sempre retorna apenas animais disponíveis.
 */
export const listAnimalsQuerySchema = z.object({
  q: z.preprocess(
    normalizeFilterValue,
    z
      .string()
      .trim()
      .max(120, "Busca deve ter no máximo 120 caracteres.")
      .optional(),
  ),
  species: filterParam(
    z.enum(ANIMAL_SPECIES_FILTER, {
      message: `Espécie deve ser: ${ANIMAL_SPECIES_FILTER.join(", ")}.`,
    }),
  ),
  sex: filterParam(
    z.enum(ANIMAL_SEXES, {
      message: `Sexo deve ser: ${ANIMAL_SEXES.join(", ")}.`,
    }),
  ),
  size: filterParam(
    z.enum(ANIMAL_SIZES, {
      message: `Porte deve ser: ${ANIMAL_SIZES.join(", ")}.`,
    }),
  ),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
export type ListAnimalsQuery = z.infer<typeof listAnimalsQuerySchema>;
