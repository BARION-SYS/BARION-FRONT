import type { EstadoCita } from "@features/citas/types/citas.types"
import type { EtiquetaCliente } from "@features/clientes/types/clientes.types"

/** Horario de apertura de un día, hora local de la sede (HH:mm). */
export interface HorarioPortal {
  dia: string
  abierto: boolean
  apertura: string
  cierre: string
}

/** Ficha pública de la barbería que se muestra en /b/[slug]. */
export interface BarberiaPortal {
  slug: string
  nombre: string
  eslogan: string
  descripcion: string
  iniciales: string
  direccion: string
  ciudad: string
  telefono: string
  calificacion: number
  resenas: number
  /** Color primario del tenant (hex) — el portal lo aplica al montar */
  colorMarca: string
  /** Color de fondo del tenant (hex) */
  colorFondo: string
  abiertoAhora: boolean
  /** Horario de hoy ya resumido, ej. "09:00 – 20:00" */
  horarioHoy: string
  horarios: HorarioPortal[]
  ventajas: string[]
}

export interface ServicioPortal {
  id: number
  nombre: string
  descripcion: string
  /** Precio en unidad menor de la moneda del tenant */
  precio: number
  duracionMin: number
  popular?: boolean
}

/** Barbero elegible en el portal. `id: 0` = cualquiera disponible. */
export interface BarberoPortal {
  id: number
  nombre: string
  rol: string
  iniciales: string
  /** Token de gráfica, ej. `var(--chart-1)` */
  color: string
  calificacion: number
  resenas: number
  especialidades: string[]
  /** Próximo cupo ya resumido, ej. "Hoy 15:30" */
  proximoCupo: string
}

export interface FranjaAgenda {
  /** Inicio de la franja en UTC (ISO 8601) */
  inicio: string
  disponible: boolean
}

export interface DiaAgenda {
  /** Medianoche local de la sede, expresada en UTC (ISO 8601) */
  fecha: string
  cupos: number
  franjas: FranjaAgenda[]
}

/** Pasos del flujo público de reserva. */
export type PasoReserva = "servicio" | "barbero" | "agenda" | "datos" | "codigo" | "listo"

/** Una línea de la reserva: N servicios por cita, no uno — cada uno con su precio y duración. */
export interface LineaServicioPortal {
  servicioId: number
  nombre: string
  precio: number
  duracionMin: number
}

export interface ReservaConfirmada {
  codigo: string
  /** Inicio de la cita en UTC (ISO 8601) */
  inicio: string
  lineasServicio: LineaServicioPortal[]
  barbero: string
  cliente: string
}

/** Cita del cliente en su área "Mis citas" — reusa los estados del feat citas. */
export interface CitaCliente {
  id: number
  codigo: string
  inicio: string
  lineasServicio: LineaServicioPortal[]
  barbero: string
  estado: EstadoCita
}

/**
 * Cliente registrado en la barbería desde el portal. El alta pública es la que
 * alimenta el módulo de clientes del panel: sin ella el dashboard no tiene base.
 */
export interface ClientePortal {
  id: number
  nombre: string
  iniciales: string
  telefono: string
  correo?: string
  barberoFavorito?: string
  etiqueta: EtiquetaCliente
  /** Fecha de alta en UTC (ISO 8601) */
  desde: string
}

/** Filtros del listado de citas del cliente. */
export interface FiltrosCitasCliente {
  telefono: string
}
