import { ApiClient } from "@lib/http/client"
import { env } from "@config/env"

// Todas las instancias nombradas — los services SIEMPRE importan de aquí.
export const api = new ApiClient(env.apiUrl)

/**
 * Wompi, la pasarela contra la que el navegador tokeniza una tarjeta.
 *
 * **Son dos instancias fijas y no una variable de entorno**: cuál se usa lo dice
 * el `ambiente` que responde `GET /suscripcion/medio-pago/configuracion`, porque
 * quién cobra en cada país lo decide la api y no el despliegue de este repo. La
 * llave pública tampoco se cablea aquí — llega en esa misma respuesta y viaja
 * como cabecera de cada petición.
 *
 * `withCredentials: false` es obligatorio, no una preferencia: la api pública de
 * Wompi responde `Access-Control-Allow-Origin: *`, y el navegador descarta una
 * respuesta con comodín cuando la petición lleva credenciales. Además, la cookie
 * de sesión de Barion no tiene nada que hacer en el dominio de un tercero.
 *
 * El número de tarjeta viaja por AQUÍ y jamás por `api`.
 */
export const wompiSandbox = new ApiClient("https://sandbox.wompi.co/v1", {
  withCredentials: false,
})

export const wompiProduccion = new ApiClient("https://production.wompi.co/v1", {
  withCredentials: false,
})
