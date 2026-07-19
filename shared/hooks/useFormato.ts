"use client"

import { useTenant } from "@shared/providers/TenantProvider"
import { formatMoney } from "@shared/utils/currency"
import {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatTime,
  formatWeekday,
} from "@shared/utils/datetime"
import { formatCompact, formatNumber, formatPercent } from "@shared/utils/numbers"

// Ata los formateadores puros de shared/utils a la config del tenant.
// Uso en componentes: const { dinero, hora } = useFormato()
export function useFormato() {
  const { moneda, locale, timezone } = useTenant()

  return {
    dinero: (centavos: number) => formatMoney(centavos, moneda, locale),
    hora: (valor: string | Date) => formatTime(valor, timezone, locale),
    fecha: (valor: string | Date) => formatDate(valor, timezone, locale),
    fechaCorta: (valor: string | Date) => formatShortDate(valor, timezone, locale),
    fechaHora: (valor: string | Date) => formatDateTime(valor, timezone, locale),
    diaSemana: (valor: string | Date) => formatWeekday(valor, timezone, locale),
    numero: (valor: number) => formatNumber(valor, locale),
    porcentaje: (valor: number) => formatPercent(valor, locale),
    compacto: (valor: number) => formatCompact(valor, locale),
  }
}
