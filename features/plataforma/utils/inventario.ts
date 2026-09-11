import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import { ETIQUETA_SUSCRIPCION } from "@features/plataforma/constants/planes.copy"
import type {
  BarberiaInventario,
  EstadoBarberia,
  ResumenPlataforma,
  SegmentoInventario,
  UsoPais,
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
  let clientesTotal = 0
  let clientesNuevos30d = 0
  let citasTotal = 0
  let citas30d = 0
  let citas30dPrevios = 0
  let inactivas30d = 0

  for (const barberia of barberias) {
    porEstado[barberia.estado] += 1
    sedesActivas += barberia.sedesActivas
    barberosActivos += barberia.barberosActivos
    if (!barberia.suscripcion) sinSuscripcion += 1
    else if (barberia.suscripcion.estado === "prueba") enPrueba += 1

    clientesTotal += barberia.uso.clientesTotal
    clientesNuevos30d += barberia.uso.clientesNuevos30d
    citasTotal += barberia.uso.citasTotal
    citas30d += barberia.uso.citas30d
    citas30dPrevios += barberia.uso.citas30dPrevios
    // Cero citas en 30 días y «nunca tuvo ninguna» cuentan igual: las dos son
    // una barbería que no está usando lo que contrató.
    if (barberia.uso.citas30d === 0) inactivas30d += 1
  }

  return {
    total: barberias.length,
    porEstado,
    sedesActivas,
    barberosActivos,
    sinSuscripcion,
    enPrueba,
    clientesTotal,
    clientesNuevos30d,
    citasTotal,
    citas30d,
    citas30dPrevios,
    inactivas30d,
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

/**
 * El uso por país: cuánto se vendió ahí, cuánta gente hay debajo y si se mueve.
 *
 * **Sustituye a la gráfica de barras que contaba solo barberías.** Aquella
 * respondía «dónde se vendió» y se leía como «dónde se usa», que no es lo mismo:
 * cuatro barberías españolas con más clientela que dieciocho colombianas dormidas
 * es exactamente el caso que una sola barra tapa.
 *
 * Ordenado por clientela y no por número de barberías, porque es la cifra que
 * dice dónde está de verdad el producto.
 */
export function usoPorPais(barberias: BarberiaInventario[]): UsoPais[] {
  const cuentas = new Map<string, UsoPais>()

  for (const barberia of barberias) {
    const codigo = barberia.codigoPais
    const fila = cuentas.get(codigo) ?? {
      codigo,
      nombre: nombreDePais(codigo),
      barberias: 0,
      clientes: 0,
      citas30d: 0,
    }
    fila.barberias += 1
    fila.clientes += barberia.uso.clientesTotal
    fila.citas30d += barberia.uso.citas30d
    cuentas.set(codigo, fila)
  }

  return [...cuentas.values()].sort((a, b) => b.clientes - a.clientes || b.barberias - a.barberias)
}

/**
 * Las barberías con más clientela.
 *
 * **Se excluyen las que tienen cero**, y no por estética: una tabla de «top»
 * rellena con ceros hasta llegar a cinco filas sugiere un ranking donde no hay
 * nada que ordenar. Sin clientela la lista se queda corta, o vacía, y eso ya es
 * la respuesta.
 */
export function topClientela(barberias: BarberiaInventario[], cuantas = 6): BarberiaInventario[] {
  return barberias
    .filter((barberia) => barberia.uso.clientesTotal > 0)
    .sort((a, b) => b.uso.clientesTotal - a.uso.clientesTotal || b.uso.citas30d - a.uso.citas30d)
    .slice(0, cuantas)
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
