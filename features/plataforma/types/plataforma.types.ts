// Tipos ESPEJO del contrato de la API (`/plataforma/**` y `/publico/planes`),
// mantenidos a mano contra su Swagger — no se comparte código entre repos.

export type EstadoBarberia = "activa" | "suspendida" | "solo_lectura"

export interface SuscripcionResumen {
  estado: string
  planCodigo: string | null
}

/**
 * Cuánto se usa una barbería. **Conteos, nunca filas.**
 *
 * La API no publica ninguna ruta que devuelva los clientes ni las citas de una
 * barbería al staff de Barion, y no es un hueco: saber cuánta clientela tiene
 * dice si su plan se le queda corto o si lleva tres meses parada; saber quiénes
 * son no responde ninguna pregunta del negocio de Barion.
 *
 * Los acumulados y la ventana de 30 días van juntos porque el total solo no
 * distingue una barbería viva de una muerta: cuatrocientos clientes ganados hace
 * dos años y cuatrocientos con dieciocho nuevos este mes se leen igual.
 */
export interface UsoBarberia {
  clientesTotal: number
  clientesNuevos30d: number
  citasTotal: number
  citas30d: number
  /**
   * Cuándo se CREÓ la última cita, no cuándo ocurre. Es la señal de si alguien
   * sigue abriendo el panel. `null` si nunca hubo ninguna.
   */
  ultimaCitaCreadaEn: string | null
}

/** El propietario, tal como viaja en la fila del inventario. */
export interface PropietarioResumen {
  nombre: string
  email: string | null
}

/**
 * El propietario con su contacto, solo en la ficha.
 *
 * Es la contraparte del contrato con Barion —a quien se le cobra y a quien
 * llama soporte—, no un cliente de la barbería: por eso sale con teléfono
 * mientras que de la clientela solo salen conteos.
 */
export interface PropietarioFicha extends PropietarioResumen {
  telefonoE164: string | null
  ultimoAccesoEn: string | null
  /** Con qué entra. **Vacío = correo y contraseña**, no «sin forma de entrar». */
  proveedores: string[]
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
  uso: UsoBarberia
  /** `null` si no queda ninguna membresía activa de propietario. */
  propietario: PropietarioResumen | null
}

/** La ficha añade lo que no cabe en una fila de tabla. */
export interface BarberiaFicha extends BarberiaInventario {
  monedaPorDefecto: string
  zonaHoraria: string
  membresiasActivas: number
  pruebaTerminaEn: string | null
  propietario: PropietarioFicha | null
}

/**
 * Una cuenta del equipo de Barion.
 *
 * **No tiene nombre, y no falta nada.** El nombre de una persona vive en su
 * membresía —con el que la conoce SU barbería— y este actor no tiene ninguna:
 * existe fuera del multi-tenant. Su identidad es el correo con el que entra.
 *
 * De su contraseña solo se sabe si existe. `proveedores` vacío significa que
 * entra con correo y contraseña, no que no pueda entrar.
 */
export interface StaffPlataforma {
  id: string
  email: string | null
  estado: string
  emailVerificado: boolean
  tieneContrasena: boolean
  debeCambiarContrasena: boolean
  /** Instante UTC ISO-8601. `null` si no ha entrado nunca. */
  ultimoAccesoEn: string | null
  creadoEn: string
  proveedores: string[]
}

/**
 * Lo que devuelve dar de alta o regenerar: la cuenta y su contraseña.
 *
 * **La contraseña llega UNA sola vez.** No se guarda en claro en ningún sitio y
 * no hay ninguna ruta que la consulte: si se pierde, se regenera.
 */
export interface StaffCreado {
  staff: StaffPlataforma
  contrasenaTemporal: string
}

export interface FiltrosInventario {
  estado?: EstadoBarberia
  busqueda?: string
  page?: number
  limit?: number
  /** `false` trae el inventario entero sin paginar — lo que necesita el resumen. */
  paginar?: boolean
}

/**
 * Cada cuánto se cobra una tarifa.
 *
 * Son TRES y se ofrecen a la vez: el semestral y el anual existen para que
 * quien pueda adelantar pague menos, no para sustituir al mensual. Un plan
 * puede tener tarifa en unos y no en otros —el período sin tarifa simplemente
 * no se publica— y **ninguno se calcula a partir de otro**: el descuento por
 * adelantar es una decisión comercial, no una multiplicación.
 */
export type PeriodoTarifa = "mensual" | "semestral" | "anual"

/**
 * Un precio del plan en un país.
 *
 * `montoCentavos` viaja como CADENA porque en la base es `bigint` y en JSON no
 * cabe: se convierte en esta frontera y en ningún otro sitio. `moneda` es un ISO
 * 4217 cualquiera — la API acepta más de las tres que este front sabe formatear.
 */
export interface PrecioPlan {
  codigoPais: string
  montoCentavos: string
  moneda: string
  periodo: string
}

/**
 * Un plan del catálogo comercial.
 *
 * `funciones` son CLAVES —`["agenda","portal"]`—, no frases de venta: en la base
 * son banderas de producto y de ellas depende qué módulo está encendido. Quien
 * las pinta las traduce (`constants/planes.copy.ts` de esta feature).
 *
 * `limites` llega como el jsonb tal cual; `null` en una clave = sin techo.
 */
