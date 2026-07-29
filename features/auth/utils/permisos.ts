import type { Sesion } from "@features/auth/types/auth.types"

/**
 * Si la sesión trae una capacidad concreta.
 *
 * Se pregunta por la CAPACIDAD, nunca por el rol: `puede(sesion, "agenda.gestionar")`
 * y jamás `sesion.rol?.codigo === "propietario"`. Los roles son fijos, pero lo
 * que puede una persona no sale solo de su rol: encima van sus concesiones y sus
 * revocaciones. Comparar el código dejaría fuera al administrador al que le
 * quitaron algo y al recepcionista al que le dieron de más.
 *
 * Ocultar un botón NO es seguridad: la API vuelve a comprobar el permiso en cada
 * petición y es ella quien manda. Esto solo evita ofrecer acciones que van a
 * terminar en un 403.
 */
export function puede(sesion: Sesion | null, permiso: string): boolean {
  return sesion?.permisos.includes(permiso) ?? false
}

/** Si trae AL MENOS una de varias. Útil para mostrar una sección con submenús. */
export function puedeAlguna(sesion: Sesion | null, permisos: string[]): boolean {
  return permisos.some((permiso) => puede(sesion, permiso))
}

/**
 * Qué app corresponde a esta sesión.
 *
 * Sale del `tipo` y no de qué campos vengan vacíos: el cliente final tiene
 * barbería y no tiene membresía, así que deducirlo de la ausencia de barbería
 * —como se hacía cuando solo existían dos actores— lo clasificaría mal.
 */
export function appDeSesion(sesion: Sesion | null): "panel" | "admin" | "portal" | null {
  if (!sesion) return null
  if (sesion.tipo === "plataforma") return "admin"
  if (sesion.tipo === "cliente") return "portal"
  return "panel"
}
