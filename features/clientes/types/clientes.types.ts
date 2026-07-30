export type EtiquetaCliente = "VIP" | "Frecuente" | "Regular" | "Nuevo"

export type FiltroEtiqueta = EtiquetaCliente | "Todos"

export interface Cliente {
  id: number
  nombre: string
  iniciales: string
  telefono: string
  correo: string
  barberoFavorito: string
  visitas: number
  /** Instante UTC ISO-8601. */
  ultimaVisitaEn: string
  /** Acumulado gastado (mock; al integrar la API: centavos + moneda ISO) */
  gastadoTotal: number
  etiqueta: EtiquetaCliente
}

export interface ServicioHistorial {
  /** Instante UTC ISO-8601. */
  iniciaEn: string
  servicio: string
  barbero: string
  precio: string
}

export interface ResumenClientes {
  totalClientes: number
  nuevosHoy: number
}
