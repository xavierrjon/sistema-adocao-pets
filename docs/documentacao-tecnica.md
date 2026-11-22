# Documentação Técnica — AdoteJá

## 1. Visão geral do projeto

O **AdoteJá** é um sistema web desenvolvido para facilitar a divulgação e a adoção de animais. A plataforma permite que usuários cadastrem animais disponíveis para adoção, visualizem anúncios, pesquisem por animais e entrem em contato com os responsáveis pelos anúncios.

O sistema possui autenticação de usuários, gerenciamento de anúncios, filtros de pesquisa, upload de imagens e integração com serviços externos.

A aplicação utiliza uma arquitetura separada entre frontend e backend, com comunicação por meio de uma API REST.

## 2. Arquitetura do sistema

O projeto está organizado como um monorepositório, contendo duas aplicações principais:

- **Frontend:** responsável pela interface, navegação e interação com os usuários.
- **Backend:** responsável pelas regras de negócio, autenticação, processamento das requisições e comunicação com o banco de dados.

### 2.1 Estrutura

```text
sistema-adocao-pets/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── prisma/schema.prisma
│
├── test/
│   ├── frontend/
│   └── backend/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── package.json
└── README.md
```

### 2.2 Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 |
| Biblioteca de interface | React 19 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 4 |
| Backend | Node.js e Express |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | Sessões e cookies HttpOnly |
| Armazenamento de imagens | Cloudinary |
| Testes | Vitest, Testing Library e Supertest |
| Containerização local | Docker Compose |
| Hospedagem frontend | Vercel |
| Hospedagem backend | Render |
| Versionamento | Git e GitHub |
| Integração contínua | GitHub Actions |

## 3. Infraestrutura e comunicação

A aplicação utiliza uma arquitetura cliente-servidor.

O navegador acessa o frontend desenvolvido em Next.js, que realiza as requisições à API do backend Express. O backend processa as solicitações, aplica as regras de negócio e utiliza o Prisma para acessar o PostgreSQL.

A comunicação entre frontend e backend utiliza um proxy de API, permitindo que as requisições sejam realizadas por meio do mesmo domínio do frontend.

### 3.1 Fluxo de comunicação

```text
                 USUÁRIO
                    |
                    v
          FRONTEND - NEXT.JS
                    |
                    v
               /api/*
                    |
                    v
           BACKEND - EXPRESS
                    |
             +------+------+
             |             |
             v             v
          PRISMA       SERVIÇOS
             |             |
             v       +-----+------+
        POSTGRESQL    |            |
                      v            v
                  CLOUDINARY     IBGE
```

### 3.2 Banco de dados

O sistema utiliza PostgreSQL para armazenar os dados da aplicação.

O Prisma ORM é responsável pelo mapeamento das entidades, consultas e operações no banco.

Entre as principais entidades estão:

- **User:** informações dos usuários cadastrados;
- **Session:** sessões de autenticação;
- **Animal:** informações dos animais anunciados.

As alterações estruturais do banco são controladas por migrações versionadas no diretório `backend/prisma/migrations`.

O sistema utiliza `DATABASE_URL` para conexão principal e `DIRECT_URL` para conexão direta utilizada em operações específicas do Prisma.

### 3.3 Serviços externos

O projeto integra serviços externos para complementar suas funcionalidades:

- **Cloudinary:** armazenamento e gerenciamento das imagens dos animais;
- **IBGE:** consulta de estados e municípios brasileiros;
- **WhatsApp:** comunicação entre interessados e responsáveis pelos anúncios.

## 4. Ambientes de desenvolvimento

O projeto trabalha com diferentes contextos de execução, permitindo desenvolver, testar e disponibilizar alterações sem utilizar diretamente o ambiente destinado aos usuários finais.

### 4.1 Desenvolvimento local

É o ambiente utilizado pelos desenvolvedores durante a implementação de funcionalidades e correções.

Sua infraestrutura utiliza:

| Serviço | Endereço |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:3001` |
| PostgreSQL | Docker Compose |

O banco de dados local é executado em um container Docker utilizando a imagem `postgres:16-alpine`, com volume persistente para armazenamento dos dados.

As configurações são gerenciadas por variáveis de ambiente, definidas no arquivo `.env`.

### 4.2 Desenvolvimento e integração (`develop`)

A branch `develop` funciona como ambiente de integração das funcionalidades.

As alterações desenvolvidas em branches de funcionalidades e correções são integradas nessa branch antes de avançarem para a etapa de release.

Esse fluxo permite reunir as implementações da equipe e executar as validações automatizadas antes da disponibilização das alterações seguintes.

### 4.3 Release (`release`)

A branch `release` representa a etapa intermediária entre a integração e a produção.

Sua finalidade é concentrar a versão que será encaminhada para produção, permitindo organizar e validar as alterações integrantes de uma entrega.

O projeto também possui o domínio `adoteja-release.com`, associado à branch `release` na configuração de domínio da Vercel.

### 4.4 Produção

O ambiente de produção corresponde à versão disponibilizada aos usuários.

A infraestrutura utiliza:

| Componente | Plataforma | Endereço |
|---|---|---|
| Frontend | Vercel | `https://adoteja-am.vercel.app` |
| Backend | Render | `https://adoteja-api.onrender.com` |
| Banco de dados | PostgreSQL | Configurado por variáveis de ambiente |

