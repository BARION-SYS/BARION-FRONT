// Tipos ESPEJO del contrato de la API (`/servicios/**` y
// `/barberos/:id/servicios`), mantenidos a mano contra su Swagger — no se
// comparte código entre repos.
//
// El dinero llega SIEMPRE como cadena de centavos + moneda ISO 4217. Nunca como
// número: en COP se desborda un entero de 32 bits y un `number` de JSON pierde
// precisión. Se formatea con `useFormato().dinero`, nunca a mano.

/** Quién gobierna el servicio. `barbero` = lo propuso quien atiende. */
export type AmbitoServicio = "barberia" | "barbero"

export interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  imagenUrl: string | null
  categoria: string | null
  /** `null` = vale en todas las sedes. */
  sedeId: string | null
  /** Referencia del catálogo. Lo que se cobra vive en la oferta del barbero. */
  precioBaseCentavos: string | null
  moneda: string
  duracionBaseMin: number
  /** Limpieza y preparación: entra en el rango que la cita bloquea. */
  bufferMin: number
  /** Piso y techo que la barbería impone a la oferta. `null` = barbero libre. */
  precioMinCentavos: string | null
  precioMaxCentavos: string | null
  impuestoBps: number | null
  ambito: AmbitoServicio
  creadoPorBarberoId: string | null
  /** `true` + `activo: false` = propuesta esperando aprobación. */
  requiereAprobacion: boolean
  /** Badge comercial. El ranking real lo calcula la api desde las citas. */
  destacado: boolean
  activo: boolean
  orden: number
}

/** Una línea de la oferta: lo que ESE barbero cobra por ESE servicio. */
export interface LineaOferta {
  id: string
  servicioId: string
  /** Del catálogo: es lo que se lee en pantalla y en el portal. */
  nombre: string
  categoria: string | null
  precioCentavos: string
  moneda: string
  duracionMin: number
  bufferMin: number
  /** `false` = ya no lo ofrece. La línea se conserva por el historial. */
  activo: boolean
  orden: number
}

export interface FiltrosServicios {
  soloActivos?: boolean
  /** Devuelve los de esa sede MÁS los que valen en todas. */
  sedeId?: string
  categoria?: string
  buscar?: string
  paginar?: boolean
  page?: number
  limit?: number
}
