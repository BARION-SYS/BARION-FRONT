import type { PeriodoTarifa } from "@features/plataforma/types/plataforma.types"
import type { TonoEstado } from "@shared/types/ui.types"

/**
 * El texto comercial de lo que la API entrega como banderas.
 *
 * `funciones` y `limites` viajan como CLAVES a propósito: son lógica de
 * producto, y convertirlas en frases del lado de la base ataría un cambio de
 * redacción a lo que enciende o apaga un módulo. Traducirlas es de quien las
 * pinta, y este es su sitio.
 *
 * Una clave que no esté aquí se enseña tal cual en vez de esconderse: un plan
 * nuevo con una función nueva se ve —fea, pero se ve— y no desaparece de la
 * pantalla sin que nadie se entere.
 */
export const ETIQUETA_FUNCION: Record<string, string> = {
  agenda: "Agenda y citas",
  portal: "Portal de reservas",
  recordatorios: "Recordatorios",
  clientes: "Base de clientes",
  comisiones: "Comisiones y nómina",
  campanas: "Campañas",
  fidelidad: "Fidelización",
  listaEspera: "Lista de espera",
  reportes: "Reportes",
  multisede: "Varias sedes",
}

export const ETIQUETA_LIMITE: Record<string, string> = {
  sedes: "Sedes",
  barberos: "Barberos",
}

/**
 * Estado de la suscripción, con los cinco valores que admite la base
 * (`suscripciones_estado_check`). Uno nuevo se enseña con su código crudo hasta
 * que alguien lo redacte aquí — visible y feo antes que invisible.
 */
export const ETIQUETA_SUSCRIPCION: Record<string, string> = {
  prueba: "En prueba",
  activa: "Al día",
  mora: "En mora",
  cancelada: "Cancelada",
  sobre_limite: "Sobre el límite",
}

/** El tono con el que se pinta cada estado — nunca solo color: siempre etiqueta. */
export const TONO_SUSCRIPCION: Record<string, TonoEstado> = {
  prueba: "info",
  activa: "exito",
  mora: "advertencia",
  cancelada: "neutro",
  sobre_limite: "peligro",
}

/**
 * Los tres períodos de cobro, en el orden en el que se leen: del que todo el
 * mundo entiende al que exige más compromiso.
 *
 * La lista es CERRADA porque `periodo` decide cuántos meses dura lo que se abre
 * al cobrar; un valor que nadie sepa traducir a meses abriría un período de
 * duración indefinida.
 */
export const PERIODOS_TARIFA: PeriodoTarifa[] = ["mensual", "semestral", "anual"]

/** El sufijo con el que se lee un precio: «$ 89.000 /mes». */
export const ETIQUETA_PERIODO: Record<string, string> = {
  mensual: "/mes",
  semestral: "/semestre",
  anual: "/año",
}

/** El nombre del período cuando encabeza una columna, en vez de seguir a un precio. */
export const NOMBRE_PERIODO: Record<PeriodoTarifa, string> = {
  mensual: "Mensual",
  semestral: "Semestral",
  anual: "Anual",
}
