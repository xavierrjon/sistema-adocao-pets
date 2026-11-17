/**
 * Camada centralizada de comunicação com a API.
 *
 * A URL base vem de `NEXT_PUBLIC_API_URL`. Por compatibilidade, esta camada
 * normaliza o valor para que o prefixo `/api` seja usado uma única vez.
 */
const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const normalizedUrl = configuredUrl.trim().replace(/\/+$/, "");

export const API_BASE_URL = normalizedUrl.endsWith("/api")
  ? normalizedUrl
  : `${normalizedUrl}/api`;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Não foi possível se comunicar com a API.", 0);
  }

  if (!response.ok) {
    let message = "Não foi possível concluir a solicitação.";

    try {
      const body = (await response.json()) as { error?: unknown };
      if (typeof body?.error === "string" && body.error.trim()) {
        message = body.error;
      }
    } catch {
      // Mantém a mensagem genérica quando o corpo não é JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
