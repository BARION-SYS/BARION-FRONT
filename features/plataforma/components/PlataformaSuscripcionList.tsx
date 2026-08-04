"use client"

import { ChevronLeft, ChevronRight, CreditCard, Pencil } from "lucide-react"
import { Button } from "@shared/components/ui/button"
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
import { configEstadoSuscripcion } from "@features/plataforma/utils/suscripciones"
import type { SuscripcionPlataforma } from "@features/plataforma/types/plataforma.types"
import type { PaginationInfo } from "@shared/types/api.types"

interface PlataformaSuscripcionListProps {
  suscripciones: SuscripcionPlataforma[]
  loading: boolean
  /** Sin `plataforma.suscripciones.gestionar` no hay nada que corregir. */
  gestiona: boolean
  paginacion: PaginationInfo | null
  onCorregir: (suscripcion: SuscripcionPlataforma) => void
  onPagina: (pagina: number) => void
}

/**
 * Qué tiene contratado cada barbería.
 *
 * **No lleva precio, y no es un olvido**: lo que una barbería paga es lo que
 * pactó al contratar —vive en la pasarela y en las facturas emitidas—, no la
 * tarifa publicada hoy. Pintar la de hoy como «lo que paga» mentiría.
 *
 * La columna que importa es `vigenteHasta`: el fin de la prueba mientras dura y
 * el del período contratado después. Es el mismo número que ve la barbería en su
 * panel, para que soporte y cliente miren lo mismo.
 */
export function PlataformaSuscripcionList({
  suscripciones,
  loading,
  gestiona,
  paginacion,
  onCorregir,
  onPagina,
}: PlataformaSuscripcionListProps) {
  const { fechaCorta, numero } = useFormato()

  return (
    <Loadable
      loading={loading}
      isEmpty={suscripciones.length === 0}
      variant="table"
      emptyState={
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <CreditCard className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">Ninguna suscripción coincide</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Prueba con otro texto o quita los filtros. Cada barbería tiene una desde que se da de
            alta.
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
              <TableHead className="hidden text-right sm:table-cell">Vigente hasta</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Gracia</TableHead>
              <TableHead className="hidden lg:table-cell">Renovación</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {suscripciones.map((suscripcion) => {
              const estado = configEstadoSuscripcion(suscripcion.estado)
              return (
                <TableRow key={suscripcion.id} className="transition-colors hover:bg-secondary/40">
                  <TableCell>
                    <span className="flex min-w-0 items-center gap-3">
                      <InitialsAvatar
                        iniciales={inicialesDe(suscripcion.barberia.nombreComercial)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {suscripcion.barberia.nombreComercial}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          /{suscripcion.barberia.slug}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="flex flex-col">
                      <span>{suscripcion.plan.nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {suscripcion.plan.codigo}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums sm:table-cell">
                    {/* Un guion, nunca una fecha inventada: una cancelada no vence. */}
                    {suscripcion.vigenteHasta ? fechaCorta(suscripcion.vigenteHasta) : "—"}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums lg:table-cell">
                    {numero(suscripcion.graciaDias)} d
                  </TableCell>
                  <TableCell className="hidden text-xs lg:table-cell">
                    {suscripcion.cancelaAlFinPeriodo ? (
                      <span className="text-(--advertencia)">Baja al fin del período</span>
                    ) : (
                      <span className="text-muted-foreground">Se renueva</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {gestiona && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCorregir(suscripcion)}
                        aria-label={`Corregir la suscripción de ${suscripcion.barberia.nombreComercial}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                    )}
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
          aria-label="Páginas de suscripciones"
        >
          <p className="text-xs text-muted-foreground tabular-nums">
            Página {numero(paginacion.page)} de {numero(paginacion.totalPages)} ·{" "}
            {numero(paginacion.total)} suscripciones
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
