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
  ultimaVisita: string
  /** Acumulado gastado (mock; al integrar la API: centavos + moneda ISO) */
  gastadoTotal: number
  etiqueta: EtiquetaCliente
}

export interface ServicioHistorial {
  fecha: string
  servicio: string
  barbero: string
  precio: string
}

export interface ResumenClientes {
  totalClientes: number
  nuevosHoy: number
}
