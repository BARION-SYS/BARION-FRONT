"use client"

import { Seguridad } from "@features/configuracion/components/Seguridad"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { useAuth } from "@features/auth/hooks/useAuth"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosSeguridad } from "@features/configuracion/schemas/configuracion.schema"

/**
 * La contraseña y los proveedores con los que se entra.
 *
 * No pide nada al montarse: los proveedores vinculados ya viajan en la sesión, y
 * pedirlos otra vez sería una segunda verdad sobre lo mismo.
 */
export default function ConfiguracionSeguridadPage() {
  const { handleActualizarContrasena } = useConfiguracion()
  // Desvincular toca la sesión, así que vive en `auth`: hay que volver a
  // resolverla o la tarjeta seguiría diciendo «Conectada».
  const { handleDesvincularProveedorAuth, loadingContrasena } = useAuth()
  const sesion = useAuthStore((estado) => estado.sesion)

  const onDesconectarProveedor = async (proveedor: string) => {
    try {
      notify.success(await handleDesvincularProveedorAuth(proveedor))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onSubmitSeguridad = async (datos: DatosSeguridad) => {
    try {
      notify.success(await handleActualizarContrasena(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  return (
    <Seguridad
      onSubmit={onSubmitSeguridad}
      proveedores={sesion?.usuario.proveedores ?? []}
      onDesconectar={onDesconectarProveedor}
      cargandoDesconexion={loadingContrasena}
    />
  )
}
