import type { Animal } from "@/types/animal";

/**
 * Dados temporários para desenvolvimento da interface.
 * Serão substituídos pelos dados reais da API na etapa de integração.
 */
export const ANIMALS_MOCK: Animal[] = [
  {
    id: "1",
    name: "Amber",
    species: "Gato",
    breed: "SRD",
    sex: "Fêmea",
    size: "Médio",
    age: "1 ano",
    description:
      "A Amber é uma gatinha dócil e carinhosa que procura um novo lar. Adora receber colo, dormir em lugares quentinhos e brincar com bolinhas de papel. Já está castrada e vacinada, se dá bem com outros gatos e é perfeita para apartamentos.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/amber.svg",
  },
  {
    id: "2",
    name: "Toby",
    species: "Cachorro",
    breed: "Vira-lata",
    sex: "Macho",
    size: "Grande",
    age: "3 anos",
    description:
      "O Toby é um cãozinho superbrincalhão e companheiro. Caminha bem na coleira, adora crianças e aprende truques rápido. Precisa de espaço para passear e de uma família com tempo para dedicar a ele.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/toby.svg",
  },
  {
    id: "3",
    name: "Mel",
    species: "Cachorro",
    breed: "Shih Tzu",
    sex: "Fêmea",
    size: "Pequeno",
    age: "2 anos",
    description:
      "A Mel é uma cadela tranquila e muito apegada às pessoas. Ideal para quem procura companhia dentro de casa: acompanha os tutores pela casa e ama uma soneca no colo. Está castrada e com as vacinas em dia.",
    status: "EM_PROCESSO",
    location: "Manaus, AM",
    imageUrl: "/images/animals/mel.svg",
  },
  {
    id: "4",
    name: "Pipoca",
    species: "Ave",
    breed: "Calopsita",
    sex: "Macho",
    size: "Pequeno",
    age: "8 meses",
    description:
      "O Pipoca é uma calopsita curiosa e sociável que canta para chamar atenção. Vive bem em gaiola espaçosa e adora sair para voar pela casa em momentos supervisionados. Vem com a gaiola de presente para quem o adotar.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/pipoca.svg",
  },
  {
    id: "5",
    name: "Thor",
    species: "Cachorro",
    breed: "Labrador",
    sex: "Macho",
    size: "Grande",
    age: "1 ano",
    description:
      "O Thor é um filhote gigante de energia infinita. Adora água, buscar bolinha e fazer novos amigos — de humanos e de outros cães. Precisa de família ativa e disposta a investir em adestramento.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/thor.svg",
  },
  {
    id: "6",
    name: "Luna",
    species: "Gato",
    breed: "Siamês",
    sex: "Fêmea",
    size: "Pequeno",
    age: "6 meses",
    description:
      "A Luna é uma gatinha falante que responde quando você chama. Muito inteligente, já usa a caixa de areia perfeitamente e adora escaladores. Procura uma família paciente com filhotes cheios de energia.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/luna.svg",
  },
  {
    id: "7",
    name: "Bidu",
    species: "Cachorro",
    breed: "Poodle",
    sex: "Macho",
    size: "Pequeno",
    age: "5 anos",
    description:
      "O Bidu é um senhor calmo e educado, perfeito para lares mais silenciosos. Convive bem com outros animais, não faz muita bagunça e adora um passeio curto no fim da tarde.",
    status: "ADOTADO",
    location: "Manaus, AM",
    imageUrl: "/images/animals/bidu.svg",
  },
  {
    id: "8",
    name: "Bolota",
    species: "Coelho",
    breed: "Holland",
    sex: "Fêmea",
    size: "Pequeno",
    age: "4 meses",
    description:
      "A Bolota é uma coelhinha curiosa que adora explorar cantos da casa e comer folhas verdes. Precisa de um ambiente seguro para ficar solta parte do dia e de tutors que entendam suas necessidades específicas.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/bolota.svg",
  },
  {
    id: "9",
    name: "Nino",
    species: "Gato",
    breed: "SRD",
    sex: "Macho",
    size: "Médio",
    age: "2 anos",
    description:
      "O Nino é um gato independente que escolheu o modo vida de apartamento. Dorme a maior parte do dia, mas reserva energia para as sessões de caça ao laser. Se dá bem com gatos tranquilos como ele.",
    status: "DISPONIVEL",
    location: "Manaus, AM",
    imageUrl: "/images/animals/nino.svg",
  },
];
