"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Store } from "lucide-react"
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
import { AccionesBarberia } from "@features/plataforma/components/AccionesBarberia"
import { PlataformaCard } from "@features/plataforma/components/PlataformaCard"
import { ESTADO_BARBERIA, nombreDePais } from "@features/plataforma/utils/inventario"
import { configEstadoSuscripcion } from "@features/plataforma/utils/suscripciones"
import { PULSO, pulsoDe, variacion } from "@features/plataforma/utils/salud"
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
  onPagina: (pagina: number) => void
}

/**
 * El inventario, denso a propósito: quien administra la plataforma compara
 * barberías entre sí, no lee una.
 *
 * La ficha se abre desde el NOMBRE —un enlace de verdad, que se abre en otra
 * pestaña y se comparte— y el cambio de estado vive en el menú, con
 * confirmación. En móvil la tabla cede el sitio a tarjetas.
 */
export function PlataformaList({
  barberias,
  loading,
  gestiona,
  paginacion,
  onCambiarEstado,
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
      <ul className="flex flex-col gap-3 md:hidden">
        {barberias.map((barberia) => (
          <li key={barberia.id}>
            <PlataformaCard
              barberia={barberia}
              gestiona={gestiona}
              onCambiarEstado={onCambiarEstado}
            />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barbería</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Actividad · 30 d</TableHead>
              <TableHead className="text-right">Clientes</TableHead>
              <TableHead className="hidden lg:table-cell">Plan</TableHead>
              <TableHead className="hidden xl:table-cell">Propietario</TableHead>
              <TableHead className="hidden text-right xl:table-cell">Alta</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {barberias.map((barberia) => {
              const estado = ESTADO_BARBERIA[barberia.estado]
              const suscripcion = barberia.suscripcion
                ? configEstadoSuscripcion(barberia.suscripcion.estado)
                : null
              return (
                <TableRow key={barberia.id} className="transition-colors hover:bg-secondary/40">
                  <TableCell className="max-w-[16rem]">
                    <Link
                      href={`/admin/barberias/${barberia.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <InitialsAvatar iniciales={inicialesDe(barberia.nombreComercial)} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium hover:underline">
                          {barberia.nombreComercial}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          /{barberia.slug} · {nombreDePais(barberia.codigoPais)}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
                  </TableCell>
                  <TableCell>
                    <CeldaActividad barberia={barberia} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="block text-sm">{numero(barberia.uso.clientesTotal)}</span>
                    <span className="block text-xs text-muted-foreground">
                      +{numero(barberia.uso.clientesNuevos30d)} en 30 d
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {suscripcion ? (
                      <span className="flex flex-col items-start gap-1">
                        <span className="text-sm capitalize">
                          {barberia.suscripcion?.planCodigo ?? "Sin plan"}
                        </span>
                        <StatusBadge {...suscripcion} />
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin suscripción</span>
                    )}
                  </TableCell>
                  {/* A quién llama soporte: la contraparte del contrato con Barion */}
                  <TableCell className="hidden max-w-[14rem] xl:table-cell">
                    {barberia.propietario ? (
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{barberia.propietario.nombre}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {barberia.propietario.email ?? "Sin correo"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-(--advertencia)">
                        Sin propietario
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right text-xs text-muted-foreground tabular-nums xl:table-cell">
                    {fechaCorta(barberia.creadoEn)}
                  </TableCell>
                  <TableCell>
                    <AccionesBarberia
                      barberia={barberia}
                      gestiona={gestiona}
                      onCambiarEstado={onCambiarEstado}
                    />
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

/**
 * Las citas de 30 días con su cambio y su pulso. El pulso solo en las activas:
 * una suspendida no agenda porque no puede, y llamarla «dormida» confundiría el
 * impago con el abandono.
 */
function CeldaActividad({ barberia }: { barberia: BarberiaInventario }) {
  const { numero, porcentaje } = useFormato()
  const cambio = variacion(barberia.uso.citas30d, barberia.uso.citas30dPrevios)
  const pulso = PULSO[pulsoDe(barberia)]

  return (
    <span className="flex flex-col items-start gap-1">
      <span className="text-sm tabular-nums">
        {numero(barberia.uso.citas30d)} citas
        {cambio !== null && (
          <span
            className={
              cambio >= 0
                ? "ml-1.5 text-xs text-muted-foreground"
                : "ml-1.5 text-xs text-(--advertencia)"
            }
          >
            {cambio > 0 ? "+" : ""}
            {porcentaje(cambio)}
          </span>
        )}
      </span>
      {barberia.estado === "activa" && (
        <StatusBadge tono={pulso.tono} etiqueta={pulso.etiqueta} icono={pulso.icono} />
      )}
    </span>
  )
}