O frontend utiliza o proxy `/api` para encaminhar as requisições ao backend, mantendo a comunicação por meio do domínio da aplicação.

## 5. Gerenciamento de branches

O projeto utiliza um fluxo de versionamento baseado em GitFlow simplificado.

As branches são organizadas conforme a finalidade de cada alteração.

### 5.1 Branches principais

| Branch | Finalidade |
|---|---|
| `main` | Versão principal e estável do sistema, destinada à produção. |
| `develop` | Integração das funcionalidades e correções desenvolvidas pela equipe. |
| `release` | Preparação e consolidação das alterações destinadas à produção. |

### 5.2 Branches auxiliares

| Padrão | Finalidade |
|---|---|
| `feature/*` | Desenvolvimento de novas funcionalidades. |
| `fix/*` | Correção de defeitos. |
| `ci/*` | Alterações relacionadas à integração contínua. |
| `docs/*` | Alterações na documentação. |

### 5.3 Fluxo de integração

O fluxo de trabalho segue esta sequência:

```text
1. Criação de uma branch de trabalho
              |
              v
     feature/* ou fix/*
              |
              v
       Pull Request
              |
              v
           develop
              |
              v
          release
              |
              v
       Pull Request
              |
              v
            main
              |
              v
          PRODUÇÃO
```

Esse processo organiza as alterações, facilita a revisão do código e mantém uma separação entre desenvolvimento, integração e disponibilização da aplicação.

## 6. Integração contínua (CI/CD)

O projeto utiliza GitHub Actions para automatizar verificações de qualidade do código.

O workflow está localizado em:

```text
.github/workflows/ci.yml
```

### 6.1 Gatilhos

O workflow é executado em eventos de:

- Push para `develop`;
- Push para `main`;
- Pull requests direcionados a essas branches.

### 6.2 Pipeline do frontend

O processo de validação do frontend executa:

1. Checkout do repositório;
2. Configuração do Node.js 22;
3. Instalação das dependências com `npm ci`;
4. Verificação de tipos com TypeScript;
5. Execução dos testes automatizados;
6. Build da aplicação.

### 6.3 Pipeline do backend

O processo de validação do backend executa:

1. Checkout do repositório;
2. Configuração do Node.js 22;
3. Instalação das dependências;
4. Geração do Prisma Client;
5. Validação do schema Prisma;
6. Verificação de tipos;
7. Execução dos testes automatizados;
8. Build da aplicação.

Os jobs de frontend e backend são executados separadamente.

### 6.4 Objetivo do CI

A integração contínua tem como finalidade identificar problemas antes da integração das alterações ao código principal, verificando se as aplicações continuam compilando e se os testes automatizados permanecem válidos.

A publicação das aplicações é realizada por meio das plataformas de hospedagem utilizadas pelo projeto.

## 7. Estratégia de testes

O AdoteJá utiliza testes automatizados para verificar o funcionamento das funcionalidades do frontend e backend.

### 7.1 Ferramentas

- Vitest;
- Testing Library;
- jsdom;
- Supertest.

### 7.2 Testes do frontend

São utilizados para validar:

- Componentes;
- Formulários;
- Serviços;
- Contextos;
- Utilitários;
- Páginas e fluxos de navegação.

### 7.3 Testes do backend

São utilizados para validar:

- Autenticação;
- Rotas;
- Regras de negócio;
- Integração com serviços;
- CORS e CSRF;
- Documentação OpenAPI;
- Operações relacionadas aos animais e usuários.

### 7.4 Comandos de execução

Na raiz do projeto:

```bash
npm test
npm run test:backend
npm run test:frontend
npm run typecheck
npm run build
```

Essas verificações também fazem parte do pipeline de integração contínua.

## 8. Gerenciamento de mudanças e funcionalidades

As alterações do sistema são organizadas em branches específicas e integradas por meio de Pull Requests.

As principais evoluções do projeto incluem:

### 8.1 Funcionalidades

- Cadastro e autenticação de usuários;
- Gerenciamento de sessões;
- Cadastro de animais;
- Edição e exclusão de anúncios;
- Listagem de animais;
- Visualização de detalhes;
- Pesquisa e filtros por categoria;
- Filtros por localização;
- Gerenciamento do status de adoção;
- Visualização de contato mediante autenticação;
- Upload de imagens;
- Integração com WhatsApp.

### 8.2 Melhorias de interface

