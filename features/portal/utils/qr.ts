/**
 * LA MARCA DEL CARTÓN QR — de la URL impresa a la cita.
 *
 * El código del cartón codifica `{portal}/b/{barberia.slug}?qr={sede.slug_qr}`:
 * un parámetro sobre la ruta que ya existe, no una segunda puerta al portal. Al
 * llegar con él se guarda en una cookie y se manda al verificar el código y al
 * reservar, que es lo que deja `clientes.origen` y `citas.origen` en `'qr'`
 * atados a la sede del cartón.
 *
 * ── Por qué una cookie y no la URL ──────────────────────────────────────────
 * Quien escanea hoy y reserva el jueves siguiente **también viene del QR**. La
 * marca tiene que sobrevivir a la sesión, y 30 días es el horizonte de una
 * decisión de barbería —uno se corta el pelo cada tres o cuatro semanas—. Más
 * allá, atribuirle la reserva al cartón es regalarle un mérito que no tuvo.
 *
 * ── Última marca gana ───────────────────────────────────────────────────────
 * Quien escanea el cartón del norte y luego el del sur cuenta como sur: es el
 * último sitio donde estuvo, y encadenar atribuciones exige un modelo de
 * multi-touch que ningún dueño de barbería va a leer.
 *
 * ── Lo que esto NO resuelve, y está decidido ────────────────────────────────
 * Quien rechace cookies o navegue en privado reservará **sin marca** y contará
 * como `'enlace'`. Se prefiere subestimar el QR antes que inflarlo.
 */

import type { SedePortal } from "@features/portal/types/portal.types"

const PARAM_QR = "qr"
const COOKIE_QR = "barion_qr"
const DIAS = 30
const SEGUNDOS = DIAS * 24 * 60 * 60

/** Mismo formato que un slug de sede. Lo que no encaje no se guarda. */
const FORMATO = /^[a-z0-9][a-z0-9-]{0,79}$/i

/**
 * Guarda la marca si la dirección trae `?qr=` y **devuelve la que queda vigente**.
 * Idempotente y silenciosa: sin parámetro no toca nada, y un valor con forma rara
 * se ignora en vez de acabar en una cookie que luego viaja en cada reserva.
 *
 * Devuelve el valor en vez de `void` porque la marca ya no sirve solo para
 * atribuir el origen: **de ella sale la SEDE**, y la sede decide qué carta y qué
 * equipo se piden. Esperar a leerla de la cookie obligaría a una segunda vuelta, y
 * quien tenga las cookies bloqueadas se quedaría sin sede resuelta pese a haber
 * escaneado el cartón — el parámetro de la URL sigue estando ahí.
 */
export function capturarMarcaQr(busqueda: string): string | undefined {
  if (typeof document === "undefined") return undefined

  const valor = new URLSearchParams(busqueda).get(PARAM_QR)?.trim()
  if (!valor || !FORMATO.test(valor)) return marcaQr()

  // `Lax` basta: la marca la pone una navegación de primer nivel desde la cámara
  // del móvil, y nada de esto es una credencial. `Secure` solo donde hay https,
  // o en desarrollo sobre http el navegador descartaría la cookie entera.
  const seguro = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_QR}=${encodeURIComponent(valor)}; Path=/; Max-Age=${SEGUNDOS}; SameSite=Lax${seguro}`

  return valor
}

/**
 * La marca vigente, si la hay. `undefined` es un caso normal —no un fallo—: se
 * reserva igual, sin origen.
 */
export function marcaQr(): string | undefined {
  if (typeof document === "undefined") return undefined

  const entrada = document.cookie.split("; ").find((trozo) => trozo.startsWith(`${COOKIE_QR}=`))
  if (!entrada) return undefined

  const valor = decodeURIComponent(entrada.slice(COOKIE_QR.length + 1))
  return FORMATO.test(valor) ? valor : undefined
}

/**
 * En qué sede está el cliente: la del cartón que escaneó.
 *
 * Es lo que resuelve el caso de varias sedes sin pedirle nada — quien escanea el
 * cartón del centro ya dijo dónde está—. Y hace falta de verdad: la api valida la
 * reserva filtrando los barberos por sede, así que trabajar contra la sede
 * equivocada deja elegir a quien no atiende ahí.
 *
 * Sin marca —o con una de OTRA barbería, que se ignora igual que en la api— cae a
 * la primera sede. Eso es correcto con una sola; con varias es una suposición, y
 * ahí lo que falta es un selector.
 */
export function sedeDeLaMarca(sedes: SedePortal[], marca: string | undefined): SedePortal | null {
  if (marca) {
    const suya = sedes.find((sede) => sede.slugQr === marca)
    if (suya) return suya
  }
  return sedes[0] ?? null
}
