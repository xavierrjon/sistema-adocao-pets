import type { NextFunction, Request, Response } from "express";
import { isAllowedOrigin, SESSION_COOKIE_NAME } from "../lib/auth";
import { HttpError } from "../lib/http-error";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Defesa em profundidade para autenticação baseada em cookies:
 * SameSite=Lax/Strict já bloqueia o envio do cookie em requisições cross-site,
 * e a checagem de Origin cobre navegadores que enviam o cookie por outros meios.
 */
export function csrfProtection(request: Request, _response: Response, next: NextFunction) {
  if (SAFE_METHODS.has(request.method)) {
    next();
    return;
  }

  // Rotas públicas (cadastro e login) não possuem sessão para serem abusadas.
  if (!request.cookies?.[SESSION_COOKIE_NAME]) {
    next();
    return;
  }

  // Clientes não navegadores (curl, testes, integrações) não enviam Origin.
  const origin = request.headers.origin;
  if (!origin) {
    next();
    return;
  }

  if (isAllowedOrigin(origin)) {
    next();
    return;
  }

  next(new HttpError(403, "Origem não autorizada."));
}
