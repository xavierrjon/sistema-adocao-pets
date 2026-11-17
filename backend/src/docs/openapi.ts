import { SESSION_COOKIE_NAME } from "../lib/auth";

const userExample = {
  id: "3f1b8a52-6c1f-4c65-9d0b-2f4a1e7c9f11",
  name: "João Silva",
  email: "joao@email.com",
};

const animalExample = {
  id: "9b2c7d44-1a3e-4f5b-8c6d-7e8f9a0b1c2d",
  name: "Rex",
  species: "Cachorro",
  breed: "SRD",
  sex: "Macho",
  size: "Medio",
  description: "Cachorro dócil e brincalhão.",
  status: "DISPONIVEL",
  userId: "3f1b8a52-6c1f-4c65-9d0b-2f4a1e7c9f11",
  createdAt: "2026-11-17T12:00:00.000Z",
  updatedAt: "2026-11-17T12:00:00.000Z",
  user: {
    id: "3f1b8a52-6c1f-4c65-9d0b-2f4a1e7c9f11",
    name: "João Silva",
  },
};

const errorExample = { error: "E-mail ou senha inválidos." };

const validationErrorExample = {
  error: "Dados inválidos.",
  details: [{ field: "email", message: "Informe um e-mail válido." }],
};

const unauthorizedResponse = {
  description: "Sessão ausente, inválida ou expirada.",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/AuthError" },
      example: { error: "Sessão inválida ou expirada." },
    },
  },
};

const cookieParameter = {
  in: "cookie" as const,
  name: SESSION_COOKIE_NAME,
  required: true,
  description: "Token de sessão original, enviado pelo servidor como cookie HttpOnly.",
  schema: { type: "string" as const },
};

