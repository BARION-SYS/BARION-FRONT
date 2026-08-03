/**
 * El enlace que va impreso en el cartón.
 *
 * ```
 * {portal}/b/{barberia.slug}?qr={sede.slugQr}
 * ```
 *
 * **La ruta la manda el `slug` de la BARBERÍA; `slugQr` es solo la marca.** No se
 * construye una dirección a partir de `slugQr` —`/qr/{slugQr}` o similar—: ninguna
 * ruta pública lo resuelve, y publicar esa resolución sería una segunda puerta al
 * portal con su caché, su SEO y su riesgo de enumeración. Un parámetro sobre la
 * ruta que ya existe no añade superficie.
 *
 * El portal vive en esta misma aplicación, así que la base es su propio origen: no
 * hay variable de entorno que configurar ni un segundo despliegue al que apuntar.
 */
export function enlaceDelCarton(origen: string, slugBarberia: string, slugQr: string): string {
  return `${origen}/b/${slugBarberia}?qr=${encodeURIComponent(slugQr)}`
}
