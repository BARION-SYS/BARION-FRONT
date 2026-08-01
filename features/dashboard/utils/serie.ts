/**
 * Lo que hace falta para pintar una serie que la api entrega **cruda**.
 *
 * El rango de lo agregado va en DÍAS (`YYYY-MM-DD`, los dos inclusive) y el de
 * lo transaccional en INSTANTES, con el `hasta` exclusivo. La diferencia la
 * impone la api y aquí no se disimula: son dos funciones distintas.
 */
import { hoyLocal, sumarDias } from "@features/citas/utils/semana"
import type {
  Granularidad,
  Meta,
  PuntoSerie,
  RangoDias,
} from "@features/dashboard/types/dashboard.types"
import { inicioDiaLocal } from "@shared/utils/datetime"

/** El día de hoy en la sede, como rango transaccional. */
export function rangoDeHoy(timezone: string): { desde: string; hasta: string } {
  const hoy = hoyLocal(timezone)
  return {
    desde: inicioDiaLocal(hoy, timezone),
    hasta: inicioDiaLocal(sumarDias(hoy, 1), timezone),
  }
}

/** Los últimos `dias` días, como rango agregado (ambos extremos inclusive). */
export function ultimosDias(
  timezone: string,
  dias: number,
  granularidad?: Granularidad
): RangoDias {
  const hoy = hoyLocal(timezone)
  return { desde: sumarDias(hoy, -(dias - 1)), hasta: hoy, granularidad }
}

/** Lo que va del año, por meses. Es la ventana del comparativo contra la meta. */
export function anioEnCurso(timezone: string): RangoDias {
  const hoy = hoyLocal(timezone)
  return { desde: `${hoy.slice(0, 4)}-01-01`, hasta: hoy, granularidad: "mes" }
}

export interface PuntoGrafica {
  /** Ya formateado para el eje: la gráfica no formatea. */
  etiqueta: string
  ingresos: number
  citas: number
  completadas: number
  canceladas: number
  /** Ocupación del período, 0–100. `null` cuando no se ofreció ni un minuto. */
  ocupacion: number | null
  /** La meta que cubre ese período, si hay alguna. */
  meta: number | null
}

/**
 * Serie de la api → puntos de Recharts. Los centavos pasan a `number` **solo
 * aquí**, en el borde de la gráfica: sumar y comparar se hizo antes en la api.
 */
export function aPuntosGrafica(
  puntos: PuntoSerie[],
  etiquetar: (periodo: string) => string,
  metas: Meta[] = []
): PuntoGrafica[] {
  return puntos.map((punto) => ({
    etiqueta: etiquetar(punto.periodo),
    ingresos: Number(punto.ingresosCentavos),
    citas: punto.reservadas,
    completadas: punto.completadas,
    canceladas: punto.canceladas + punto.noAsistio,
    ocupacion:
      punto.minutosOfrecidos === 0
        ? null
        : Math.round((punto.minutosOcupados / punto.minutosOfrecidos) * 100),
    meta: metaDe(metas, punto.periodo),
  }))
}

/** Totales del rango, para los KPI. Todo en centavos como `number`. */
export function totalesDeSerie(puntos: PuntoSerie[]): {
  ingresos: number
  completadas: number
  canceladas: number
  reservadas: number
  ocupacion: number | null
  cuposRecuperados: number
} {
  const suma = puntos.reduce(
    (acumulado, punto) => ({
      ingresos: acumulado.ingresos + Number(punto.ingresosCentavos),
      completadas: acumulado.completadas + punto.completadas,
      canceladas: acumulado.canceladas + punto.canceladas,
      noAsistio: acumulado.noAsistio + punto.noAsistio,
      reservadas: acumulado.reservadas + punto.reservadas,
      ofrecidos: acumulado.ofrecidos + punto.minutosOfrecidos,
      ocupados: acumulado.ocupados + punto.minutosOcupados,
      cuposRecuperados: acumulado.cuposRecuperados + punto.cuposRecuperados,
    }),
    {
      ingresos: 0,
      completadas: 0,
      canceladas: 0,
      noAsistio: 0,
      reservadas: 0,
      ofrecidos: 0,
      ocupados: 0,
      cuposRecuperados: 0,
    }
  )

  return {
    ingresos: suma.ingresos,
    completadas: suma.completadas,
    canceladas: suma.canceladas + suma.noAsistio,
    reservadas: suma.reservadas,
    ocupacion: suma.ofrecidos === 0 ? null : Math.round((suma.ocupados / suma.ofrecidos) * 100),
    cuposRecuperados: suma.cuposRecuperados,
  }
}

/**
 * La meta que cubre ese período. El cruce lo hace el front a propósito: cuál
 * meta aplica a qué serie depende de lo que la pantalla esté mirando, y
 * resolverlo en la api obligaría a un contrato por cada combinación.
 */
function metaDe(metas: Meta[], periodo: string): number | null {
  const vigente = metas.find((meta) => meta.periodoDesde <= periodo && periodo <= meta.periodoHasta)
  return vigente ? Number(vigente.montoCentavos) : null
}
