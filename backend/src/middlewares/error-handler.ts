import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error";

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({ error: "Rota não encontrada." });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Dados inválidos.",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      response.status(413).json({ error: "A imagem deve ter no máximo 5 MB." });
      return;
    }

    response.status(400).json({ error: "Envie no máximo um arquivo no campo \"image\"." });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({ error: "Registro já existente." });
      return;
    }

    if (error.code === "P2025") {
      response.status(404).json({ error: "Registro não encontrado." });
      return;
    }

    if (error.code === "P2003") {
      response.status(409).json({ error: "Operação viola a integridade dos dados." });
      return;
    }
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "JSON inválido." });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Erro interno do servidor." });
}
