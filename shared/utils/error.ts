import { ZodError } from "zod"
import type { HttpError } from "@shared/types/api.types"

function esHttpError(err: unknown): err is HttpError {
  return typeof err === "object" && err !== null && "status" in err && "message" in err
}

// Único parseador de errores — todos los hooks lo usan.
export function getErrorMessage(err: unknown): string {
  if (esHttpError(err)) return err.message
  if (err instanceof ZodError) return err.issues[0]?.message ?? "Datos inválidos"
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  return "Ocurrió un error inesperado"
}
