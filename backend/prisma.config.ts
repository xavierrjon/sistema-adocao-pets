import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// O Prisma CLI é executado a partir de `backend/`.
// Este projeto usa um único `.env` na raiz do monorepo, então ele é
// carregado explicitamente aqui para os comandos do Prisma.
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
