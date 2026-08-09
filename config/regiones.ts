// Regiones donde opera Barion. Agregar un país = agregar una entrada aquí.
// La config real de cada tenant llega de la API; esto define los valores por región.

export type CodigoRegion = "CO" | "US" | "ES"
export type CodigoMoneda = "COP" | "USD" | "EUR"

export interface ConfigRegional {
  moneda: CodigoMoneda
  locale: string
  timezone: string
  /**
   * Indicativo telefónico, con el `+` incluido.
   *
   * La api exige E.164 (`+573001112233`) y eso es correcto —un número sin país
   * no se puede marcar desde fuera—, pero **nadie escribe su teléfono así**: se
   * escribe `3001112233` y el país se sabe. Pedirlo entero era la vía directa al
   * «El teléfono debe estar en formato E.164», que es un mensaje que no
   * significa nada para quien acaba de teclear su número de siempre.
   */
  prefijoTelefonico: string
}

export const regiones: Record<CodigoRegion, ConfigRegional> = {
  CO: {
    moneda: "COP",
    locale: "es-CO",
    timezone: "America/Bogota",
    prefijoTelefonico: "+57",
  },
  US: {
    moneda: "USD",
    locale: "en-US",
    timezone: "America/New_York",
    prefijoTelefonico: "+1",
  },
  ES: {
    moneda: "EUR",
    locale: "es-ES",
    timezone: "Europe/Madrid",
    prefijoTelefonico: "+34",
  },
}

// Región base del producto (Colombia).
export const REGION_DEFAULT: CodigoRegion = "CO"

/**
 * Las monedas que Barion maneja hoy, derivadas de las regiones: agregar un país
 * arriba las actualiza solas. Sirven para que una sede se elija de una lista en
 * vez de teclear tres letras — la API acepta cualquier trío y `MXN` guardado por
 * error no falla hasta que alguien mira un precio.
 */
export const monedas: CodigoMoneda[] = [
  ...new Set(Object.values(regiones).map((region) => region.moneda)),
]

/**
 * El código de país de la api, traducido a una región que este repo conoce.
 *
 * **`barberias.codigo_pais` es un `char(2)` sin lista cerrada**, así que la api
 * puede devolver perfectamente un `MX` que aquí no está declarado — y por eso
 * esto devuelve `undefined` en vez de caer a Colombia. La diferencia importa
 * donde se usa: un indicativo telefónico sugerido en blanco se elige de la lista
 * en un gesto, mientras que uno sugerido MAL se acepta sin mirar y deja un
 * teléfono al que nadie contesta.
 */
export function regionDePais(codigoPais: string | null | undefined): CodigoRegion | undefined {
  if (!codigoPais) return undefined
  const codigo = codigoPais.toUpperCase()
  return codigo in regiones ? (codigo as CodigoRegion) : undefined
}

/** Nombre del país para enseñarlo en un selector — «Colombia», no «CO». */
export const nombresDeRegion: Record<CodigoRegion, string> = {
  CO: "Colombia",
  US: "Estados Unidos",
  ES: "España",
}

/**
 * Los códigos que este repositorio sabe FORMATEAR. No es lo mismo que dónde
 * opera Barion —eso lo dice la api, y por eso son dos listas—: esta cambia
 * cuando se añade soporte de moneda y locale; aquella, cuando se abre un
 * mercado.
 */
export const REGIONES_CONOCIDAS = Object.keys(regiones) as CodigoRegion[]

/**
 * Cruza lo que la api dice que está abierto con lo que este repo sabe pintar.
 *
 * Sin lista de la api (`null`) devuelve todo lo conocido: es preferible ofrecer
 * un país que el alta luego rechace con un 422 explicado, a dejar el selector
 * vacío y que nadie pueda registrarse porque una lectura de catálogo falló.
 */
export function regionesOfrecidas(codigos: string[] | null): CodigoRegion[] {
  if (!codigos) return REGIONES_CONOCIDAS
  const ofrecidas = codigos.filter((codigo): codigo is CodigoRegion => codigo in regiones)
  return ofrecidas.length > 0 ? ofrecidas : REGIONES_CONOCIDAS
}
