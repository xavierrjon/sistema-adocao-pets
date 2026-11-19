import type { CookieOptions } from "express";

export const SESSION_COOKIE_NAME = "adoteja_session";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const SESSION_DURATION = {
  /** Sessão sem "lembrar de mim": cookie de sessão no navegador. */
  short: 12 * HOUR,
  /** Sessão persistente quando o usuário marca "lembrar de mim". */
  remember: 30 * DAY,
} as const;

/**
 * Origens do frontend publicado que precisam de CORS em produção.
 * Mantidas explicitamente para que o deploy funcione mesmo se FRONTEND_URL
 * não estiver definida no ambiente da Vercel.
 */
const PRODUCTION_ORIGINS = [
  "https://adoteja-murex.vercel.app",
  "https://adoteja-am.vercel.app",
] as const;

/** Origens usadas apenas no desenvolvimento local. */
const DEVELOPMENT_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"] as const;

function normalizeOrigin(origin: string): string {
  // O navegador envia a origem sem barra final e em minúsculas.
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

export function getAllowedOrigins(): string[] {
  const configured = (process.env.FRONTEND_URL ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  // Origens publicadas valem em qualquer ambiente; localhost só fora de produção.
  const defaults =
    process.env.NODE_ENV === "production"
      ? PRODUCTION_ORIGINS
      : [...PRODUCTION_ORIGINS, ...DEVELOPMENT_ORIGINS];

  return Array.from(new Set([...configured, ...defaults.map(normalizeOrigin)]));
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  return getAllowedOrigins().includes(normalizeOrigin(origin));
}

function getSameSite(): CookieOptions["sameSite"] {
  const configured = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();

  if (configured === "strict" || configured === "lax" || configured === "none") {
    return configured;
  }

  return "lax";
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: getSameSite(),
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

export function getSessionCookieOptions(rememberMe: boolean): CookieOptions {
  return {
    ...baseCookieOptions(),
    ...(rememberMe ? { maxAge: SESSION_DURATION.remember } : {}),
  };
}

export function getClearCookieOptions(): CookieOptions {
  return baseCookieOptions();
}
