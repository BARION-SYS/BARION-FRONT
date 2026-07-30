// Tipos ESPEJO del contrato de la API (`GET /auth/me`), mantenidos a mano
// contra su Swagger — no se comparte código entre repos.
//
// No hay token: la sesión viaja en una cookie httpOnly que este código no puede
// leer, y ese es justamente el punto — un token en localStorage queda expuesto a
// cualquier script que entre en la página.
//
// Hay UNA sola forma de sesión y sale de `/auth/me`. El login no aporta ninguna:
// devuelve un cuerpo que este front ignora a propósito, porque es la foto del
// instante de entrar y lo que el panel necesita es el estado de ahora.

export interface BarberiaSesion {
  id: string
  slug: string
  nombreComercial: string
}

/** Los cuatro roles del sistema. Los define Barion; una barbería no crea los suyos. */
export type CodigoRol = "propietario" | "administrador" | "recepcion" | "barbero"

/**
 * `codigo` es estable y `nombre` es lo que se pinta.
 *
 * Que la lista sea cerrada NO autoriza a comparar contra ella: lo que decide si
 * una acción se ofrece es `permisos`, porque encima del rol van las concesiones
 * y las revocaciones de esa persona. `rol.codigo === "administrador"` deja fuera
 * al administrador al que le quitaron algo. Para eso está `puede()`.
 */
export interface RolSesion {
  codigo: CodigoRol
  nombre: string
}

/**
 * Lo que devuelve `GET /auth/me`.
 *
 * `barberia` y `rol` son null en una sesión de staff de plataforma: ese actor no
 * pertenece a ninguna barbería, y distinguirlo es lo que permite decidir qué
 * panel pintar. `usuario.nombre` es el de la MEMBRESÍA —el nombre con el que esa
 * barbería conoce a la persona—, así que también es null para plataforma.
 */
/**
 * Qué actor es. Decide qué APP se pinta; `permisos` decide qué acciones se ven
 * dentro de ella.
 *
 * `staff` opera en una barbería con membresía. `plataforma` no pertenece a
 * ninguna. `cliente` sí tiene barbería pero no membresía, y llega con
 * `permisos: []` — lo que lo habilita es su tipo, no una capacidad.
 */
export type TipoSesion = "staff" | "cliente" | "plataforma"

export interface Sesion {
  usuario: {
    id: string
    nombre: string | null
    email: string | null
  }
  barberia: BarberiaSesion | null
  membresiaId: string | null
  rol: RolSesion | null
  sedeId: string | null
  permisos: string[]
  tipo: TipoSesion
  esStaffPlataforma: boolean
}

/** Una de las barberías entre las que hay que elegir al entrar. */
export interface BarberiaParaElegir {
  id: string
  slug: string
  nombreComercial: string
}

/**
 * Lo que devuelve el login, que no siempre es una sesión.
 *
 * Se entra por la puerta de una barbería —`/b/{slug}/entrar`— y no hay nada que
 * elegir. Por la puerta global sí puede haberlo: quien trabaja en varias tiene
 * que decir en cuál, y hasta entonces no hay cookie.
 *
 * De aquí se consume ÚNICAMENTE el discriminante y, si toca, la lista. La
 * `sesion` que viene dentro se ignora igual que antes: es la foto del instante
 * de entrar, y la verdad de la sesión sigue saliendo de `/auth/me`.
 */
export type ResultadoLogin =
  { requiereSeleccion: false } | { requiereSeleccion: true; barberias: BarberiaParaElegir[] }
