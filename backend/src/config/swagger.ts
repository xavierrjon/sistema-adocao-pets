/** Documentação OpenAPI da API AdoteJá. */

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  description: "UUID do registro.",
  schema: { type: "string", format: "uuid" },
  example: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01",
};

const errorResponse = (description: string, example: Record<string, unknown>) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example,
    },
  },
});

const invalidIdResponse = errorResponse("ID inválido.", {
  error: "Dados inválidos.",
  details: [{ field: "id", message: "ID deve ser um UUID válido." }],
});

const notFoundResponse = (resource: string) =>
  errorResponse(`${resource} não encontrado.`, { error: `${resource} não encontrado.` });

const internalErrorResponse = errorResponse("Erro interno do servidor.", {
  error: "Erro interno do servidor.",
});

const conflictResponse = errorResponse("Conflito de integridade dos dados.", {
  error: "Registro já existente.",
});

const animalExample = {
  id: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01",
  name: "Amber",
  species: "Gato",
  breed: "SRD",
  sex: "Femea",
  size: "Medio",
  description: "Gatinha dócil e carinhosa que procura um novo lar.",
  status: "DISPONIVEL",
  whatsapp: "31999999999",
  userId: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
  createdAt: "2026-11-17T12:00:00.000Z",
  updatedAt: "2026-11-17T12:00:00.000Z",
  user: {
    id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
    name: "Maria Silva",
    whatsapp: "31999999999",
  },
};

