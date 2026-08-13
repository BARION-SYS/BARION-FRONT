import type { LucideIcon } from "lucide-react"
import type { IDS_SECCION_CONFIGURACION } from "@features/configuracion/constants/secciones"

/**
 * Sin `horarios`: el horario comercial es de la SEDE, no de la barbería, y vive
 * en `/dashboard/sedes`. Una cadena que abre en dos ciudades tiene dos semanas
 * distintas y no caben en un único formulario de configuración.
 *
 * El union se DERIVA de la lista de apartados: el apartado activo viaja en la
 * dirección y hay que validarlo en ejecución, así que la lista tiene que existir
 * como valor. Escribir el union a mano además dejaría dos verdades.
 */
export type IdSeccionConfiguracion = (typeof IDS_SECCION_CONFIGURACION)[number]

export interface SeccionConfiguracion {
  id: IdSeccionConfiguracion
  etiqueta: string
  icono: LucideIcon
}

/**
 * Tipos ESPEJO del contrato de la API (`/barberias/mi`).
 *
 * Ni teléfono, ni correo, ni dirección: no son de la barbería. El contacto y la
 * dirección son de la SEDE —una cadena tiene varias— y se editan en
 * `/dashboard/sedes`.
 */
export interface FichaBarberia {
  /** Una línea, la cabecera del portal. */
  eslogan: string | null
  descripcion: string | null
  /** Viñetas de venta. El orden se respeta tal como llega. */
  ventajas: string[]
}

/**
 * Dos semillas de color y un logo — no una paleta. Las variantes por tema y los
 * contrastes los deriva `shared/utils/color.ts`: la API guarda la elección, no
 * el diseño.
 */
export interface MarcaBarberia {
  colorMarca: string | null
  colorFondo: string | null
  logoUrl: string | null
  /** Instante UTC del último cambio. `null` si nadie la ha tocado. */
  actualizadaEn: string | null
}

export type EstadoBarberia = "activa" | "suspendida" | "solo_lectura"

export type ModoImpuesto = "incluido" | "agregado"

export interface Barberia {
  id: string
  /** Su dirección pública: `/b/{slug}`. No se edita desde aquí. */
  slug: string
  nombreComercial: string
  pais: string
  monedaPorDefecto: string
  localePorDefecto: string
  zonaHorariaPorDefecto: string
  modoImpuesto: ModoImpuesto
  /** Basis points: 1900 = 19 %. */
  tasaImpuestoBps: number | null
  ficha: FichaBarberia
  marca: MarcaBarberia
  estado: EstadoBarberia
  /**
   * Si el escaparate público se está sirviendo.
   *
   * `false` = `/b/{slug}` responde 404, y con él el cartón QR y el enlace de
   * reserva. Pasa mientras nadie haya abierto el enlace del correo de registro:
   * el panel funciona igual, y por eso hay que decirlo en pantalla antes de que
   * alguien imprima un cartón que no lleva a ningún sitio.
   */
  verificada: boolean
}

export type CanalNotificacion = "whatsapp" | "sms" | "correo" | "interno"

export type CanalesNotificacion = Record<CanalNotificacion, boolean>

export interface InfoCanalNotificacion {
  canal: CanalNotificacion
  etiqueta: string
  descripcion: string
  /** Token de color, ej. `var(--chart-2)` */
  color: string
  activo: boolean
}
