// Tipos ESPEJO del contrato de la API (`POST /auth/login`, `GET /auth/yo`),
// mantenidos a mano contra su Swagger — no se comparte código entre repos.
//
// No hay token: la sesión viaja en una cookie httpOnly que este código no puede
// leer, y ese es justamente el punto — un token en localStorage queda expuesto a
// cualquier script que entre en la página.

export type RolMembresia = "propietario" | "administrador" | "recepcion" | "barbero"

export interface BarberiaSesion {
  id: string
  slug: string
  nombreComercial: string
}

/** Lo que devuelve `POST /auth/login`. */
export interface Sesion {
  usuarioId: string
  email: string | null
  barberia: BarberiaSesion
  membresiaId: string
  rol: RolMembresia
  sedeId: string | null
  permisos: string[]
}

/**
 * Lo que devuelve `GET /auth/yo`. Se reconstruye desde el token, que solo lleva
 * el id de la barbería: slug y nombre comercial no viajan en el JWT porque son
 * datos editables y la sesión seguiría siendo válida con el valor viejo.
 */
export interface SesionActual extends Omit<Sesion, "barberia"> {
  barberia: { id: string }
}
