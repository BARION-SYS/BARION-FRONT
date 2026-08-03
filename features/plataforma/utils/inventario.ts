import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import { ETIQUETA_SUSCRIPCION } from "@features/plataforma/constants/planes.copy"
import type {
  BarberiaInventario,
  EstadoBarberia,
  ResumenPlataforma,
  SegmentoInventario,
} from "@features/plataforma/types/plataforma.types"
import type { TonoEstado } from "@shared/types/ui.types"

/**
 * El estado nunca se distingue solo por color: cada uno lleva su etiqueta.
 * `solo_lectura` es la prueba vencida — consulta sí, escritura no.
 */
export const ESTADO_BARBERIA: Record<EstadoBarberia, { tono: TonoEstado; etiqueta: string }> = {
  activa: { tono: "exito", etiqueta: "Activa" },
  solo_lectura: { tono: "advertencia", etiqueta: "Solo lectura" },
  suspendida: { tono: "peligro", etiqueta: "Suspendida" },
}

/** A dónde se puede pasar desde cada estado. Las mismas transiciones que la API. */
export const TRANSICIONES_ESTADO: Record<EstadoBarberia, EstadoBarberia[]> = {
  activa: ["suspendida", "solo_lectura"],
  solo_lectura: ["activa", "suspendida"],
  suspendida: ["activa"],
}

/** Por qué se pasa a cada estado — lo que necesita saber quien va a pulsarlo. */
export const MOTIVO_TRANSICION: Record<EstadoBarberia, string> = {
  activa: "Vuelve a operar con normalidad",
  solo_lectura: "Consulta su agenda, pero no escribe",
  suspendida: "Pierde el acceso hasta que se cobre",
}

/** El color con el que cada estado entra en las gráficas. */
export const COLOR_ESTADO: Record<EstadoBarberia, string> = {
  activa: "var(--chart-2)",
  solo_lectura: "var(--chart-4)",
  suspendida: "var(--chart-5)",
}

const ORDEN_ESTADOS: EstadoBarberia[] = ["activa", "solo_lectura", "suspendida"]

/** «Colombia» en vez de «CO» cuando el país es uno de los que Barion opera. */
export function nombreDePais(codigo: string): string {
  return codigo in regiones ? nombresDeRegion[codigo as CodigoRegion] : codigo
}

export function etiquetaSuscripcion(estado: string): string {
  return ETIQUETA_SUSCRIPCION[estado] ?? estado
}

/**
 * Los indicadores del área, contados sobre el inventario COMPLETO.
 *
 * Se derivan en el cliente y no los calcula la API: son sumas de lo que ya
 * viaja en cada fila, y pedirle un endpoint de agregados sería duplicar la
 * verdad para ahorrarse un `reduce`.
 */
export function resumirInventario(barberias: BarberiaInventario[]): ResumenPlataforma {
  const porEstado: Record<EstadoBarberia, number> = {
    activa: 0,
    solo_lectura: 0,
    suspendida: 0,
  }

  let sedesActivas = 0
  let barberosActivos = 0
  let sinSuscripcion = 0
  let enPrueba = 0

  for (const barberia of barberias) {
    porEstado[barberia.estado] += 1
    sedesActivas += barberia.sedesActivas
    barberosActivos += barberia.barberosActivos
    if (!barberia.suscripcion) sinSuscripcion += 1
    else if (barberia.suscripcion.estado === "prueba") enPrueba += 1
  }

  return {
    total: barberias.length,
    porEstado,
    sedesActivas,
    barberosActivos,
    sinSuscripcion,
    enPrueba,
  }
}

/** Siempre los tres estados, aunque alguno esté en cero: la ausencia es el dato. */
export function distribucionPorEstado(barberias: BarberiaInventario[]): SegmentoInventario[] {
  const resumen = resumirInventario(barberias)
  return ORDEN_ESTADOS.map((estado) => ({
    clave: estado,
    etiqueta: ESTADO_BARBERIA[estado].etiqueta,
    total: resumen.porEstado[estado],
  }))
}

export function distribucionPorPais(barberias: BarberiaInventario[]): SegmentoInventario[] {
  return agrupar(barberias, (b) => b.codigoPais, nombreDePais)
}

/** Sin suscripción es su propio grupo: es la cifra que hay que perseguir. */
export function distribucionPorPlan(barberias: BarberiaInventario[]): SegmentoInventario[] {
  return agrupar(
    barberias,
    (b) => b.suscripcion?.planCodigo ?? "sin-plan",
    (clave) => (clave === "sin-plan" ? "Sin plan" : clave)
  )
}

/** Las últimas que entraron, que es lo que se mira al abrir el área. */
export function ultimasAltas(barberias: BarberiaInventario[], cuantas = 5): BarberiaInventario[] {
  return [...barberias]
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
    .slice(0, cuantas)
}

function agrupar(
  barberias: BarberiaInventario[],
  claveDe: (barberia: BarberiaInventario) => string,
  etiquetaDe: (clave: string) => string
): SegmentoInventario[] {
  const cuentas = new Map<string, number>()
  for (const barberia of barberias) {
    const clave = claveDe(barberia)
    cuentas.set(clave, (cuentas.get(clave) ?? 0) + 1)
  }
  return [...cuentas.entries()]
    .map(([clave, total]) => ({ clave, etiqueta: etiquetaDe(clave), total }))
    .sort((a, b) => b.total - a.total)
}
