import { MoonStar, Sparkles, TrendingDown, TrendingUp, Minus, type LucideIcon } from "lucide-react"
import type { BarberiaInventario } from "@features/plataforma/types/plataforma.types"
import type { DireccionTendencia, TonoEstado } from "@shared/types/ui.types"

/**
 * El PULSO de una barbería: si se está moviendo, y hacia dónde.
 *
 * Es otra pregunta que su `estado`. El estado dice si PUEDE operar (activa,
 * solo lectura, suspendida); el pulso dice si DE VERDAD opera. Una barbería
 * activa y dormida paga —por ahora— y es exactamente la que se va a ir: deja de
 * usar Barion meses antes de dejar de pagarlo.
 *
 * Se mide sobre citas CREADAS (si alguien abre el panel), comparando los
 * últimos 30 días con los 30 anteriores.
 */
export type PulsoBarberia = "nueva" | "creciendo" | "estable" | "en_caida" | "dormida"

/** Menos de esto no tiene ventana previa completa: juzgarla sería injusto. */
const DIAS_NUEVA = 30
/** Una caída del 40 % o más. Con menos es ruido de un mes flojo. */
const UMBRAL_CAIDA = 0.6
/** Un 25 % más, y al menos cinco citas: de 2 a 3 no es crecer. */
const UMBRAL_CRECIMIENTO = 1.25
const MINIMO_CRECIMIENTO = 5
/** Por debajo de esto la ventana previa es tan pequeña que cualquier cambio es ruido. */
const BASE_MINIMA = 10

const MS_DIA = 24 * 60 * 60 * 1000

export function pulsoDe(barberia: BarberiaInventario, ahora: Date = new Date()): PulsoBarberia {
  const { citas30d, citas30dPrevios } = barberia.uso
  const edadDias = (ahora.getTime() - new Date(barberia.creadoEn).getTime()) / MS_DIA

  if (edadDias < DIAS_NUEVA) return "nueva"
  if (citas30d === 0) return "dormida"
  if (citas30dPrevios >= BASE_MINIMA && citas30d < citas30dPrevios * UMBRAL_CAIDA) {
    return "en_caida"
  }
  if (
    citas30d >= citas30dPrevios * UMBRAL_CRECIMIENTO &&
    citas30d - citas30dPrevios >= MINIMO_CRECIMIENTO
  ) {
    return "creciendo"
  }
  return "estable"
}

/** Cómo se pinta cada pulso: tono de estado + ícono + etiqueta, nunca solo color. */
export const PULSO: Record<
  PulsoBarberia,
  { etiqueta: string; tono: TonoEstado; icono: LucideIcon; detalle: string }
> = {
  nueva: {
    etiqueta: "Nueva",
    tono: "info",
    icono: Sparkles,
    detalle: "Menos de 30 días: todavía no hay con qué compararla",
  },
  creciendo: {
    etiqueta: "Creciendo",
    tono: "exito",
    icono: TrendingUp,
    detalle: "Crea bastantes más citas que el mes anterior",
  },
  estable: {
    etiqueta: "Estable",
    tono: "neutro",
    icono: Minus,
    detalle: "Un ritmo parecido al del mes anterior",
  },
  en_caida: {
    etiqueta: "En caída",
    tono: "advertencia",
    icono: TrendingDown,
    detalle: "Crea al menos un 40 % menos de citas que el mes anterior",
  },
  dormida: {
    etiqueta: "Dormida",
    tono: "peligro",
    icono: MoonStar,
    detalle: "Ninguna cita creada en 30 días",
  },
}

/**
 * Cambio porcentual de `previo` a `actual`, en escala 0–100.
 *
 * `null` cuando no hay base: pasar de 0 a 12 no es «+∞ %», y pintarlo como un
 * número inventaría una tendencia.
 */
export function variacion(actual: number, previo: number): number | null {
  if (previo === 0) return null
  return ((actual - previo) / previo) * 100
}

export function direccionDe(cambio: number | null): DireccionTendencia {
  if (cambio === null || Math.abs(cambio) < 1) return "neutra"
  return cambio > 0 ? "sube" : "baja"
}

// ── La salud de la cartera entera ────────────────────────────────────────────

/**
 * Cuatro grupos y no los cinco pulsos más los tres estados: el tablero tiene que
 * leerse de un vistazo, y cuatro es lo que cabe en una barra sin leyenda que
 * descifrar. Cada grupo lleva su desglose en texto al lado.
 */
export type GrupoSalud = "sanas" | "nuevas" | "en_riesgo" | "sin_servicio"

export interface SegmentoSalud {
  grupo: GrupoSalud
  total: number
  /** Qué hay dentro del grupo, ya contado: «3 en caída · 2 dormidas». */
  desglose: { etiqueta: string; total: number }[]
}

export const GRUPO_SALUD: Record<GrupoSalud, { etiqueta: string; tono: TonoEstado }> = {
  sanas: { etiqueta: "Sanas", tono: "exito" },
  nuevas: { etiqueta: "Nuevas", tono: "info" },
  en_riesgo: { etiqueta: "En riesgo", tono: "advertencia" },
  sin_servicio: { etiqueta: "Sin servicio", tono: "peligro" },
}

