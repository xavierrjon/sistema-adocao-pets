import { ApiError } from "@/services/api";

export function detailsToFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.details) return {};

  return error.details.reduce<Record<string, string>>((acc, detail) => {
    acc[detail.field] = detail.message;
    return acc;
  }, {});
}

export function isApiErrorWithStatus(error: unknown, status: number): boolean {
  return error instanceof ApiError && error.status === status;
}
