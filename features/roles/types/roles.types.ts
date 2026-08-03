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
 * Qué relación tiene un rol con la agenda. **Lo decide el rol**, no quien da de
 * alta, y llega en el contrato para que el formulario no tenga que saberse los
 * códigos de memoria.
 *
 * `siempre` = atiende y no se puede desmarcar (el rol `barbero`: sus permisos
 * son sobre «lo suyo» y sin ficha no hay agenda que lo sea) · `opcional` = elige
 * (el propietario que corta, y el que solo administra) · `nunca` = no tiene
 * agenda, y pedirla responde 422.
 */
export type RelacionConAgenda = "siempre" | "opcional" | "nunca"

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
  agenda: RelacionConAgenda
}

/**
 * Excepción de UNA persona, con signo. `concedido: false` es una REVOCACIÓN y
 * gana sobre lo que trae su rol.
 */
export interface ExcepcionPermiso {
  permiso: string
  concedido: boolean
}
