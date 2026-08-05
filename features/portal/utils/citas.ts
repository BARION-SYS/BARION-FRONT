import type { Cita } from "@features/portal/types/portal.types"

/**
 * El orden en que un CLIENTE quiere ver sus citas: lo que le queda por delante
 * primero, y su historial después, de lo más reciente a lo más antiguo.
 *
 * La api las devuelve por `iniciaEn` ascendente, que es el orden de una agenda:
 * quien lleva dos años viniendo abre «Mis citas» y lo primero que ve es un corte
 * de 2024, con lo que acaba de reservar al final de la lista. Para el panel ese
 * orden es el correcto; para quien viene a mirar su próxima cita, no.
 *
 * Se ordena aquí y no en la api porque es una decisión de ESTA pantalla: el mismo
 * endpoint alimenta al panel, que sí quiere la agenda en orden natural.
 */
export function ordenarCitasCliente(citas: Cita[], ahora: string): Cita[] {
  const proximas = citas.filter((cita) => cita.iniciaEn >= ahora)
  const pasadas = citas.filter((cita) => cita.iniciaEn < ahora)

  return [
    ...proximas.sort((a, b) => a.iniciaEn.localeCompare(b.iniciaEn)),
    ...pasadas.sort((a, b) => b.iniciaEn.localeCompare(a.iniciaEn)),
  ]
}
