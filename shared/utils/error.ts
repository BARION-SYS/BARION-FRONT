import { ZodError } from "zod"
import type { HttpError, MotivoError } from "@shared/types/api.types"

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

/**
 * El catálogo, como valor: hace falta en ejecución para descartar un `motivo`
 * que esta versión del front no conoce todavía.
 */
const MOTIVOS: readonly MotivoError[] = [
  "falta_puntaje",
  "requiere_confirmacion",
  "token_invalido",
  "preregistro_invalido",
  "funcion_no_incluida",
]

/**
 * Un `motivo` que este front sabe interpretar.
 *
 * Lo desconocido se descarta en vez de propagarse: el catálogo crece con el
 * sistema y una pantalla que ramifica por un valor que no entiende haría algo
 * peor que no ramificar.
 */
export function esMotivoConocido(valor: unknown): valor is MotivoError {
  return typeof valor === "string" && (MOTIVOS as readonly string[]).includes(valor)
}

/**
 * El `motivo` de un error de la api, si lo trae.
 *
 * `undefined` significa «no lo dijo», no «no hay»: la api puede ir por detrás del
 * despliegue del front, y quien ramifique con esto tiene que tener un camino para
 * cuando falte.
 */
export function motivoDeError(err: unknown): MotivoError | undefined {
  return esHttpError(err) ? err.motivo : undefined
}

/**
 * ¿Este 403 es del PLAN y no de los permisos?
 *
 * Los dos llegan con `codigo: "acceso_denegado"`, así que sin el motivo son
 * indistinguibles — y llevan a pantallas opuestas: «pídeselo a quien administra»
 * frente a «cambia de plan», que es algo que quien lo está leyendo suele poder
 * hacer él mismo. Comparar el mensaje no es una alternativa: es copy.
 */
export function esFuncionNoIncluida(err: unknown): boolean {
  return motivoDeError(err) === "funcion_no_incluida"
}