const openapiDocument = {
  openapi: "3.1.0",
  info: {
    title: "AdoteJá API",
    version: "1.0.0",
    description:
      "API da plataforma AdoteJá. A autenticação é feita por sessões persistidas no PostgreSQL e transportadas em um cookie HttpOnly.",
  },
  servers: [
    { url: "http://localhost:3001/api", description: "Desenvolvimento" },
    { url: "/api", description: "Mesma origem" },
  ],
  tags: [
    { name: "Auth", description: "Cadastro, login, sessão e logout." },
    { name: "Animals", description: "Consulta pública e gerenciamento autenticado de animais." },
    { name: "Users", description: "Consulta pública de dados de usuários." },
    { name: "Health", description: "Verificação de disponibilidade." },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica se a API está disponível",
        security: [],
        responses: {
          "200": {
            description: "API disponível.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cria uma nova conta",
        description:
          "Valida os dados, armazena a senha como hash bcrypt e retorna apenas os dados públicos do usuário. Não cria sessão: após o cadastro, o cliente deve encaminhar o usuário para o login.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              examples: {
                padrao: {
                  value: {
                    name: "João Silva",
                    email: "joao@email.com",
                    password: "SenhaSegura123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário cadastrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
                example: userExample,
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": {
            description: "E-mail já cadastrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthError" },
                example: { error: "E-mail já cadastrado." },
              },
            },
          },
          "429": {
            description: "Muitos cadastros em pouco tempo.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthError" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica um usuário e cria uma sessão",
        description:
          "Compara a senha com o hash armazenado, cria uma sessão no banco e devolve o token original em um cookie HttpOnly. Mensagens de erro genéricas não revelam se o e-mail existe.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              examples: {
                padrao: {
                  value: {
                    email: "joao@email.com",
                    password: "SenhaSegura123",
                    rememberMe: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login realizado. O cookie de sessão é enviado no cabeçalho Set-Cookie.",
            headers: {
              "Set-Cookie": {
                description: `${SESSION_COOKIE_NAME}=<token>; HttpOnly; Path=/; SameSite=Lax`,
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
                example: userExample,
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": {
            description: "Credenciais inválidas.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthError" },
                example: errorExample,
              },
            },
          },
          "429": {
            description: "Muitas tentativas de login.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthError" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Retorna o usuário autenticado",
        description:
          "Localiza a sessão pelo hash do token presente no cookie, verifica a expiração e retorna os dados públicos do usuário.",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        responses: {
          "200": {
            description: "Usuário autenticado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
                example: userExample,
              },
            },
          },
          "401": unauthorizedResponse,
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Encerra a sessão atual",
        description:
          "Revoga a sessão no banco e limpa o cookie com as mesmas opções usadas na criação.",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        responses: {
          "200": {
            description: "Sessão encerrada.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: { message: "Sessão encerrada." },
              },
            },
          },
          "403": { $ref: "#/components/responses/Forbidden" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/animals": {
      get: {
        tags: ["Animals"],
        summary: "Lista animais (público)",
        security: [],
        responses: {
          "200": {
            description: "Lista de animais.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AnimalResponse" },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      post: {
        tags: ["Animals"],
        summary: "Cadastra um animal (autenticado)",
        description:
          "O campo userId é ignorado quando enviado pelo cliente: o responsável é sempre req.user.",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnimalInput" },
              example: {
                name: "Rex",
                species: "Cachorro",
                breed: "SRD",
                sex: "Macho",
                size: "Medio",
                description: "Cachorro dócil.",
                whatsapp: "92999999999",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Animal cadastrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnimalResponse" },
                example: animalExample,
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": unauthorizedResponse,
          "403": { $ref: "#/components/responses/Forbidden" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/animals/me": {
      get: {
        tags: ["Animals"],
        summary: "Lista os anúncios do usuário autenticado",
        description: "Retorna apenas os animais cadastrados pela sessão atual, sem contato privado.",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        responses: {
          "200": {
            description: "Animais do usuário autenticado.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AnimalResponse" },
                },
              },
            },
          },
          "401": unauthorizedResponse,
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/animals/{id}": {
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          description: "UUID do animal.",
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["Animals"],
        summary: "Consulta um animal (público)",
        security: [],
        responses: {
          "200": {
            description: "Animal encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnimalResponse" },
                example: animalExample,
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      put: {
        tags: ["Animals"],
        summary: "Atualiza um animal (autenticado e proprietário)",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnimalInput" },
              description: "Todos os campos são opcionais, mas ao menos um deve ser informado.",
              example: { name: "Thor", status: "ADOTADO" },
            },
          },
        },
        responses: {
          "200": {
            description: "Animal atualizado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnimalResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": unauthorizedResponse,
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      delete: {
        tags: ["Animals"],
        summary: "Exclui um animal (autenticado e proprietário)",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        responses: {
          "204": { description: "Animal excluído." },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": unauthorizedResponse,
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/animals/{id}/contact": {
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          description: "UUID do animal.",
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        tags: ["Animals"],
        summary: "Consulta o contato do responsável (autenticado)",
        description:
          "O WhatsApp só é devolvido para usuários com sessão válida. As rotas públicas de animais nunca incluem esse dado.",
        security: [{ sessionCookie: [] }],
        parameters: [cookieParameter],
        responses: {
          "200": {
            description: "Contato do responsável pelo animal.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnimalContactResponse" },
                example: {
                  animalId: "9b2c7d44-1a3e-4f5b-8c6d-7e8f9a0b1c2d",
                  animalName: "Rex",
                  responsibleName: "João Silva",
                  whatsapp: "92999999999",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": unauthorizedResponse,
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Consulta dados públicos de um usuário",
        security: [],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Usuário encontrado (sem senha ou hash).",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: SESSION_COOKIE_NAME,
        description:
          "Sessão opaca persistida no PostgreSQL. O token original trafega apenas em um cookie HttpOnly; o banco armazena somente seu hash SHA-256.",
      },
    },
    responses: {
      BadRequest: {
        description: "Dados inválidos.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidationError" },
            example: validationErrorExample,
          },
        },
      },
      Forbidden: {
        description: "O usuário não tem permissão sobre o recurso.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthError" },
            example: { error: "Você não tem permissão para editar este animal." },
          },
        },
      },
      NotFound: {
        description: "Recurso não encontrado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthError" },
            example: { error: "Animal não encontrado." },
          },
        },
      },
      InternalError: {
        description: "Erro interno do servidor.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthError" },
            example: { error: "Erro interno do servidor." },
          },
        },
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 120, example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@email.com" },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
            maxLength: 72,
            description: "Mínimo de 8 caracteres. Armazenado como hash bcrypt.",
            example: "SenhaSegura123",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "joao@email.com" },
          password: { type: "string", format: "password", example: "SenhaSegura123" },
          rememberMe: {
            type: "boolean",
            default: false,
            description: "Quando true, cria sessão persistente e cookie com validade de 30 dias.",
          },
        },
      },
      UserResponse: {
        type: "object",
        description: "Dados públicos do usuário. Nunca inclui senha ou hash.",
        properties: {
          id: { type: "string", format: "uuid", example: userExample.id },
          name: { type: "string", example: userExample.name },
          email: { type: "string", format: "email", example: userExample.email },
        },
      },
      AnimalInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Rex" },
          species: { type: "string", enum: ["Cachorro", "Gato", "Outro"] },
          breed: { type: "string", example: "SRD" },
          sex: { type: "string", enum: ["Macho", "Femea"] },
          size: { type: "string", enum: ["Pequeno", "Medio", "Grande"] },
          description: { type: "string", example: "Cachorro dócil." },
          whatsapp: { type: "string", pattern: "^\\d{10,11}$", example: "92999999999" },
          status: {
            type: "string",
            enum: ["DISPONIVEL", "EM_PROCESSO", "ADOTADO"],
            default: "DISPONIVEL",
          },
        },
      },
      AnimalResponse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          species: { type: "string" },
          breed: { type: "string" },
          sex: { type: "string" },
          size: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["DISPONIVEL", "EM_PROCESSO", "ADOTADO"] },
          userId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
        },
      },
      AnimalContactResponse: {
        type: "object",
        description: "Contato privado do responsável, disponível apenas com sessão válida.",
        properties: {
          animalId: { type: "string", format: "uuid" },
          animalName: { type: "string" },
          responsibleName: { type: "string" },
          whatsapp: { type: "string", example: "92999999999" },
        },
      },
      AuthError: {
        type: "object",
        properties: { error: { type: "string", example: errorExample.error } },
      },
      ValidationError: {
        type: "object",
        properties: {
          error: { type: "string", example: "Dados inválidos." },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Informe um e-mail válido." },
              },
            },
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: { message: { type: "string", example: "Sessão encerrada." } },
      },
    },
  },
};

export default openapiDocument;
