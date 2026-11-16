import prisma from "../lib/prisma";
import { HttpError } from "../lib/http-error";

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      whatsapp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "Usuário não encontrado.");
  }

  return user;
}
