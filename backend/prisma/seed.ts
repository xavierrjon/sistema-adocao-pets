import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ANIMALS_MOCK } from "../../frontend/src/lib/mock-animals";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const prisma = new PrismaClient();
const OWNER_EMAIL = "responsavel@adoteja.test";
const OWNER_WHATSAPP = "92999999999";

function normalizeSex(sex: string) {
  return sex === "Fêmea" ? "Femea" : "Macho";
}

function normalizeSize(size: string) {
  return size === "Médio" ? "Medio" : size;
}

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: {
      name: "Responsável AdoteJá",
      email: OWNER_EMAIL,
      passwordHash: await bcrypt.hash("SenhaSegura123", 12),
    },
  });

  for (const animal of ANIMALS_MOCK) {
    const data = {
      name: animal.name,
      species: animal.species,
      breed: animal.breed ?? "SRD",
      sex: normalizeSex(animal.sex),
      size: normalizeSize(animal.size),
      description: animal.description,
      status: animal.status,
      whatsapp: OWNER_WHATSAPP,
      userId: owner.id,
    };

    await prisma.animal.upsert({
      where: { id: animal.id },
      update: data,
      create: { id: animal.id, ...data },
    });
  }

  console.log(`Seed concluído: ${ANIMALS_MOCK.length} animais vinculados a ${owner.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
