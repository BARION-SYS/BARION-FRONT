import { Bell, Clock, DollarSign, Palette, Shield, Store } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import datos from "@features/configuracion/constants/configuracion.json"
import {
  esquemaGeneral,
  esquemaHorarios,
  esquemaSeguridad,
  esquemaServicio,
  type DatosGeneral,
  type DatosHorarios,
  type DatosSeguridad,
  type DatosServicio,
} from "@features/configuracion/schemas/configuracion.schema"
import type {
  Barberia,
  HorarioDia,
  InfoCanalNotificacion,
  SeccionConfiguracion,
  Servicio,
} from "@features/configuracion/types/configuracion.types"
import type { ApiResult } from "@shared/types/api.types"

// Capa mock — al integrar, cada método reemplaza su cuerpo por api.get/put(...) de @lib/http/instances.

function ok<T>(data: T, message = "ok"): ApiResult<T> {
  return { data, status: 200, message, pagination: null }
}

// Los íconos no son serializables: en el JSON viajan como nombre string y aquí se resuelven al componente real.
const iconosSeccion: Record<string, LucideIcon> = {
  Bell,
  Clock,
  DollarSign,
  Palette,
  Shield,
  Store,
}

// Copia mutable en memoria del catálogo — simula la persistencia hasta integrar la API.
let servicios: Servicio[] = (datos.servicios as Servicio[]).map((servicio) => ({ ...servicio }))

export const configuracionService = {
  async obtenerSecciones(): Promise<ApiResult<SeccionConfiguracion[]>> {
    return ok(
      datos.secciones.map(
        (seccion): SeccionConfiguracion =>
          ({ ...seccion, icono: iconosSeccion[seccion.icono] }) as SeccionConfiguracion
      )
    )
  },

  async obtenerBarberia(): Promise<ApiResult<Barberia>> {
    return ok(datos.barberia as Barberia)
  },

  // Presets de tema del tenant: el hex aquí es dato, no color de UI.
  async obtenerColoresPreset(): Promise<ApiResult<string[]>> {
    return ok(datos.coloresPreset as string[])
  },

  async obtenerHorarios(): Promise<ApiResult<HorarioDia[]>> {
    return ok(datos.horarios as HorarioDia[])
  },

  async obtenerCanales(): Promise<ApiResult<InfoCanalNotificacion[]>> {
    return ok(datos.canales as InfoCanalNotificacion[])
  },

  async obtenerServicios(): Promise<ApiResult<Servicio[]>> {
    return ok([...servicios])
  },

  // Mock — al integrar: PUT /v1/settings/general.
  async guardarGeneral(payload: DatosGeneral): Promise<ApiResult<null>> {
    esquemaGeneral.parse(payload)
    return ok(null, "Información de la barbería guardada")
  },

  // Mock — al integrar: PUT /v1/settings/hours.
  async guardarHorarios(payload: DatosHorarios): Promise<ApiResult<null>> {
    esquemaHorarios.parse(payload)
    return ok(null, "Horarios de apertura guardados")
  },

  // Mock — al integrar: POST /v1/auth/change-password.
  async actualizarContrasena(payload: DatosSeguridad): Promise<ApiResult<null>> {
    esquemaSeguridad.parse(payload)
    return ok(null, "Contraseña actualizada correctamente")
  },

  // Mock — al integrar: POST /v1/settings/services.
  async crearServicio(payload: DatosServicio): Promise<ApiResult<null>> {
    const datosServicio = esquemaServicio.parse(payload)
    const id = servicios.reduce((max, servicio) => Math.max(max, servicio.id), 0) + 1
    servicios = [...servicios, { id, ...datosServicio }]
    return ok(null, "Servicio agregado")
  },

  // Mock — al integrar: PUT /v1/settings/services/:id.
  async actualizarServicio(id: number, payload: DatosServicio): Promise<ApiResult<null>> {
    const datosServicio = esquemaServicio.parse(payload)
    servicios = servicios.map((servicio) =>
      servicio.id === id ? { ...servicio, ...datosServicio } : servicio
    )
    return ok(null, "Servicio actualizado")
  },

  // Mock — al integrar: DELETE /v1/settings/services/:id.
  async eliminarServicio(id: number): Promise<ApiResult<null>> {
    servicios = servicios.filter((servicio) => servicio.id !== id)
    return ok(null, "Servicio eliminado")
  },
}
