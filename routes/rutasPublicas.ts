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
} as const
