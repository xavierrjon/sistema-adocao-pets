# AdoteJá

Plataforma web para divulgação e adoção responsável de animais.

O **AdoteJá** conecta pessoas interessadas em adotar animais a responsáveis que desejam encontrar um novo lar para seus pets, oferecendo uma experiência simples para visualizar, pesquisar e cadastrar animais para adoção.

## Funcionalidades planejadas

- Cadastro e autenticação de usuários
- Listagem de animais disponíveis
- Pesquisa e filtros por características
- Visualização dos detalhes do animal
- Cadastro e gerenciamento de anúncios
- Alteração do status de adoção
- Contato com o responsável através do WhatsApp
- Interface responsiva

## Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS
**Backend:** Node.js, Express, TypeScript
**Banco:** PostgreSQL, Prisma
**DevOps:** Docker Compose, GitHub Actions, Vercel

## Arquitetura resumida

```text
Frontend (Next.js)  ──HTTP/REST──▶  Backend (Express)
                                        │
                                   Routes → Controllers → Services
                                        │
                                      Prisma
                                        │
                                  PostgreSQL (Docker)
```

O frontend e o backend são aplicações independentes dentro do mesmo repositório (monorepo). O PostgreSQL é executado localmente via Docker Compose; frontend e backend rodam diretamente no Node.js durante o desenvolvimento.

## Pré-requisitos

- Node.js 22+ e npm
- Docker e Docker Compose
- Git

## Instalação

```bash
git clone git@github.com:xavierrjon/sistema-adocao-pets.git
cd sistema-adocao-pets
cp .env.example .env
npm install
```

## Configuração das variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
POSTGRES_USER=adoteja
POSTGRES_PASSWORD=defina-uma-senha
POSTGRES_DB=adoteja
POSTGRES_PORT=5432
DATABASE_URL=postgresql://adoteja:defina-uma-senha@localhost:5432/adoteja?schema=public
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
COOKIE_SAME_SITE=lax
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> `FRONTEND_URL` define a origem permitida por CORS e pelo checagem de Origin
> usada contra CSRF. `COOKIE_SAME_SITE` pode ser `lax`, `strict` ou `none`.
> Quando frontend e backend estiverem em domínios diferentes, use `none` com
> `Secure` (produção/HTTPS) e, se necessário, defina `COOKIE_DOMAIN`.

> O arquivo `.env` não é versionado. O `.env.example` contém apenas os nomes das variáveis.

> Se a porta 5432 já estiver ocupada por um PostgreSQL instalado na própria máquina, defina `POSTGRES_PORT=5433` (por exemplo) e ajuste a porta na `DATABASE_URL`.

## Inicialização do banco de dados

```bash
docker compose up -d
docker compose ps
```

Para encerrar:

```bash
docker compose down
```

> Não utilize `docker compose down -v` no fluxo normal, pois remove o volume persistente com os dados do banco.

## Execução do frontend

```bash
cd frontend
npm install
npm run dev
```

Disponível em `http://localhost:3000`.

## Execução do backend

```bash
cd backend
npm install
npm run dev
```

Disponível em `http://localhost:3001`.

## Verificação da API

```text
GET http://localhost:3001/api/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

### Endpoints disponíveis

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/animals                 (público)
GET    /api/animals/me               (autenticado)
GET    /api/animals/:id              (público)
GET    /api/animals/:id/contact      (autenticado)
POST   /api/animals                  (autenticado)
PUT    /api/animals/:id             (autenticado, apenas o responsável)
DELETE /api/animals/:id             (autenticado, apenas o responsável)
GET    /api/users/:id
```

### Autenticação

A API usa sessões persistidas no PostgreSQL. O token original é enviado apenas
em um cookie `HttpOnly` (`adoteja_session`); o banco armazena somente seu hash
SHA-256. Senhas são armazenadas como hash bcrypt e nunca aparecem nas respostas.

- `POST /api/auth/register` — cadastra o usuário e retorna `id`, `name` e `email`.
- `POST /api/auth/login` — aceita `rememberMe`; com `true`, sessão e cookie duram 30 dias.
- `GET /api/auth/me` — recupera o usuário da sessão atual (usado ao carregar o frontend).
- `POST /api/auth/logout` — revoga a sessão e limpa o cookie.

O frontend consome esses endpoints com `credentials: "include"` e não grava
tokens em `localStorage`/`sessionStorage`. A proteção visual das rotas é
complementar à autorização feita no backend.

Animais podem ser descobertos por visitantes, mas ações são privadas:
`POST`/`PUT`/`DELETE /api/animals` exigem sessão e o backend sempre usa o
usuário autenticado como responsável. Edição e exclusão também verificam
propriedade (`403` para animal de outro usuário, `401` sem sessão). O WhatsApp
do responsável não aparece nas listagens nem nos detalhes públicos: visitantes
são direcionados ao login ao clicar em "Quero adotar" e somente
`GET /api/animals/:id/contact` devolve o contato, mediante sessão válida.

### Documentação da API (Swagger)

Com o backend em execução:

- Swagger UI: `http://localhost:3001/api/docs`
- Especificação OpenAPI: `http://localhost:3001/api/docs/openapi.json`

## Banco de dados

Após configurar o `.env` e iniciar o PostgreSQL:

```bash
cd backend
npx prisma validate
npx prisma migrate dev
npx prisma studio
```

Para popular o banco com os animais de exemplo usados pela interface e permitir
testar o fluxo de adoção ponta a ponta:

```bash
npm run db:seed
```

A migration inicial cria as tabelas `users` e `animals`, o enum de status e o relacionamento entre elas. A segunda migration renomeia a coluna de senha para `passwordHash` (convertendo senhas legadas em hashes bcrypt) e cria a tabela `sessions`.

## Scripts úteis

Na raiz do repositório:

- `npm run dev` — inicia frontend e backend simultaneamente
- `npm run build` — build de frontend e backend
- `npm run typecheck` — verificação de tipos

Em `backend/`:

- `npm test` — executa os testes da API
- `npm run db:validate` — valida a conexão do Prisma com o PostgreSQL

## Fluxo de branches

```text
main
  └── develop
        └── feature/*
```

Alterações são integradas via **Pull Request** (`feature/*` → `develop` → `main`) e passam por verificações automatizadas de CI.

## CI/CD

O **GitHub Actions** executa, para cada Pull Request e push em `develop`/`main`:

- Checkout
- Instalação das dependências
- Typecheck
- Build

A publicação do frontend é feita na **Vercel** (`develop` → ambiente de desenvolvimento, `main` → produção).
