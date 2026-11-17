import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hash usado apenas para igualar o tempo de resposta quando o e-mail não existe. */
export const DUMMY_PASSWORD_HASH = "$2b$12$Ugfsgki4Mha1.gk5AUyDHOg4N.5m93thHVT4gOZPO0U.8NnoBwsZq";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
