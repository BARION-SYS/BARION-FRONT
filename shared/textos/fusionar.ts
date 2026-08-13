/**
 * Un diccionario escrito como DIFERENCIAS contra otro.
 *
 * Existe por el español de España, que no es otro idioma: es el mismo con un
 * puñado de palabras distintas —«celular» y «móvil», «carro» y «coche»—.
 * Copiarlo entero para cambiar seis frases sería garantizar que las otras
 * seiscientas se separen: la que se corrige en un archivo no se corrige en el
 * otro, y el que se queda viejo es siempre el que menos se abre.
 *
 * Así, el archivo de España enseña **exactamente lo que cambia**, que además es
 * la lista que alguien puede revisar.
 */
export type ParcialProfundo<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends object
      ? ParcialProfundo<T[K]>
      : T[K]
}

/**
 * `base` con `cambios` encima, recorriendo los objetos hacia dentro.
 *
 * Las funciones se sustituyen enteras y no se recorren: una frase con dato
 * adentro es una unidad — media frase traducida no significa nada.
 */
export function fusionar<T extends object>(base: T, cambios: ParcialProfundo<T>): T {
  const resultado = { ...base }

  for (const clave of Object.keys(cambios) as (keyof T)[]) {
    const valor = cambios[clave]
    if (valor === undefined) continue

    const original = base[clave]
    resultado[clave] =
      esObjetoPlano(original) && esObjetoPlano(valor)
        ? (fusionar(original, valor as ParcialProfundo<typeof original>) as T[keyof T])
        : (valor as T[keyof T])
  }

  return resultado
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
}
