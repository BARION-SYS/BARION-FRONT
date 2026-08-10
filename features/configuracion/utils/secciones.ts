import {
  IDS_SECCION_CONFIGURACION,
  SECCION_POR_DEFECTO,
} from "@features/configuracion/constants/secciones"
import type { IdSeccionConfiguracion } from "@features/configuracion/types/configuracion.types"

/** La raíz de Configuración. Cada apartado es una carpeta suya. */
const RAIZ_CONFIGURACION = "/dashboard/configuracion"

/**
 * Qué apartado se está mirando, según la dirección.
 *
 * Se resuelve por el CAMINO y no por un parámetro porque cada apartado es una
 * ruta de verdad: `/dashboard/configuracion/plan`. Un camino que no corresponde a
 * ninguno cae en el apartado por defecto en vez de dejar la pantalla en blanco —
 * el 404 de una sección inventada lo da el enrutador, aquí solo se decide qué
 * entrada del menú va marcada.
 *
 * Tolera la barra final y la ruta padre: `/dashboard/configuracion` y
 * `/dashboard/configuracion/` son la puerta de entrada, que redirige al apartado
 * por defecto, así que ya conviene enseñarlo marcado.
 */
export function seccionDesdePathname(pathname: string): IdSeccionConfiguracion {
  const sinBarraFinal = pathname.replace(/\/+$/, "")
  const segmento = sinBarraFinal.startsWith(RAIZ_CONFIGURACION)
    ? sinBarraFinal.slice(RAIZ_CONFIGURACION.length + 1)
    : ""

  return IDS_SECCION_CONFIGURACION.find((id) => id === segmento) ?? SECCION_POR_DEFECTO
}

/** La dirección de un apartado, para enlazarlo o para volver a él. */
export function rutaDeSeccion(id: IdSeccionConfiguracion): string {
  return `${RAIZ_CONFIGURACION}/${id}`
}
