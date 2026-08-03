"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal, Store } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Loadable } from "@shared/components/feedback/Loadable"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import {
  ESTADO_BARBERIA,
  MOTIVO_TRANSICION,
  TRANSICIONES_ESTADO,
  etiquetaSuscripcion,
  nombreDePais,
} from "@features/plataforma/utils/inventario"
import type {
  BarberiaInventario,
  EstadoBarberia,
} from "@features/plataforma/types/plataforma.types"
import type { PaginationInfo } from "@shared/types/api.types"

interface PlataformaListProps {
  barberias: BarberiaInventario[]
  loading: boolean
  /** Sin `plataforma.barberias.gestionar` no hay estado que cambiar. */
  gestiona: boolean
  /** `null` cuando la lista llegó sin paginar. */
  paginacion: PaginationInfo | null
  onCambiarEstado: (barberia: BarberiaInventario, estado: EstadoBarberia) => void
  onAbrir: (barberia: BarberiaInventario) => void
  onPagina: (pagina: number) => void
}

/**
 * El inventario en una tabla, densa a propósito: quien administra la plataforma
 * compara barberías entre sí, no lee una.
 *
 * La ficha se abre desde el NOMBRE —un botón de verdad, no un `onClick` en el
 * `<tr>`— para que se alcance con el teclado; el cambio de estado vive aparte,
 * porque suspender una barbería no puede ocurrir por pulsar donde uno esperaba
 * consultarla. Las columnas secundarias se pliegan por ancho, nunca se recorta
 * la tabla en horizontal.
 */
export function PlataformaList({
  barberias,
  loading,
  gestiona,
  paginacion,
  onCambiarEstado,
  onAbrir,
  onPagina,
}: PlataformaListProps) {
  const { fechaCorta, numero } = useFormato()

  return (
    <Loadable
      loading={loading}
      isEmpty={barberias.length === 0}
      variant="table"
      emptyState={
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Store className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">Ninguna barbería coincide</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Prueba con otro texto o quita el filtro de estado. Si todavía no has dado de alta
            ninguna, empieza por «Nueva barbería».
          </p>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barbería</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="hidden md:table-cell">País</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Sedes</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Barberos</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Alta</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {barberias.map((barberia) => {
              const estado = ESTADO_BARBERIA[barberia.estado]
              return (
                <TableRow key={barberia.id} className="transition-colors hover:bg-secondary/40">
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onAbrir(barberia)}
                      className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={`Ver la ficha de ${barberia.nombreComercial}`}
                    >
                      <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {barberia.nombreComercial}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          /{barberia.slug}
                        </span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {barberia.suscripcion ? (
                      <span className="flex flex-col">
                        <span className="capitalize">
                          {barberia.suscripcion.planCodigo ?? "Sin plan"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {etiquetaSuscripcion(barberia.suscripcion.estado)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin suscripción</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {nombreDePais(barberia.codigoPais)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums lg:table-cell">
                    {numero(barberia.sedesActivas)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums lg:table-cell">
                    {numero(barberia.barberosActivos)}
                  </TableCell>
                  <TableCell className="hidden text-right text-xs text-muted-foreground tabular-nums sm:table-cell">
                    {fechaCorta(barberia.creadoEn)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones de ${barberia.nombreComercial}`}
                          >
                            <MoreHorizontal aria-hidden />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuItem onClick={() => onAbrir(barberia)}>
                          Ver ficha
                        </DropdownMenuItem>
                        {gestiona && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                            {TRANSICIONES_ESTADO[barberia.estado].map((destino) => (
                              <DropdownMenuItem
                                key={destino}
                                variant={destino === "suspendida" ? "destructive" : "default"}
                                onClick={() => onCambiarEstado(barberia, destino)}
                                className="flex-col items-start gap-0.5"
                              >
                                <span>
                                  Pasar a {ESTADO_BARBERIA[destino].etiqueta.toLowerCase()}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {MOTIVO_TRANSICION[destino]}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {paginacion && paginacion.totalPages > 1 && (
        <nav
          className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4"
          aria-label="Páginas del inventario"
        >
          <p className="text-xs text-muted-foreground tabular-nums">
            Página {numero(paginacion.page)} de {numero(paginacion.totalPages)} ·{" "}
            {numero(paginacion.total)} barberías
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={paginacion.page <= 1}
              onClick={() => onPagina(paginacion.page - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Anterior</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={paginacion.page >= paginacion.totalPages}
              onClick={() => onPagina(paginacion.page + 1)}
            >
              <span className="sr-only sm:not-sr-only">Siguiente</span>
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </nav>
      )}
    </Loadable>
  )
}
