"use client"

import { monedas, type CodigoMoneda } from "@config/regiones"
import { useTenant } from "@shared/providers/TenantProvider"
import { useSedeActual } from "@store/sede.store"
import { formatMoney } from "@shared/utils/currency"
import {
  formatDate,
  formatDateTime,
  formatRelative,
  formatShortDate,
  formatTime,
  formatWeekday,
  formatWeekdayShort,
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
  const { locale } = tenant

  return {
    dinero: (centavos: number) => formatMoney(centavos, moneda, locale),
    hora: (valor: string | Date) => formatTime(valor, timezone, locale),
    fecha: (valor: string | Date) => formatDate(valor, timezone, locale),
    fechaCorta: (valor: string | Date) => formatShortDate(valor, timezone, locale),
    fechaHora: (valor: string | Date) => formatDateTime(valor, timezone, locale),
    diaSemana: (valor: string | Date) => formatWeekday(valor, timezone, locale),
    diaSemanaCorto: (valor: string | Date) => formatWeekdayShort(valor, timezone, locale),
    relativo: (valor: string | Date) => formatRelative(valor, locale),
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
