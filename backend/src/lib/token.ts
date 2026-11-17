import { createHash, randomBytes } from "node:crypto";

/** Token de 256 bits, codificado em base64url (seguro para cookies). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** O token original nunca é persistido: o banco armazena apenas este hash. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