export interface PlanPlataforma {
  codigo: string
  nombre: string
  limites: Record<string, number | null>
  funciones: string[]
  precios: PrecioPlan[]
}

/**
 * Una tarifa vista desde la ADMINISTRACIÓN, que no es la del sitio de venta.
 *
 * Añade `activo`: aquí llegan también las retiradas, porque retirar una tarifa
 * es reversible y esconderla dejaría a soporte sin manera de volver a
 * publicarla.
 */
export interface PrecioPlanAdmin extends PrecioPlan {
  activo: boolean
}

/**
 * Un plan del catálogo INTERNO (`GET /plataforma/planes`).
 *
 * Otra superficie que `PlanPlataforma`, no un filtro suyo: aquella publica lo
 * que se vende y esta enseña lo que existe —los retirados, las banderas
 * apagadas y las tarifas que ya no se ofrecen—.
 *
 * `funciones` es el objeto CRUDO (`{ agenda: true, campanas: false }`) y no la
 * lista de claves encendidas: quien edita necesita ver las apagadas para poder
 * encenderlas, y una lista de las encendidas no dice cuáles existen.
 */
export interface PlanAdmin {
  id: string
  /** Con lo que se contrata. INMUTABLE: la API no lo acepta en el `PATCH`. */
  codigo: string
  nombre: string
  activo: boolean
  orden: number
  funciones: Record<string, boolean>
  /** `null` en una clave = sin límite. Una clave ausente, también. */
  limites: Record<string, number | null>
  precios: PrecioPlanAdmin[]
  creadoEn: string
  actualizadoEn: string
}

export interface FiltrosPlanes {
  /** Sin valor llegan los publicados **y** los retirados. */
  activo?: boolean
  busqueda?: string
  page?: number
  limit?: number
  paginar?: boolean
}

/** Los cinco valores que admite `suscripciones_estado_check`. */
export type EstadoSuscripcion = "prueba" | "activa" | "mora" | "cancelada" | "sobre_limite"

/**
 * Qué tiene contratado cada barbería, visto por soporte.
 *
 * **No lleva precio, y no es un olvido**: lo que la barbería paga es lo que
 * pactó al contratar, no la tarifa publicada hoy — pintar la de hoy como «lo
 * que paga» mentiría.
 *
 * `id` es el de la SUSCRIPCIÓN y no es lo que va en la URL del `PATCH`: la
 * corrección se direcciona por `barberia.id`, porque hay una suscripción por
 * barbería y así se direcciona todo el módulo.
 */
export interface SuscripcionPlataforma {
  id: string
  barberia: {
    id: string
    slug: string
    nombreComercial: string
    codigoPais: string
    estado: EstadoBarberia
  }
  plan: { codigo: string; nombre: string }
  estado: EstadoSuscripcion
  /** Instantes UTC ISO-8601; `null` cuando no aplican a ese estado. */
  pruebaTerminaEn: string | null
  periodoActualDesde: string | null
  periodoActualHasta: string | null
  /** El campo que hay que pintar: fin de la prueba mientras dura, del período después. */
  vigenteHasta: string | null
  graciaDias: number
  graciaHasta: string | null
  suspendidaEn: string | null
  cancelaAlFinPeriodo: boolean
  canceladaEn: string | null
  creadoEn: string
}

export interface FiltrosSuscripciones {
  estado?: EstadoSuscripcion
  planCodigo?: string
  busqueda?: string
  page?: number
  limit?: number
  paginar?: boolean
}

/** Lo que sale de contar el inventario — no lo calcula la API, lo deriva el front. */
export interface ResumenPlataforma {
  total: number
  porEstado: Record<EstadoBarberia, number>
  sedesActivas: number
  barberosActivos: number
  /** Barberías todavía sin suscripción: son las que nunca se han cobrado. */
  sinSuscripcion: number
  /** Las que están en prueba, según el estado de su suscripción. */
  enPrueba: number
  /** Clientela sumada de todas las barberías: cuánta gente usa Barion por debajo. */
  clientesTotal: number
  clientesNuevos30d: number
  citasTotal: number
  citas30d: number
  /**
   * Las que no crearon **ninguna** cita en 30 días, incluidas las que nunca
   * crearon una. Es el número que dice quién se está yendo antes de que lo diga
   * el impago: una barbería deja de usar Barion meses antes de dejar de pagarlo.
   */
  inactivas30d: number
}

/** Un corte del inventario por una dimensión (estado, plan). */
export interface SegmentoInventario {
  clave: string
  etiqueta: string
  total: number
}

/**
 * El uso de un país. Tres cifras y no una, porque separan preguntas distintas:
 * **cuánto se vendió** ahí (barberías), **cuánta gente hay debajo** (clientes) y
 * **si se está moviendo** (citas de 30 días). Un país con muchas barberías y
 * pocas citas es un problema que un solo número esconde.
 */
export interface UsoPais {
  codigo: string
  nombre: string
  barberias: number
  clientes: number
  citas30d: number
}
