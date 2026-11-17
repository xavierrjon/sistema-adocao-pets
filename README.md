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
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

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
GET    /api/animals
GET    /api/animals/:id
POST   /api/animals
PUT    /api/animals/:id
DELETE /api/animals/:id
GET    /api/users/:id
```

### Documentação Swagger

Com o backend em execução, a documentação interativa fica disponível em:

```text
http://localhost:3001/api/docs
```

O documento OpenAPI também pode ser consultado em `http://localhost:3001/api/docs/openapi.json`.

## Banco de dados

Após configurar o `.env` e iniciar o PostgreSQL:

```bash
cd backend
npx prisma validate
npx prisma migrate dev
npx prisma studio
```

A migration inicial cria as tabelas `users` e `animals`, o enum de status e o relacionamento entre elas.

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
