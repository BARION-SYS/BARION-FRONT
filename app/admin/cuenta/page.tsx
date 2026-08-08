"use client"

import { Mail, ShieldCheck } from "lucide-react"
import { Seguridad } from "@features/configuracion/components/Seguridad"
import { useAuth } from "@features/auth/hooks/useAuth"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { inicialesDe } from "@shared/utils/iniciales"
import { useAuthStore } from "@store/auth.store"
import type { DatosSeguridad } from "@features/configuracion/schemas/configuracion.schema"

/**
 * La cuenta de quien trabaja en Barion.
 *
 * **Existe porque su ausencia dejaba a este actor sin salida.** El staff de
 * plataforma no tiene barbería, así que `/dashboard/configuracion` —donde vive
 * la seguridad de la cuenta de todo el mundo— no le abre. Consecuencia real: no
 * podía cambiar su contraseña ni conectar su Google, y quien intentaba entrar
 * con el proveedor recibía «entra con tu contraseña y conéctalo desde
 * Configuración → Seguridad», que es una instrucción hacia una pantalla que para
 * él no existe. Un callejón sin salida en la puerta de entrada.
 *
 * **Reutiliza `Seguridad` del panel, entero.** Cambiar la contraseña y vincular
 * un proveedor son la misma operación para los dos actores —`POST
 * /auth/cambiar-contrasena` y `/auth/oauth/google/vincular` solo piden sesión, no
 * barbería—, y una segunda copia sería el sitio donde uno de los dos se quedaría
 * sin el próximo arreglo.
 *
 * No hay nada más que administrar de sí mismo: el nombre y el correo del staff
 * de Barion son credencial de plataforma y no se editan desde aquí.
 */
export default function AdminCuentaPage() {
  // El mismo hook que el panel, y **nunca se llama a `fetchConfiguracion`**: ahí
  // dentro se piden la ficha y la marca de la barbería, que este actor no tiene.
  // Lo que se usa es solo la mutación, que va contra `/auth/cambiar-contrasena`
  // y no pide inquilino ninguno.
  const { handleActualizarContrasena } = useConfiguracion()
  // Desvincular vive en `auth` y no en `configuracion`: toca la sesión y hay que
  // volver a resolverla, o la tarjeta seguiría diciendo «Conectada».
  const { handleDesvincularProveedorAuth, loadingContrasena } = useAuth()
  const sesion = useAuthStore((estado) => estado.sesion)

  const onSubmitSeguridad = async (datos: DatosSeguridad) => {
    try {
      notify.success(await handleActualizarContrasena(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onDesconectar = async (proveedor: string) => {
    try {
      notify.success(await handleDesvincularProveedorAuth(proveedor))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {sesion && (
        <SectionCard titulo="Tu cuenta" subtitulo="Con esto entras a la plataforma">
          {/* El correo va como línea principal, y no es una elección
              estética: el staff de Barion NO tiene nombre en ningún sitio. El
              nombre de una persona vive en su membresía —con el que la conoce SU
              barbería— y este actor no tiene ninguna. Su identidad es su correo
              corporativo, así que enseñar «Sin nombre» en grande sería inventar
              un hueco donde no lo hay. */}
          <div className="flex items-center gap-3">
            <InitialsAvatar iniciales={inicialesDe(sesion.usuario.email ?? "?")} tamano="lg" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                <Mail className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {sesion.usuario.email ?? "Sin correo"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Esta sesión no pertenece a ninguna barbería
              </p>
            </div>
            {/* Con etiqueta y no solo con color: es la señal de que esta sesión
                no pertenece a ninguna barbería, que es lo que la distingue */}
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" aria-hidden />
              Staff de Barion
            </span>
          </div>
        </SectionCard>
      )}

      <Seguridad
        onSubmit={onSubmitSeguridad}
        proveedores={sesion?.usuario.proveedores ?? []}
        onDesconectar={onDesconectar}
        cargandoDesconexion={loadingContrasena}
      />
    </main>
  )
}
