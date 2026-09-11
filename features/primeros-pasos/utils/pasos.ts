import { puedeAlguna } from "@features/auth/utils/permisos"
import { PASOS_INICIALES } from "@features/primeros-pasos/constants/pasos"
import type {
  PasoInicial,
  ProgresoInicial,
} from "@features/primeros-pasos/types/primeros-pasos.types"
import type { Sesion } from "@features/auth/types/auth.types"
import type { Sede } from "@features/sedes/types/sedes.types"

/**
 * Los pasos que ESTA sesión puede ejecutar de verdad.
 *
 * Se pregunta por la capacidad, nunca por el rol. Un barbero no gestiona sedes,
 * ni personas, ni el catálogo: se queda sin ningún paso y la lista entera
 * desaparece, que es lo correcto — proponerle algo que termina en un 403 sería
 * peor que no darle bienvenida.
 */
export function pasosDeSesion(sesion: Sesion | null): PasoInicial[] {
  return PASOS_INICIALES.filter((paso) => puedeAlguna(sesion, paso.permisos))
}

/**
 * Si la sede ya dice DÓNDE está.
 *
 * El alta abierta crea la sede con nombre y zona horaria y nada más, así que
 * "hay una sede" no distingue a quien se acaba de registrar de quien terminó el
 * trabajo. La dirección sí: es lo que el escaparate publica y lo que lleva a un
 * cliente hasta la puerta.
 */
export function sedeCompleta(sede: Sede | null): boolean {
  if (!sede?.direccion) return false
  const { calle, ciudad } = sede.direccion
  return Boolean(calle?.trim() || ciudad?.trim())
}

/**
 * Las sedes que cuentan para los primeros pasos: las activas. Una desactivada
 * no recibe clientes, y completarla no deja la barbería lista para nada.
 */
export function sedesActivas(sedes: Sede[]): Sede[] {
  return sedes.filter((sede) => sede.activa)
}

/**
 * A quién preguntarle la jornada: primero los que ya tienen oferta —son los que
 * de verdad atienden—, y como mucho `tope`. Preguntarle a cada barbero es un
 * viaje por persona en cada entrada al panel; quedarse con el primero a secas
 * dejaba el paso pendiente cuando el primero de la lista era justo el que no
 * trabaja.
 */
export function candidatosJornada<T extends { id: string; oferta: unknown[] }>(
  barberos: T[],
  tope = 5
): T[] {
  return [...barberos].sort((a, b) => b.oferta.length - a.oferta.length).slice(0, tope)
}

export function pasosHechos(pasos: PasoInicial[], progreso: ProgresoInicial): number {
  return pasos.filter((paso) => progreso[paso.clave]).length
}

/**
 * Cuando no queda nada pendiente la lista se retira: un panel maduro no puede
 * quedarse con un cartel de bienvenida para siempre.
 */
export function todoHecho(pasos: PasoInicial[], progreso: ProgresoInicial): boolean {
  return pasos.length > 0 && pasosHechos(pasos, progreso) === pasos.length
}
