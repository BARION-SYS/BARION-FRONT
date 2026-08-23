"use client"

import { monedas, type CodigoMoneda } from "@config/regiones"
import { useTenant } from "@shared/providers/TenantProvider"
import { useIdioma } from "@shared/textos/useTextos"
import { useSedeActual } from "@store/sede.store"
import { formatMoney, toMajorUnits, toMinorUnits } from "@shared/utils/currency"
import {
  fechaClave,
  formatDate,
  formatDateTime,
  formatRelative,
  formatShortDate,
  formatTime,
  formatWeekday,
  formatWeekdayShort,
  minutosLocales,
} from "@shared/utils/datetime"
import { formatCompact, formatNumber, formatPercent } from "@shared/utils/numbers"

/**
 * Ata los formateadores puros de shared/utils a la sede activa, no a la
 * barbería: la timezone es de la sede (`Sede.zonaHoraria`), y la moneda
 * también, cuando la sede la fija — `null` hereda la de la barbería. Sin sede
 * seleccionada (recién creada la barbería, o mientras carga) cae a la config
 * regional del tenant para no dejar la pantalla sin formatear.
 *
 * Uso en componentes: const { dinero, hora } = useFormato()
 */
export function useFormato() {
  const tenant = useTenant()
  const sede = useSedeActual()
  const timezone = sede?.zonaHoraria ?? tenant.timezone
  const moneda = monedaValida(sede?.moneda) ?? tenant.moneda
  // El locale de formateo es el IDIOMA activo, no el de la región: quien pone
  // el panel en inglés espera leer también las fechas en inglés, y dejar el
  // texto en un idioma y los meses en otro es peor que no traducir.
  const locale = useIdioma()

  return {
    dinero: (centavos: number) => formatMoney(centavos, moneda, locale),
    /**
     * Dinero en una moneda que NO es la de la sede.
     *
     * La necesita lo que se cotiza por país y no por tenant —el catálogo de
     * planes—: pintar un precio en euros con el símbolo de pesos no es un
     * detalle de formato, es decir otra cifra.
     */
    dineroEn: (centavos: number, codigoMoneda: string) =>
      formatMoney(centavos, codigoMoneda, locale),
    /** Lo que se escribe en un formulario → lo que la API acepta. */
    aCentavos: (monto: number) => String(toMinorUnits(monto, moneda)),
    /** Centavos de la API → el número que se precarga en el formulario. */
    deCentavos: (centavos: number) => toMajorUnits(centavos, moneda),
    moneda,
    hora: (valor: string | Date) => formatTime(valor, timezone, locale),
    fecha: (valor: string | Date) => formatDate(valor, timezone, locale),
    fechaCorta: (valor: string | Date) => formatShortDate(valor, timezone, locale),
    fechaHora: (valor: string | Date) => formatDateTime(valor, timezone, locale),
    diaSemana: (valor: string | Date) => formatWeekday(valor, timezone, locale),
    diaSemanaCorto: (valor: string | Date) => formatWeekdayShort(valor, timezone, locale),
    relativo: (valor: string | Date) => formatRelative(valor, locale),
    /** `YYYY-MM-DD` en hora de la sede: la clave con la que se agrupa la agenda. */
    fechaClave: (valor: string | Date) => fechaClave(valor, timezone),
    /** Minutos desde medianoche local: lo que posiciona una cita en la grilla. */
    minutosLocales: (valor: string | Date) => minutosLocales(valor, timezone),
    timezone,
    numero: (valor: number) => formatNumber(valor, locale),
    porcentaje: (valor: number) => formatPercent(valor, locale),
    compacto: (valor: number) => formatCompact(valor, locale),
  }
}

// La API acepta cualquier ISO 4217 en la sede; el front solo sabe formatear las
// de `config/regiones.ts`. Una moneda fuera de esa lista cae al tenant en vez
// de reventar `Intl.NumberFormat`.
function monedaValida(valor: string | null | undefined): CodigoMoneda | null {
  return valor && (monedas as readonly string[]).includes(valor) ? (valor as CodigoMoneda) : null
}
