// Tipos ESPEJO del contrato de la API (`/plataforma/**`), mantenidos a mano
// contra su Swagger — no se comparte código entre repos.

export type EstadoBarberia = "activa" | "suspendida" | "solo_lectura"

export interface SuscripcionResumen {
  estado: string
  planCodigo: string | null
}

/** Fila del inventario que ve el staff de Barion. */
export interface BarberiaInventario {
  id: string
  slug: string
  nombreComercial: string
  codigoPais: string
  estado: EstadoBarberia
  /** Instante UTC ISO-8601. El formateo es del cliente. */
  creadoEn: string
  sedesActivas: number
  barberosActivos: number
  /** `null` mientras la barbería no tenga suscripción. */
  suscripcion: SuscripcionResumen | null
}

/** La ficha añade lo que no cabe en una fila de tabla. */
export interface BarberiaFicha extends BarberiaInventario {
  monedaPorDefecto: string
  zonaHoraria: string
  membresiasActivas: number
  pruebaTerminaEn: string | null
}

export interface FiltrosInventario {
  estado?: EstadoBarberia
  busqueda?: string
  page?: number
  limit?: number
}
