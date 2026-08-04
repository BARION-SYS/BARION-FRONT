/**
 * Comprobaciones locales de una tarjeta, antes de mandarla a la pasarela.
 *
 * No son seguridad ni sustituyen a nadie: la pasarela valida igual. Existen
 * porque un token es de un solo uso y un viaje a Wompi para que responda «ese
 * número no existe» es un error que se podía dar junto al campo, al instante.
 */

/** Lo que se teclea con espacios o guiones es el mismo número. */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "")
}

/**
 * Dígito de control de Luhn — lo cumplen todas las marcas.
 *
 * Descarta el dedazo de un dígito, que es el error real; no dice nada de si la
 * tarjeta existe ni de si tiene fondos.
 */
export function pasaLuhn(numero: string): boolean {
  let suma = 0
  let doblar = false

  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = Number(numero[i])
    if (doblar) {
      digito *= 2
      if (digito > 9) digito -= 9
    }
    suma += digito
    doblar = !doblar
  }

  return numero.length > 0 && suma % 10 === 0
}

/**
 * Si la tarjeta ya venció, con mes y año de DOS dígitos como los pide Wompi.
 *
 * Una tarjeta vence al TERMINAR su mes, así que el propio mes de expiración
 * todavía sirve. Se compara contra la hora del navegador porque es la única que
 * hay aquí: un desfase de un día no cambia el resultado de una comparación por
 * meses.
 */
export function tarjetaVencida(mes: string, anio: string): boolean {
  const mesNumero = Number(mes)
  const anioNumero = 2000 + Number(anio)
  if (!Number.isInteger(mesNumero) || !Number.isInteger(anioNumero)) return false

  const ahora = new Date()
  const anioActual = ahora.getFullYear()
  const mesActual = ahora.getMonth() + 1

  return anioNumero < anioActual || (anioNumero === anioActual && mesNumero < mesActual)
}
