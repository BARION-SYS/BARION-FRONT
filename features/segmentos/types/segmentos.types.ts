/**
 * El catálogo de etiquetas de la barbería.
 *
 * `Segmento` NO se declara aquí: vive en `clientes`, que es el feat dueño del
 * dominio —la etiqueta viaja resuelta dentro de cada ficha— y duplicar la forma
 * sería tener dos verdades sobre la misma fila. Esta feature es la pantalla que
 * lo administra, y para eso solo necesita añadir sus filtros.
 */
import type { Segmento } from "@features/clientes/types/clientes.types"

export type { Segmento }

export interface FiltrosSegmentos {
  soloActivos?: boolean
  soloEtiquetas?: boolean
  paginar?: boolean
  page?: number
  limit?: number
}
