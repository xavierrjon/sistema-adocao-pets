import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { SESSION_DURATION } from "../lib/auth";
import { generateSessionToken, hashToken } from "../lib/token";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import type { AuthenticatedUser } from "../types/auth";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "../utils/password";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
} as const;

type ValidSession = {
  id: string;
  expiresAt: Date;
  user: AuthenticatedUser;
};

export type LoginResult = {
  user: AuthenticatedUser;
  token: string;
  rememberMe: boolean;
  expiresAt: Date;
};

export async function register(data: RegisterInput): Promise<AuthenticatedUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(409, "E-mail já cadastrado.");
  }

  const passwordHash = await hashPassword(data.password);

  try {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: publicUserSelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "E-mail já cadastrado.");
    }

    throw error;
  }
}

export async function login(data: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { ...publicUserSelect, passwordHash: true },
  });

  // Compara sempre um hash para não revelar, pelo tempo de resposta, se o e-mail existe.
  const passwordMatches = await verifyPassword(data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches) {
    throw new HttpError(401, "E-mail ou senha inválidos.");
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  const token = generateSessionToken();
  const duration = data.rememberMe ? SESSION_DURATION.remember : SESSION_DURATION.short;
  const expiresAt = new Date(Date.now() + duration);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: publicUser,
    token,
    rememberMe: data.rememberMe,
    expiresAt,
  };
}

export async function findValidSession(token: string): Promise<ValidSession | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: publicUserSelect },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function revokeSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
}
