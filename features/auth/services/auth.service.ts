import { esquemaLogin, type DatosLogin } from "@features/auth/schemas/auth.schema"
import type { Sesion } from "@features/auth/types/auth.types"
import type { ApiResult } from "@shared/types/api.types"

// Capa mock — al integrar, cada método reemplaza su cuerpo por api.post("/auth/login", ...) de @lib/http/instances.

export const authService = {
  async login(datos: DatosLogin): Promise<ApiResult<Sesion>> {
    const payload = esquemaLogin.parse(datos)
    return {
      data: {
        token: "mock-token",
        usuario: { id: "1", nombre: "Admin", rol: "Propietario", correo: payload.correo },
      },
      status: 200,
      message: "Bienvenido de vuelta",
      pagination: null,
    }
  },
}