const ORDEN_GRUPOS: GrupoSalud[] = ["sanas", "nuevas", "en_riesgo", "sin_servicio"]

/**
 * El pulso solo se mide en las ACTIVAS: una suspendida no crea citas porque no
 * puede, y contarla como «dormida» confundiría el impago con el abandono.
 */
export function saludDeCartera(
  barberias: BarberiaInventario[],
  ahora: Date = new Date()
): SegmentoSalud[] {
  const cuenta = {
    creciendo: 0,
    estable: 0,
    nueva: 0,
    en_caida: 0,
    dormida: 0,
    solo_lectura: 0,
    suspendida: 0,
  }

  for (const barberia of barberias) {
    if (barberia.estado !== "activa") cuenta[barberia.estado] += 1
    else cuenta[pulsoDe(barberia, ahora)] += 1
  }

  const grupos: Record<GrupoSalud, SegmentoSalud["desglose"]> = {
    sanas: [
      { etiqueta: "creciendo", total: cuenta.creciendo },
      { etiqueta: "estables", total: cuenta.estable },
    ],
    nuevas: [{ etiqueta: "de menos de 30 días", total: cuenta.nueva }],
    en_riesgo: [
      { etiqueta: "en caída", total: cuenta.en_caida },
      { etiqueta: "dormidas", total: cuenta.dormida },
    ],
    sin_servicio: [
      { etiqueta: "en solo lectura", total: cuenta.solo_lectura },
      { etiqueta: "suspendidas", total: cuenta.suspendida },
    ],
  }

  return ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    total: grupos[grupo].reduce((suma, parte) => suma + parte.total, 0),
    desglose: grupos[grupo].filter((parte) => parte.total > 0),
  }))
}

// ── A quién hay que llamar hoy ───────────────────────────────────────────────

export type MotivoAtencion =
  "sin_propietario" | "mora" | "sobre_limite" | "solo_lectura" | "dormida" | "en_caida"

/** En orden de gravedad: el primero de la lista es el que decide la posición. */
const GRAVEDAD: MotivoAtencion[] = [
  "sin_propietario",
  "mora",
  "sobre_limite",
  "solo_lectura",
  "dormida",
  "en_caida",
]

export const MOTIVO_ATENCION: Record<MotivoAtencion, { etiqueta: string; tono: TonoEstado }> = {
  sin_propietario: { etiqueta: "Sin propietario", tono: "peligro" },
  mora: { etiqueta: "En mora", tono: "peligro" },
  sobre_limite: { etiqueta: "Sobre el límite", tono: "advertencia" },
  solo_lectura: { etiqueta: "Solo lectura", tono: "advertencia" },
  dormida: { etiqueta: "Dormida", tono: "peligro" },
  en_caida: { etiqueta: "En caída", tono: "advertencia" },
}

export interface BarberiaEnAtencion {
  barberia: BarberiaInventario
  motivos: MotivoAtencion[]
}

/**
 * Las barberías que piden una llamada, de la más grave a la menos.
 *
 * Las suspendidas NO entran: ya se decidió sobre ellas, y mezclarlas con las que
 * todavía se pueden salvar esconde a estas. Dentro de la misma gravedad va
 * primero la de más clientela — perderla cuesta más.
 */
export function requierenAtencion(
  barberias: BarberiaInventario[],
  ahora: Date = new Date()
): BarberiaEnAtencion[] {
  const conMotivos: BarberiaEnAtencion[] = []

  for (const barberia of barberias) {
    if (barberia.estado === "suspendida") continue
    const motivos: MotivoAtencion[] = []
    if (!barberia.propietario) motivos.push("sin_propietario")
    if (barberia.suscripcion?.estado === "mora") motivos.push("mora")
    if (barberia.suscripcion?.estado === "sobre_limite") motivos.push("sobre_limite")
    if (barberia.estado === "solo_lectura") motivos.push("solo_lectura")
    if (barberia.estado === "activa") {
      const pulso = pulsoDe(barberia, ahora)
      if (pulso === "dormida" || pulso === "en_caida") motivos.push(pulso)
    }
    if (motivos.length > 0) conMotivos.push({ barberia, motivos })
  }

  const peso = (item: BarberiaEnAtencion) =>
    Math.min(...item.motivos.map((motivo) => GRAVEDAD.indexOf(motivo)))

  return conMotivos.sort(
    (a, b) => peso(a) - peso(b) || b.barberia.uso.clientesTotal - a.barberia.uso.clientesTotal
  )
}

/** Cuántas activas crearon al menos una cita en 30 días: la adopción real. */
export function adopcion(barberias: BarberiaInventario[]): { activas: number; usando: number } {
  const activas = barberias.filter((barberia) => barberia.estado === "activa")
  return {
    activas: activas.length,
    usando: activas.filter((barberia) => barberia.uso.citas30d > 0).length,
  }
}
