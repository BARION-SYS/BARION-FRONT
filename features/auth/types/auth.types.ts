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

/**
 * `codigo` es lo que se compara en el código; `nombre` lo que se pinta. El
 * código NO es lista cerrada: además de los de sistema (propietario,
 * administrador, recepcion, barbero) una barbería puede definir los suyos.
 */
export interface RolSesion {
  codigo: string
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
  esStaffPlataforma: boolean
}
