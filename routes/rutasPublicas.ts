import { env } from "@config/env"

/**
 * Rutas públicas de ESTA aplicación. Fuente única, igual que `rutasDashboard`
 * para el panel: un CTA que apunta a una ruta inexistente manda al 404 y se lee
 * como un sitio roto, y ese fallo solo se evita teniendo un sitio donde mirarlas.
 */
export const rutasPublicas = {
  entrar: "/entrar",
  registro: "/registro",
} as const

/**
 * La página de venta NO vive aquí: es otro repo y otro despliegue
 * (`BARION-WEB`). Por eso es una URL absoluta y se navega con `<a>` y no con
 * `next/link` — no hay ruta de esta aplicación que prefetchear.
 */
export const rutasWeb = {
  inicio: env.landingUrl,
  /**
   * Los tres documentos legales se publican en el SITIO, no aquí, y por dos
   * razones que empujan igual: se leen antes de tener cuenta —quien todavía no
   * se ha registrado no puede entrar al panel a leer los términos— y tienen que
   * poder indexarse, que es lo contrario de lo que hace esta aplicación con todo
   * lo suyo.
   *
   * Con `new URL` y no concatenando: `NEXT_PUBLIC_LANDING_URL` puede venir con
   * barra final, y dos barras seguidas dan una dirección que no resuelve — desde
   * la casilla del alta, que es el peor sitio donde tener un enlace roto.
   */
  terminos: new URL("/legal/terminos", env.landingUrl).toString(),
  privacidad: new URL("/legal/privacidad", env.landingUrl).toString(),
  cookies: new URL("/legal/cookies", env.landingUrl).toString(),
} as const
