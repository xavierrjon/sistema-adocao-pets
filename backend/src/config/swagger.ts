/** Documentação OpenAPI da API AdoteJá. */

import { SESSION_COOKIE_NAME } from "../lib/auth";

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

const unauthorizedResponse = errorResponse(
  "Sessão ausente, inválida ou expirada.",
  { error: "Sessão inválida ou expirada." },
);

const unauthorizedNoCookieResponse = errorResponse(
  "Requisição sem cookie de sessão.",
  { error: "Autenticação necessária." },
);

const forbiddenResponse = errorResponse(
  "O usuário não tem permissão sobre o recurso.",
  { error: "Você não tem permissão para editar este animal." },
);

const forbiddenOriginResponse = errorResponse(
  "Origem da requisição não autorizada (proteção CSRF).",
  { error: "Origem não autorizada." },
);

const conflictEmailResponse = errorResponse("E-mail já cadastrado.", {
  error: "E-mail já cadastrado.",
});

const userExample = {
  id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
  name: "Maria Silva",
  email: "maria@example.com",
};

const animalExample = {
  id: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01",
  name: "Amber",
  species: "Gato",
  breed: "SRD",
  sex: "Femea",
  size: "Medio",
  description: "Gatinha dócil e carinhosa que procura um novo lar.",
  status: "DISPONIVEL",
  state: "SP",
  city: "São Paulo",
  imageUrl: null,
  userId: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
  createdAt: "2026-11-17T12:00:00.000Z",
  updatedAt: "2026-11-17T12:00:00.000Z",
  user: {
    id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
    name: "Maria Silva",
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
  state: "SP",
  city: "São Paulo",
};

/** Parâmetros de pesquisa e filtro da listagem pública de animais. */
const animalListQueryParams = [
  {
    name: "q",
    in: "query" as const,
    required: false,
    description:
      "Pesquisa textual por nome, raça, descrição ou espécie. Não diferencia maiúsculas de " +
      "minúsculas e ignora espaços no início e no fim. Máximo de 120 caracteres.",
    schema: { type: "string", maxLength: 120 },
    example: "gatinha",
  },
  {
    name: "species",
    in: "query" as const,
    required: false,
    description:
      "Filtra por espécie. `Ave` atende anúncios antigos da categoria Aves e `Outro` agrupa " +
      "todas as espécies que não são cães, gatos nem aves (por exemplo, coelhos). " +
      "Pode ser combinado com os demais parâmetros.",
    schema: { $ref: "#/components/schemas/AnimalSpeciesFilter" },
  },
  {
    name: "sex",
    in: "query" as const,
    required: false,
    description: "Filtra por sexo. Pode ser combinado com os demais parâmetros.",
    schema: { $ref: "#/components/schemas/AnimalSex" },
  },
  {
    name: "size",
    in: "query" as const,
    required: false,
    description: "Filtra por porte. Pode ser combinado com os demais parâmetros.",
    schema: { $ref: "#/components/schemas/AnimalSize" },
  },
  {
    name: "status",
    in: "query" as const,
    required: false,
    description:
      "Filtra pela situação de adoção. Quando omitido, retorna apenas animais `DISPONIVEL`, " +
      "preservando o comportamento padrão da vitrine.",
    schema: { $ref: "#/components/schemas/AnimalStatus" },
  },
];

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "AdoteJá API",
    version: "1.0.0",
    description:
      "API REST do AdoteJá para consulta e gerenciamento de animais e usuários. " +
      "Todos os endpoints estão sob o prefixo `/api`.\n\n" +
      "**Autenticação:** feita por sessões persistidas no PostgreSQL e transportadas " +
      `em um cookie \`${SESSION_COOKIE_NAME}\` \`HttpOnly\`. O token original trafega apenas no cookie; ` +
      "o banco armazena somente seu hash SHA-256. Endpoints protegidos exigem o cookie de sessão " +
      "e retornam `401` quando a sessão está ausente, inválida ou expirada.",
  },
  servers: [
    { url: "http://localhost:3001/api", description: "Desenvolvimento local" },
  ],
  tags: [
    { name: "Saúde", description: "Verificação de disponibilidade da API." },
    {
      name: "Autenticação",
      description:
        "Cadastro, login, sessão e logout. A sessão é estabelecida pelo login " +
        "(que envia o cookie de sessão) e encerrada pelo logout (que revoga a sessão e limpa o cookie).",
    },
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
        security: [],
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
    "/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Cadastra um novo usuário",
        description:
          "Valida os dados, armazena a senha como hash bcrypt e retorna apenas os dados públicos " +
          "do usuário. Não cria sessão: após o cadastro, o cliente deve encaminhar o usuário para o login.\n\n" +
          "Limitado a 5 cadastros por hora por IP.",
        operationId: "registerUser",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                name: "Maria Silva",
                email: "maria@example.com",
                password: "SenhaSegura123",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário cadastrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthUser" },
                example: userExample,
              },
            },
          },
          400: errorResponse("Dados inválidos.", {
            error: "Dados inválidos.",
            details: [{ field: "email", message: "Informe um e-mail válido." }],
          }),
          409: conflictEmailResponse,
          429: errorResponse("Muitos cadastros em pouco tempo.", {
            error: "Muitos cadastros. Tente novamente mais tarde.",
          }),
          500: internalErrorResponse,
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autentica um usuário e cria uma sessão",
        description:
          "Compara a senha com o hash armazenado, cria a sessão no PostgreSQL e devolve o token " +
          `original no cookie \`${SESSION_COOKIE_NAME}\` (\`HttpOnly\`, \`Path=/\`, \`SameSite\` configurável, ` +
          "`Secure` em produção). Mensagens de erro genéricas não revelam se o e-mail existe.\n\n" +
          "Sem `rememberMe`, a sessão expira em 12 horas e o cookie não tem `Max-Age` " +
          "(é removido ao fechar o navegador). Com `rememberMe: true`, sessão e cookie duram 30 dias.\n\n" +
          "Limitado a 10 tentativas por 15 minutos por IP.",
        operationId: "loginUser",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "maria@example.com",
                password: "SenhaSegura123",
                rememberMe: true,
              },
            },
          },
        },
        responses: {
          200: {
            description:
              "Login realizado. O cookie de sessão é enviado no cabeçalho `Set-Cookie` " +
              "e deve ser reenviado pelo cliente nas chamadas subsequentes.",
            headers: {
              "Set-Cookie": {
                description: `${SESSION_COOKIE_NAME}=<token>; HttpOnly; Path=/; SameSite=Lax`,
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthUser" },
                example: userExample,
              },
            },
          },
          400: errorResponse("Dados inválidos.", {
            error: "Dados inválidos.",
            details: [{ field: "password", message: "Informe sua senha." }],
          }),
          401: errorResponse("Credenciais inválidas.", {
            error: "E-mail ou senha inválidos.",
          }),
          403: forbiddenOriginResponse,
          429: errorResponse("Muitas tentativas de login.", {
            error: "Muitas tentativas de login. Tente novamente em alguns minutos.",
          }),
          500: internalErrorResponse,
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Autenticação"],
        summary: "Retorna o usuário da sessão atual",
        description:
          "Localiza a sessão pelo hash do token presente no cookie, verifica a expiração e retorna " +
          "os dados públicos do usuário autenticado.",
        operationId: "getCurrentUser",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "Usuário autenticado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthUser" },
                example: userExample,
              },
            },
          },
          401: unauthorizedResponse,
          500: internalErrorResponse,
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Autenticação"],
        summary: "Encerra a sessão atual",
        description:
          "Revoga a sessão no PostgreSQL e limpa o cookie com as mesmas opções usadas na criação. " +
          "Sem cookie de sessão, apenas limpa o cookie e retorna `200`.",
        operationId: "logoutUser",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "Sessão encerrada e cookie removido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: { message: "Sessão encerrada." },
              },
            },
          },
          403: forbiddenOriginResponse,
          500: internalErrorResponse,
        },
      },
    },
    "/animals": {
      get: {
        tags: ["Animais"],
        summary: "Lista animais com pesquisa e filtros",
        description:
          "Retorna os animais ordenados do mais recente para o mais antigo, com os dados públicos " +
          "do responsável. Sem filtro de status, a vitrine retorna apenas animais `DISPONIVEL`; " +
          "informe `status` para consultar animais `EM_PROCESSO` ou `ADOTADO`.\n\n" +
          "Todos os parâmetros são opcionais e combináveis. A pesquisa textual (`q`) e os filtros " +
          "de espécie, sexo, porte e status são aplicados na mesma consulta. Parâmetros com valores " +
          "fora dos enums documentados retornam `400`.\n\n" +
          "O WhatsApp do responsável nunca é incluído nesta resposta: use " +
          "`GET /animals/{id}/contact` com sessão válida.",
        operationId: "listAnimals",
        security: [],
        parameters: animalListQueryParams,
        responses: {
          200: {
            description: "Lista de animais que correspondem aos critérios (pode ser vazia).",
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
          400: errorResponse("Parâmetros de pesquisa ou filtro inválidos.", {
            error: "Dados inválidos.",
            details: [{ field: "size", message: "Porte deve ser: Pequeno, Medio, Grande." }],
          }),
          500: internalErrorResponse,
        },
      },
      post: {
        tags: ["Animais"],
        summary: "Cadastra um novo animal",
        description:
          "Cria um animal para o usuário autenticado: o responsável é sempre o dono da sessão " +
          "(qualquer `userId` enviado pelo cliente é ignorado). O campo `status` é opcional e, " +
          "por padrão, o backend utiliza `DISPONIVEL`.\n\n" +
          "`state` (UF) e `city` são obrigatórios no cadastro. A cidade é validada contra a API " +
          "pública do IBGE e precisa pertencer ao estado informado.\n\n" +
          "Aceita `application/json` ou `multipart/form-data`. No multipart, os campos são " +
          "enviados como texto e a foto vai no campo `image` (opcional; JPEG, PNG ou WebP, até 5 MB).",
        operationId: "createAnimal",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAnimalInput" },
              example: createAnimalExample,
            },
            "multipart/form-data": {
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
          400: errorResponse("Dados inválidos, status inválido ou localização incompatível.", {
            error: "Dados inválidos.",
            details: [{ field: "city", message: 'A cidade "Santos" não pertence ao estado RJ.' }],
          }),
          413: errorResponse("Imagem muito grande.", {
            error: "A imagem deve ter no máximo 5 MB.",
          }),
          502: errorResponse("Falha no armazenamento de imagens.", {
            error: "Não foi possível salvar a imagem no serviço de armazenamento.",
          }),
          503: errorResponse("Serviço externo indisponível (armazenamento de imagens ou IBGE).", {
            error: "Não foi possível validar a localização com a API do IBGE. Tente novamente em instantes.",
          }),
          401: unauthorizedNoCookieResponse,
          403: forbiddenOriginResponse,
          429: errorResponse("Muitos anúncios criados.", {
            error: "Muitos anúncios criados em pouco tempo. Tente novamente mais tarde.",
          }),
          500: internalErrorResponse,
        },
      },
    },
    "/animals/me": {
      get: {
        tags: ["Animais"],
        summary: "Lista os animais do usuário autenticado",
        description:
          "Retorna apenas os animais cadastrados pelo usuário da sessão atual, ordenados do mais recente " +
          "para o mais antigo. Sem contato privado.",
        operationId: "listMyAnimals",
        security: [{ sessionCookie: [] }],
        responses: {
          200: {
            description: "Animais do usuário autenticado (pode ser vazia).",
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
          401: unauthorizedResponse,
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
        security: [],
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
          "Somente o responsável pelo animal pode atualizar seus dados, o status de adoção e a " +
          "localização; demais usuários recebem `403`.\n\n" +
          "O status aceita `DISPONIVEL`, `EM_PROCESSO` e `ADOTADO`. Novos anúncios começam como " +
          "`DISPONIVEL`, e animais em processo ou adotados devem ser exibidos como tal pelas interfaces.\n\n" +
          "Ao informar a localização, `state` e `city` devem vir juntos e a cidade é validada " +
          "contra a API do IBGE. Edições que não alteram a localização (por exemplo, só `status`) " +
          "não exigem esses campos, preservando anúncios antigos.\n\n" +
          "Aceita `application/json` ou `multipart/form-data`. No multipart, uma nova foto vai " +
          "no campo `image` (JPEG, PNG ou WebP, até 5 MB) e substitui a atual; para remover a " +
          "foto sem substituir, envie `removeImage=true`.",
        operationId: "updateAnimal",
        security: [{ sessionCookie: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateAnimalInput" },
              example: { status: "ADOTADO" },
            },
            "multipart/form-data": {
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
          400: errorResponse("Dados inválidos, nenhum campo informado ou localização incompatível.", {
            error: "Dados inválidos.",
            details: [{ field: "", message: "Informe ao menos um campo para atualização." }],
          }),
          413: errorResponse("Imagem muito grande.", {
            error: "A imagem deve ter no máximo 5 MB.",
          }),
          502: errorResponse("Falha no armazenamento de imagens.", {
            error: "Não foi possível salvar a imagem no serviço de armazenamento.",
          }),
          503: errorResponse("Serviço externo indisponível (armazenamento de imagens ou IBGE).", {
            error: "Não foi possível validar a localização com a API do IBGE. Tente novamente em instantes.",
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse("Animal"),
          500: internalErrorResponse,
        },
      },
      delete: {
        tags: ["Animais"],
        summary: "Remove um animal",
        description: "Remove permanentemente um animal cadastrado. Somente o responsável pode removê-lo.",
        operationId: "deleteAnimal",
        security: [{ sessionCookie: [] }],
        parameters: [idParam],
        responses: {
          204: { description: "Animal removido. Sem conteúdo de resposta." },
          400: invalidIdResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse("Animal"),
          500: internalErrorResponse,
        },
      },
    },
    "/animals/{id}/contact": {
      get: {
        tags: ["Animais"],
        summary: "Consulta o contato do responsável",
        description:
          "Retorna o WhatsApp do responsável pelo animal. Exige sessão válida: as rotas públicas " +
          "de animais nunca incluem esse dado.",
        operationId: "getAnimalContact",
        security: [{ sessionCookie: [] }],
        parameters: [idParam],
        responses: {
          200: {
            description: "Contato do responsável pelo animal.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnimalContact" },
                example: {
                  animalId: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01",
                  animalName: "Amber",
                  responsibleName: "Maria Silva",
                  whatsapp: "31999999999",
                },
              },
            },
          },
          400: invalidIdResponse,
          401: unauthorizedResponse,
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
        security: [],
        parameters: [idParam],
        responses: {
          200: {
            description: "Usuário encontrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
                example: {
                  ...userExample,
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
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: SESSION_COOKIE_NAME,
        description:
          "Sessão opaca persistida no PostgreSQL. O token original trafega apenas em um cookie " +
          "`HttpOnly`; o banco armazena somente seu hash SHA-256. O cookie é estabelecido por " +
          "`POST /auth/login` e removido por `POST /auth/logout`.",
      },
    },
    schemas: {
      Health: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
        },
        required: ["status"],
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 120, example: "Maria Silva" },
          email: { type: "string", format: "email", example: "maria@example.com" },
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
          email: { type: "string", format: "email", example: "maria@example.com" },
          password: { type: "string", format: "password", example: "SenhaSegura123" },
          rememberMe: {
            type: "boolean",
            default: false,
            description: "Quando `true`, cria sessão persistente e cookie com validade de 30 dias.",
          },
        },
      },
      AuthUser: {
        type: "object",
        description: "Dados públicos do usuário retornados pela autenticação. Nunca inclui senha ou hash.",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
        required: ["id", "name", "email"],
        example: userExample,
      },
      User: {
        type: "object",
        description: "Dados públicos de um usuário. Nunca inclui senha ou hash.",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "createdAt", "updatedAt"],
      },
      AnimalStatus: {
        type: "string",
        enum: ["DISPONIVEL", "EM_PROCESSO", "ADOTADO"],
        description:
          "Situação do animal no processo de adoção. `DISPONIVEL` é o padrão de novos anúncios; " +
          "`EM_PROCESSO` e `ADOTADO` indicam que o animal não está mais disponível.",
        example: "DISPONIVEL",
      },
      AnimalState: {
        type: "string",
        pattern: "^[A-Z]{2}$",
        description: "Sigla da UF (estado) conforme as localidades do IBGE.",
        example: "SP",
      },
      AnimalSpecies: {
        type: "string",
        enum: ["Cachorro", "Gato", "Outro"],
        example: "Gato",
      },
      AnimalSpeciesFilter: {
        type: "string",
        enum: ["Cachorro", "Gato", "Ave", "Outro"],
        description:
          "Espécie usada na filtragem. `Ave` atende anúncios antigos da categoria Aves e " +
          "`Outro` agrupa todas as espécies que não são cães, gatos nem aves.",
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
        description: "Dados públicos do usuário responsável pelo animal, sem contato privado.",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
        },
        required: ["id", "name"],
        example: {
          id: "8c4b1d20-3e7a-4f52-9b6d-1a2c3d4e5f60",
          name: "Maria Silva",
        },
      },
      Animal: {
        type: "object",
        description:
          "Animal com dados públicos do responsável. O WhatsApp do responsável nunca é incluído: " +
          "use `GET /animals/{id}/contact` com sessão válida.",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          species: { $ref: "#/components/schemas/AnimalSpecies" },
          breed: { type: "string" },
          sex: { $ref: "#/components/schemas/AnimalSex" },
          size: { $ref: "#/components/schemas/AnimalSize" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/AnimalStatus" },
          state: {
            allOf: [{ $ref: "#/components/schemas/AnimalState" }],
            nullable: true,
            description: "UF onde o animal se encontra. `null` em anúncios anteriores à localização.",
          },
          city: {
            type: "string",
            nullable: true,
            description: "Município onde o animal se encontra. `null` em anúncios anteriores à localização.",
            example: "São Paulo",
          },
          imageUrl: {
            type: "string",
            format: "uri",
            nullable: true,
            description: "URL pública da foto do animal. `null` quando o anúncio não tem imagem.",
            example: "https://res.cloudinary.com/exemplo/image/upload/v1730000000/adoteja/animals/uuid.jpg",
          },
          userId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: {
            allOf: [{ $ref: "#/components/schemas/AnimalOwner" }],
            nullable: true,
          },
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
          "state",
          "city",
          "userId",
          "createdAt",
          "updatedAt",
          "user",
        ],
        example: animalExample,
      },
      AnimalContact: {
        type: "object",
        description: "Contato privado do responsável, disponível apenas com sessão válida.",
        properties: {
          animalId: { type: "string", format: "uuid" },
          animalName: { type: "string" },
          responsibleName: { type: "string" },
          whatsapp: { type: "string", example: "31999999999" },
        },
        required: ["animalId", "animalName", "responsibleName", "whatsapp"],
      },
      CreateAnimalInput: {
        type: "object",
        description: "O responsável é sempre o usuário autenticado; não é possível informar `userId`.",
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
            description: "Somente dígitos, com DDD. Retornado apenas via contato autenticado.",
            example: "31999999999",
          },
          status: { $ref: "#/components/schemas/AnimalStatus" },
          state: { $ref: "#/components/schemas/AnimalState" },
          city: {
            type: "string",
            minLength: 1,
            maxLength: 120,
            description: "Município do IBGE pertencente à UF informada.",
            example: "São Paulo",
          },
        },
        required: [
          "name",
          "species",
          "breed",
          "sex",
          "size",
          "description",
          "whatsapp",
          "state",
          "city",
        ],
      },
      UpdateAnimalInput: {
        type: "object",
        minProperties: 1,
        description:
          "Todos os campos são opcionais, mas ao menos um deve ser informado. " +
          "`state` e `city` devem ser enviados juntos e validados pelo IBGE. " +
          "Para alterar apenas o status, envie somente `status`.",
        properties: {
          name: { type: "string", minLength: 1, example: "Amber" },
          species: { $ref: "#/components/schemas/AnimalSpecies" },
          breed: { type: "string", minLength: 1, example: "SRD" },
          sex: { $ref: "#/components/schemas/AnimalSex" },
          size: { $ref: "#/components/schemas/AnimalSize" },
          description: { type: "string", minLength: 1, example: "Gatinha dócil e carinhosa." },
          whatsapp: { type: "string", pattern: "^\\d{10,11}$", example: "31999999999" },
          status: { $ref: "#/components/schemas/AnimalStatus" },
          state: { $ref: "#/components/schemas/AnimalState" },
          city: { type: "string", minLength: 1, maxLength: 120, example: "São Paulo" },
        },
        example: { status: "ADOTADO" },
      },
      MessageResponse: {
        type: "object",
        properties: { message: { type: "string", example: "Sessão encerrada." } },
        required: ["message"],
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
