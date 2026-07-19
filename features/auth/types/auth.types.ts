export interface Sesion {
  token: string
  usuario: {
    id: string
    nombre: string
    rol: string
    correo: string
  }
}
