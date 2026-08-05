"use client"

import { useSyncExternalStore } from "react"

/** No hay nada a qué suscribirse: el valor cambia una vez y no vuelve. */
const sinSuscripcion = () => () => {}

/**
 * `false` en el servidor y en el primer render del cliente, `true` a partir de
 * la hidratación.
 *
 * Lo necesita todo lo que depende del navegador —el tema resuelto, el dominio
 * por el que se entró—: pintarlo en el primer render deja un marcado distinto
 * al del servidor y React descarta la hidratación entera.
 *
 * No es `useState` + `useEffect`: escribir estado dentro de un efecto encadena
 * un render extra en cada montaje. `useSyncExternalStore` da el mismo salto en
 * un solo paso, que es para lo que existe.
 */
export function useMontado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false
  )
}
