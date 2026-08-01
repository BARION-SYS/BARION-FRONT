/**
 * Aritmética de fechas LOCALES (`YYYY-MM-DD`), sin instantes.
 *
 * La semana que se pinta es la de la SEDE, no la del navegador: agrupar por el
 * día de quien mira correría la agenda entera en cuanto la barbería opere en
 * otro huso. Por eso aquí no hay `Date` con hora — solo días — y el cruce con
 * los instantes lo hace `useFormato().fechaClave`.
 */

const DIA_MS = 86_400_000

export function hoyLocal(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date())
}

export function sumarDias(fecha: string, dias: number): string {
  return new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * DIA_MS)
    .toISOString()
    .slice(0, 10)
}

/**
 * Las siete fechas de la semana que contiene `ancla`.
 *
 * `inicioSemana` sale de la sede (1 lunes, 0 domingo): en Bogotá y Madrid la
 * semana empieza el lunes y en EE. UU. el domingo, y ver la propia empezando
 * en otro día desorienta a quien lleva veinte años mirándola así.
 */
export function semanaDe(ancla: string, inicioSemana: number): string[] {
  const diaSemana = new Date(`${ancla}T00:00:00Z`).getUTCDay()
  const desplazamiento = (diaSemana - inicioSemana + 7) % 7
  const primera = sumarDias(ancla, -desplazamiento)
  return Array.from({ length: 7 }, (_, indice) => sumarDias(primera, indice))
}

/**
 * La ventana en instantes que hay que pedirle a la api para cubrir esos días.
 *
 * Va con un día de margen a cada lado a propósito: la ventana se calcula sin
 * saber el huso de la sede, y sin holgura se perderían las citas de los bordes.
 * Lo que sobra se descarta al pintar, comparando por fecha local.
 */
export function ventanaDe(fechas: string[]): { desde: string; hasta: string } {
  return {
    desde: `${sumarDias(fechas[0], -1)}T00:00:00.000Z`,
    hasta: `${sumarDias(fechas[fechas.length - 1], 2)}T00:00:00.000Z`,
  }
}
