import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { SESSION_COOKIE_NAME } from "../lib/auth";
import * as authService from "../services/auth.service";
import type { AuthenticatedUser } from "../types/auth";

export async function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  const token = request.cookies?.[SESSION_COOKIE_NAME];

  if (typeof token !== "string" || token.length === 0) {
    next(new HttpError(401, "Autenticação necessária."));
    return;
  }

  const session = await authService.findValidSession(token);

  if (!session) {
    next(new HttpError(401, "Sessão inválida ou expirada."));
    return;
  }

  request.user = session.user;
  request.authSession = { id: session.id, expiresAt: session.expiresAt };
  next();
}

export function getAuthenticatedUser(request: Request): AuthenticatedUser {
  if (!request.user) {
    throw new HttpError(401, "Autenticação necessária.");
  }

  return request.user;
}