- Reorganização da navegação;
- Melhorias na experiência mobile;
- Ajustes de responsividade;
- Melhorias nos formulários;
- Atualizações nos componentes de listagem;
- Melhorias na apresentação dos anúncios.

### 8.3 Melhorias de infraestrutura

- Configuração de CORS;
- Ajustes de autenticação e cookies;
- Implementação do proxy `/api`;
- Ajustes de conexão com PostgreSQL;
- Separação entre conexões pooled e direct do Prisma;
- Melhorias no pipeline de CI.

## 9. Gerenciamento de defeitos e correções

As correções são organizadas em branches `fix/*` e integradas ao fluxo principal por meio de Pull Requests.

Entre os problemas tratados durante a evolução do sistema estão:

| Área | Correção realizada |
|---|---|
| CORS | Ajustes de origens permitidas, credenciais e preflight. |
| Autenticação | Correções relacionadas ao funcionamento dos cookies. |
| Navegadores iOS | Ajustes para evitar bloqueios de cookies de terceiros. |
| Comunicação | Correções no proxy `/api` e nas URLs da API. |
| Banco de dados | Ajustes no gerenciamento de conexões Prisma. |
| Upload | Verificação de propriedade antes do envio de arquivos. |
| CI | Correção de problemas relacionados à instalação das dependências. |
| Dados | Restauração do seed do banco. |

As correções são incorporadas ao histórico do Git, permitindo acompanhar a evolução e a manutenção do sistema.

## 10. Versionamento e releases

O controle de versões é realizado por meio do Git.

O projeto utiliza mensagens de commit seguindo padrões semelhantes ao Conventional Commits:

```text
feat: nova funcionalidade
fix: correção de defeito
docs: atualização da documentação
ci: alteração no pipeline
refactor: refatoração de código
test: alteração nos testes
chore: manutenção do projeto
```

Também existe uma tag Git `v1.0.0`, utilizada para identificar uma versão do projeto.

Os arquivos `package.json` da raiz, frontend e backend possuem a versão declarada `0.1.0`.

## 11. Segurança e gerenciamento de configurações

O sistema utiliza variáveis de ambiente para armazenar configurações de execução e credenciais de serviços externos.

Entre as principais configurações estão:

| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | Conexão principal com o banco de dados. |
| `DIRECT_URL` | Conexão direta com o PostgreSQL. |
| `PORT` | Porta de execução do backend. |
| `FRONTEND_URL` | Origem permitida para comunicação com o frontend. |
| `NODE_ENV` | Identificação do ambiente de execução. |
| `COOKIE_SAME_SITE` | Configuração de comportamento dos cookies. |
| `COOKIE_DOMAIN` | Configuração de domínio dos cookies. |
| `NEXT_PUBLIC_API_URL` | Endereço da API utilizado pelo frontend. |
| `CLOUDINARY_*` | Configurações de integração com Cloudinary. |

Os valores dessas variáveis são configurados separadamente nos ambientes de execução.

O arquivo `.env` é utilizado localmente e não deve ser versionado no Git.

A autenticação utiliza sessões persistidas no banco de dados e cookies HttpOnly. As senhas são protegidas por hash com bcrypt, e os identificadores de sessão armazenados no banco também recebem tratamento de hash.

O backend aplica mecanismos de proteção como CORS, verificação de origem, rate limiting e validações de acesso.

## 12. Manutenção e evolução

A manutenção do AdoteJá envolve a atualização contínua das funcionalidades, correção de defeitos, evolução da infraestrutura e preservação da estabilidade da aplicação.

O processo de manutenção segue as práticas:

- Criação de branches específicas para cada alteração;
- Revisão das mudanças por Pull Requests;
- Execução de testes automatizados;
- Validação de tipos e build;
- Integração das alterações nas branches principais;
- Atualização das migrações quando há mudanças no banco;
- Atualização das configurações de ambiente quando necessário;
- Publicação das versões nas plataformas de hospedagem.

A documentação técnica, os arquivos de configuração e o histórico do Git servem como referências para acompanhar as mudanças e manter a consistência do projeto.

---

## 13. Referências técnicas

Principais arquivos utilizados na organização e manutenção do sistema:

| Arquivo/Diretório | Responsabilidade |
|---|---|
| `frontend/` | Aplicação frontend. |
| `backend/` | Aplicação backend. |
| `backend/prisma/` | Schema e migrações do banco. |
| `test/` | Testes automatizados. |
| `.github/workflows/ci.yml` | Pipeline de integração contínua. |
| `docker-compose.yml` | Infraestrutura local do PostgreSQL. |
| `.env.example` | Referência das variáveis de ambiente. |
| `frontend/next.config.ts` | Configurações do Next.js e proxy da API. |
| `README.md` | Instruções gerais e documentação do projeto. |

**Projeto:** Sistema de Adoção de Animais  
**Repositório:** `xavierrjon/sistema-adocao-pets`