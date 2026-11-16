# AdoteJá

Plataforma web para divulgação e adoção responsável de animais.

O **AdoteJá** conecta pessoas interessadas em adotar animais a responsáveis que desejam encontrar um novo lar para seus pets, oferecendo uma experiência simples para visualizar, pesquisar e cadastrar animais para adoção.

## Funcionalidades

- Cadastro e autenticação de usuários
- Listagem de animais disponíveis
- Pesquisa e filtros por características
- Visualização dos detalhes do animal
- Cadastro e gerenciamento de anúncios
- Alteração do status de adoção
- Contato com o responsável através do WhatsApp
- Interface responsiva

## Tecnologias

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Node.js**
- **Express**
- **PostgreSQL**
- **Prisma**
- **Git & GitHub**
- **GitHub Actions**
- **Vercel**

## Executando o projeto

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd adoteja
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente conforme o arquivo `.env.example`.

Execute o projeto em desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Fluxo de desenvolvimento

O projeto utiliza um fluxo baseado em branches:

```text
feature/* → develop → release/* → main
```

As alterações são realizadas através de **Pull Requests** e passam por verificações automatizadas de CI antes da integração.

## CI/CD

O projeto utiliza **GitHub Actions** para automação de:

- Typecheck
- Testes
- Build

A publicação dos ambientes é realizada através da **Vercel**.

## Projeto acadêmico

Projeto desenvolvido para a disciplina de **Gerência de Configuração e DevOps**, com foco na aplicação prática de:

- Gerência de configuração;
- Controle de versão;
- Colaboração com Git e GitHub;
- Gerenciamento de ambientes;
- Auditoria de alterações;
- Integração contínua (CI);
- Entrega contínua (CD).

---

**AdoteJá** — conectando pessoas a novos companheiros.