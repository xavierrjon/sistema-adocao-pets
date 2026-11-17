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

export function getAllowedOrigins(): string[] {
  return (process.env.FRONTEND_URL ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
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