const createAnimalExample = {
  name: "Amber",
  species: "Gato",
  breed: "SRD",
  sex: "Femea",
  size: "Medio",
  description: "Gatinha dócil e carinhosa que procura um novo lar.",
  whatsapp: "31999999999",
  userId: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
};

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "AdoteJá API",
    version: "1.0.0",
    description:
      "API REST do AdoteJá para consulta e gerenciamento de animais e usuários. " +
      "Todos os endpoints estão sob o prefixo `/api`.",
  },
  servers: [
    { url: "http://localhost:3001/api", description: "Desenvolvimento local" },
  ],
  tags: [
    { name: "Saúde", description: "Verificação de disponibilidade da API." },
    { name: "Animais", description: "Consulta e gerenciamento de animais." },
    { name: "Usuários", description: "Consulta de usuários responsáveis." },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Saúde"],
        summary: "Verifica o estado da API",
        description: "Retorna `ok` quando o servidor está ativo. Não consulta o banco de dados.",
        operationId: "getHealth",
        responses: {
          200: {
            description: "API disponível.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
                example: { status: "ok" },
              },
            },
          },
          500: internalErrorResponse,
        },
      },
    },
    "/animals": {
      get: {
        tags: ["Animais"],
        summary: "Lista todos os animais",
        description:
          "Retorna todos os animais cadastrados, ordenados do mais recente para o mais antigo, " +
          "com os dados públicos do responsável.",
        operationId: "listAnimals",
        responses: {
          200: {
            description: "Lista de animais (pode ser vazia).",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Animal" },
                },
                example: [animalExample],
              },
            },
          },
          500: internalErrorResponse,
        },
      },
      post: {
        tags: ["Animais"],
        summary: "Cadastra um novo animal",
        description:
          "Cria um animal vinculado a um usuário existente. O campo `status` é opcional e " +
          "por padrão o backend utiliza `DISPONIVEL`.",
        operationId: "createAnimal",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAnimalInput" },
              example: createAnimalExample,
            },
          },
        },
        responses: {
          201: {
            description: "Animal criado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Animal" },
                example: animalExample,
              },
            },
          },
          400: errorResponse("Dados inválidos.", {
            error: "Dados inválidos.",
            details: [{ field: "name", message: "Nome é obrigatório." }],
          }),
          404: notFoundResponse("Usuário"),
          409: conflictResponse,
          500: internalErrorResponse,
        },
      },
    },
    "/animals/{id}": {
      get: {
        tags: ["Animais"],
        summary: "Busca um animal pelo ID",
        description: "Retorna um animal e os dados públicos do seu responsável.",
        operationId: "getAnimal",
        parameters: [idParam],
        responses: {
          200: {
            description: "Animal encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Animal" },
                example: animalExample,
              },
            },
          },
          400: invalidIdResponse,
          404: notFoundResponse("Animal"),
          500: internalErrorResponse,
        },
      },
      put: {
        tags: ["Animais"],
        summary: "Atualiza um animal",
        description:
          "Atualiza parcialmente um animal. É obrigatório informar ao menos um campo. " +
          "Se `userId` for enviado, o usuário precisa existir.",
        operationId: "updateAnimal",
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateAnimalInput" },
              example: { status: "ADOTADO" },
            },
          },
        },
        responses: {
          200: {
            description: "Animal atualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Animal" },
                example: animalExample,
              },
            },
          },
          400: errorResponse("Dados inválidos ou nenhum campo informado.", {
            error: "Dados inválidos.",
            details: [{ field: "", message: "Informe ao menos um campo para atualização." }],
          }),
          404: notFoundResponse("Animal"),
          409: conflictResponse,
          500: internalErrorResponse,
        },
      },
      delete: {
        tags: ["Animais"],
        summary: "Remove um animal",
        description: "Remove permanentemente um animal cadastrado.",
        operationId: "deleteAnimal",
        parameters: [idParam],
        responses: {
          204: { description: "Animal removido. Sem conteúdo de resposta." },
          400: invalidIdResponse,
          404: notFoundResponse("Animal"),
          500: internalErrorResponse,
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Usuários"],
        summary: "Busca um usuário pelo ID",
        description: "Retorna os dados públicos de um usuário. A senha nunca é retornada.",
        operationId: "getUser",
        parameters: [idParam],
        responses: {
          200: {
            description: "Usuário encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
                example: {
                  id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
                  name: "Maria Silva",
                  email: "maria@example.com",
                  whatsapp: "31999999999",
                  createdAt: "2026-11-17T12:00:00.000Z",
                  updatedAt: "2026-11-17T12:00:00.000Z",
                },
              },
            },
          },
          400: invalidIdResponse,
          404: notFoundResponse("Usuário"),
          500: internalErrorResponse,
        },
      },
    },
  },
  components: {
    schemas: {
      Health: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
        },
        required: ["status"],
      },
      AnimalStatus: {
        type: "string",
        enum: ["DISPONIVEL", "EM_PROCESSO", "ADOTADO"],
        description: "Situação do animal no processo de adoção.",
        example: "DISPONIVEL",
      },
      AnimalSpecies: {
        type: "string",
        enum: ["Cachorro", "Gato", "Outro"],
        example: "Gato",
      },
      AnimalSex: {
        type: "string",
        enum: ["Macho", "Femea"],
        example: "Femea",
      },
      AnimalSize: {
        type: "string",
        enum: ["Pequeno", "Medio", "Grande"],
        example: "Medio",
      },
      AnimalOwner: {
        type: "object",
        description: "Dados públicos do usuário responsável pelo animal.",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          whatsapp: { type: "string", example: "31999999999" },
        },
        required: ["id", "name", "whatsapp"],
        example: {
          id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
          name: "Maria Silva",
          whatsapp: "31999999999",
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          whatsapp: { type: "string", example: "31999999999" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "whatsapp", "createdAt", "updatedAt"],
      },
      Animal: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          species: { $ref: "#/components/schemas/AnimalSpecies" },
          breed: { type: "string" },
          sex: { $ref: "#/components/schemas/AnimalSex" },
          size: { $ref: "#/components/schemas/AnimalSize" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/AnimalStatus" },
          whatsapp: { type: "string", example: "31999999999" },
          userId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/AnimalOwner" },
        },
        required: [
          "id",
          "name",
          "species",
          "breed",
          "sex",
          "size",
          "description",
          "status",
          "whatsapp",
          "userId",
          "createdAt",
          "updatedAt",
          "user",
        ],
        example: animalExample,
      },
      CreateAnimalInput: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, example: "Amber" },
          species: { $ref: "#/components/schemas/AnimalSpecies" },
          breed: { type: "string", minLength: 1, example: "SRD" },
          sex: { $ref: "#/components/schemas/AnimalSex" },
          size: { $ref: "#/components/schemas/AnimalSize" },
          description: { type: "string", minLength: 1, example: "Gatinha dócil e carinhosa." },
          whatsapp: {
            type: "string",
            pattern: "^\\d{10,11}$",
            description: "Somente dígitos, com DDD.",
            example: "31999999999",
          },
          userId: { type: "string", format: "uuid" },
          status: { $ref: "#/components/schemas/AnimalStatus" },
        },
        required: ["name", "species", "breed", "sex", "size", "description", "whatsapp", "userId"],
      },
      UpdateAnimalInput: {
        type: "object",
        minProperties: 1,
        description: "Todos os campos são opcionais, mas ao menos um deve ser informado.",
        properties: {
          name: { type: "string", minLength: 1, example: "Amber" },
          species: { $ref: "#/components/schemas/AnimalSpecies" },
          breed: { type: "string", minLength: 1, example: "SRD" },
          sex: { $ref: "#/components/schemas/AnimalSex" },
          size: { $ref: "#/components/schemas/AnimalSize" },
          description: { type: "string", minLength: 1, example: "Gatinha dócil e carinhosa." },
          whatsapp: { type: "string", pattern: "^\\d{10,11}$", example: "31999999999" },
          userId: { type: "string", format: "uuid" },
          status: { $ref: "#/components/schemas/AnimalStatus" },
        },
        example: { status: "ADOTADO" },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Não foi possível concluir a solicitação." },
          details: {
            type: "array",
            description: "Presente em erros de validação.",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "name" },
                message: { type: "string", example: "Nome é obrigatório." },
              },
            },
          },
        },
        required: ["error"],
      },
    },
  },
};
