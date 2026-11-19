import type { Request, Response } from "express";
import {
  getClearCookieOptions,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "../lib/auth";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";

export async function register(request: Request, response: Response) {
  const data = registerSchema.parse(request.body);
  const user = await authService.register(data);
  response.status(201).json(user);
}

export async function login(request: Request, response: Response) {
  const data = loginSchema.parse(request.body);
  const result = await authService.login(data);

  response.cookie(SESSION_COOKIE_NAME, result.token, getSessionCookieOptions(result.rememberMe));
  response.status(200).json(result.user);
}

export async function me(request: Request, response: Response) {
  response.status(200).json(request.user);
}

export async function logout(request: Request, response: Response) {
  const token = request.cookies?.[SESSION_COOKIE_NAME];

  if (typeof token === "string" && token.length > 0) {
    await authService.revokeSession(token);
  }

  response.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());
  response.status(200).json({ message: "Sessão encerrada." });
}
