// Tipos ESPEJO del contrato de la API (`/equipo/roles`, `/equipo/permisos`).

/**
 * Una capacidad del catálogo. `familia` viene calculada por la API para que la
 * matriz agrupe sin partir cadenas — y sin que las dos formas de agrupar acaben
 * discrepando.
 */
export interface Permiso {
  clave: string
  familia: string
}

/**
 * Un rol. Los define Barion y son los mismos en todas las barberías: se leen y
 * se asignan, pero no se crean ni se editan desde el panel. Lo que cada barbería
 * ajusta son las excepciones por persona.
 */
export interface Rol {
  id: string
  /** Estable: es lo que compara el código y lo que viaja en la sesión. */
  codigo: string
  nombre: string
  /** Hoy siempre `true`: todos los roles son de Barion. */
  esSistema: boolean
  orden: number
  permisos: string[]
}

/**
 * Excepción de UNA persona, con signo. `concedido: false` es una REVOCACIÓN y
 * gana sobre lo que trae su rol.
 */
export interface ExcepcionPermiso {
  permiso: string
  concedido: boolean
}
