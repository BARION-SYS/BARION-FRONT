"use client"

import Link from "next/link"
import { Bell, CalendarClock, Settings2, User, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import { cn } from "@shared/utils/cn"
import { useFormato } from "@shared/hooks/useFormato"
import type {
  GrupoNotificacion,
  Notificacion,
} from "@features/notificaciones/types/notificaciones.types"

interface NotificacionesListProps {
  notificaciones: Notificacion[]
  loading: boolean
  onAbrir: (id: string) => void
}

const ICONO_GRUPO: Record<GrupoNotificacion, LucideIcon> = {
  cita: CalendarClock,
  cliente: User,
  equipo: Users,
  sistema: Settings2,
}

/**
 * A dónde lleva. La api manda `entidad` + `entidadId` y **no una URL**: las
 * rutas del panel son de este repo, y una entidad sin pantalla propia no lleva
 * a ninguna parte en vez de a un 404.
 *
 * Se enlaza a la PANTALLA, no al detalle: en este panel el detalle de una cita o
 * de un cliente vive en un modal que abre su lista, así que no hay ruta por id a
 * la que apuntar.
 */
const RUTA_ENTIDAD: Record<string, string> = {
  cita: "/dashboard/citas",
  cliente: "/dashboard/clientes",
  barbero: "/dashboard/personas/barberos",
  membresia: "/dashboard/personas",
  sede: "/dashboard/sedes",
  servicio: "/dashboard/servicios",
}

export function NotificacionesList({ notificaciones, loading, onAbrir }: NotificacionesListProps) {
  const { relativo, fechaHora } = useFormato()

  return (
    <Loadable
      loading={loading}
      variant="list"
      count={5}
      isEmpty={notificaciones.length === 0}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Bell className="h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">La bandeja está vacía</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Aquí llegan los avisos de tus citas, tus clientes y tu equipo.
          </p>
        </div>
      }
    >
      <ul className="space-y-2">
        {notificaciones.map((notificacion) => {
          const Icono = ICONO_GRUPO[notificacion.grupo]
          const href = notificacion.entidad ? RUTA_ENTIDAD[notificacion.entidad] : undefined

          const contenido = (
            <>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  notificacion.leida ? "bg-secondary" : "bg-primary/10"
                )}
                aria-hidden
              >
                <Icono
                  className={cn(
                    "size-4",
                    notificacion.leida ? "text-muted-foreground" : "text-primary"
                  )}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-sm text-foreground",
                    !notificacion.leida && "font-semibold"
                  )}
                >
                  {notificacion.titulo ?? notificacion.tipo}
                </span>
                {notificacion.detalle && (
                  <span className="block text-xs text-muted-foreground">
                    {notificacion.detalle}
                  </span>
                )}
                <span
                  className="mt-1 block text-[11px] text-muted-foreground"
                  title={fechaHora(notificacion.creadaEn)}
                >
                  {relativo(notificacion.creadaEn)}
                </span>
              </span>
              {!notificacion.leida && (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
              )}
            </>
          )

          const clases = cn(
            "flex w-full min-h-9 items-start gap-3 rounded-xl border p-4 text-left transition-colors motion-reduce:transition-none",
            "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            notificacion.leida
              ? "border-border bg-card hover:border-border/80"
              : "border-primary/30 bg-primary/5"
          )

          return (
            <li key={notificacion.id}>
              {href ? (
                <Link
                  href={href}
                  onClick={() => onAbrir(notificacion.id)}
                  className={clases}
                  aria-label={`Abrir ${notificacion.titulo ?? notificacion.tipo}`}
                >
                  {contenido}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onAbrir(notificacion.id)}
                  className={cn(clases, "cursor-pointer")}
                  aria-label={`Marcar como leída ${notificacion.titulo ?? notificacion.tipo}`}
                >
                  {contenido}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
