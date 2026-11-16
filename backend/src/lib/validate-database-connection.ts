import dotenv from "dotenv";
import path from "node:path";

// A partir de `src/lib` (dev) ou `dist/lib` (build), a raiz do monorepo
// fica três níveis acima, onde está o `.env` compartilhado.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import prisma from "../lib/prisma";

async function main() {
  await prisma.$connect();
  console.log("Conexão com o PostgreSQL estabelecida via Prisma.");
}

main()
  .catch((error) => {
    console.error("Não foi possível conectar ao PostgreSQL.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });