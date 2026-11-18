import { notify } from "@shared/services/notify"
import type { HttpError } from "@shared/types/api.types"

/**
 * Solo lectura de la demo, en el borde del cliente HTTP.
 *
 * La api ya rechaza cualquier escritura de una sesión demo (403 en
 * `PermisosGuard`), y eso es lo que la hace segura. Esto es otra cosa: es lo
 * que la hace AMABLE. Sin cortar aquí, quien recorre la demo rellena un
 * formulario, pulsa guardar, espera la ida y vuelta y recibe un error. Cortando
 * antes de enviar, la respuesta es inmediata y es un aviso, no un fallo.
 *
 * El estado lo pone el chrome del panel (`LayoutDashboard`), que es quien sabe
 * de la sesión, y trae el texto ya traducido: este módulo no conoce idiomas ni
 * stores, para que `lib/http` siga sin depender de ninguna feature.
 *
 * Las únicas escrituras que pasan son las de entrar y salir: sin ellas no se
 * podría cerrar la demo.
 */
const PERMITIDAS = ["/auth/logout", "/auth/demo"]
/** Un toast por ráfaga: un formulario con tres guardados seguidos no apila tres avisos. */
const PAUSA_AVISO_MS = 4000

let activo = false
let mensaje = ""
let ultimoAviso = 0

export function setModoDemo(estado: { activo: boolean; mensaje?: string }): void {
  activo = estado.activo
  mensaje = estado.mensaje ?? ""
}

/** El error con el que se rechaza una escritura en demo, o `null` si puede salir. */
export function rechazoDemo(url: string): HttpError | null {
  if (!activo || PERMITIDAS.some((ruta) => url.startsWith(ruta))) return null
  const ahora = Date.now()
  if (ahora - ultimoAviso > PAUSA_AVISO_MS) {
    ultimoAviso = ahora
    notify.demo(mensaje)
  }
  return { status: 403, message: mensaje, codigo: "demo" }
}
