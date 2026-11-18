import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const prisma = new PrismaClient();
const OWNER_EMAIL = "responsavel@adoteja.test";
const OWNER_WHATSAPP = "92999999999";

/**
 * Dados de exemplo para desenvolvimento e demonstração.
 * (Antes vinham de frontend/src/lib/mock-animals.ts, removido quando a
 * interface passou a consumir a API real.)
 */
const ANIMALS_SEED = [
  {
    id: "1",
    name: "Amber",
    species: "Gato",
    breed: "SRD",
    sex: "Fêmea",
    size: "Médio",
    description:
      "A Amber é uma gatinha dócil e carinhosa que procura um novo lar. Adora receber colo, dormir em lugares quentinhos e brincar com bolinhas de papel. Já está castrada e vacinada, se dá bem com outros gatos e é perfeita para apartamentos.",
    status: "DISPONIVEL",
  },
  {
    id: "2",
    name: "Toby",
    species: "Cachorro",
    breed: "Vira-lata",
    sex: "Macho",
    size: "Grande",
    description:
      "O Toby é um cãozinho superbrincalhão e companheiro. Caminha bem na coleira, adora crianças e aprende truques rápido. Precisa de espaço para passear e de uma família com tempo para dedicar a ele.",
    status: "DISPONIVEL",
  },
  {
    id: "3",
    name: "Mel",
    species: "Cachorro",
    breed: "Shih Tzu",
    sex: "Fêmea",
    size: "Pequeno",
    description:
      "A Mel é uma cadela tranquila e muito apegada às pessoas. Ideal para quem procura companhia dentro de casa: acompanha os tutores pela casa e ama uma soneca no colo. Está castrada e com as vacinas em dia.",
    status: "EM_PROCESSO",
  },
  {
    id: "4",
    name: "Pipoca",
    species: "Ave",
    breed: "Calopsita",
    sex: "Macho",
    size: "Pequeno",
    description:
      "O Pipoca é uma calopsita curiosa e sociável que canta para chamar atenção. Vive bem em gaiola espaçosa e adora sair para voar pela casa em momentos supervisionados. Vem com a gaiola de presente para quem o adotar.",
    status: "DISPONIVEL",
  },
  {
    id: "5",
    name: "Thor",
    species: "Cachorro",
    breed: "Labrador",
    sex: "Macho",
    size: "Grande",
    description:
      "O Thor é um filhote gigante de energia infinita. Adora água, buscar bolinha e fazer novos amigos — de humanos e de outros cães. Precisa de família ativa e disposta a investir em adestramento.",
    status: "DISPONIVEL",
  },
  {
    id: "6",
    name: "Luna",
    species: "Gato",
    breed: "Siamês",
    sex: "Fêmea",
    size: "Pequeno",
    description:
      "A Luna é uma gatinha falante que responde quando você chama. Muito inteligente, já usa a caixa de areia perfeitamente e adora escaladores. Procura uma família paciente com filhotes cheios de energia.",
    status: "DISPONIVEL",
  },
  {
    id: "7",
    name: "Bidu",
    species: "Cachorro",
    breed: "Poodle",
    sex: "Macho",
    size: "Pequeno",
    description:
      "O Bidu é um senhor calmo e educado, perfeito para lares mais silenciosos. Convive bem com outros animais, não faz muita bagunça e adora um passeio curto no fim da tarde.",
    status: "ADOTADO",
  },
  {
    id: "8",
    name: "Bolota",
    species: "Coelho",
    breed: "Holland",
    sex: "Fêmea",
    size: "Pequeno",
    description:
      "A Bolota é uma coelhinha curiosa que adora explorar cantos da casa e comer folhas verdes. Precisa de um ambiente seguro para ficar solta parte do dia e de tutores que entendam suas necessidades específicas.",
    status: "DISPONIVEL",
  },
  {
    id: "9",
    name: "Nino",
    species: "Gato",
    breed: "SRD",
    sex: "Macho",
    size: "Médio",
    description:
      "O Nino é um gato independente que escolheu o modo vida de apartamento. Dorme a maior parte do dia, mas reserva energia para as sessões de caça ao laser. Se dá bem com gatos tranquilos como ele.",
    status: "DISPONIVEL",
  },
];

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

  for (const animal of ANIMALS_SEED) {
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

  console.log(`Seed concluído: ${ANIMALS_SEED.length} animais vinculados a ${owner.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
