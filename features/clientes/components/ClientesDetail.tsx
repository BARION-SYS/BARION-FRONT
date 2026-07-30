import {
  Calendar,
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  QrCode,
  Scissors,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Card } from "@shared/components/ui/card"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { useFormato } from "@shared/hooks/useFormato"
import { configEtiquetaCliente } from "@features/clientes/utils/etiquetaCliente"
import type { Cliente, ServicioHistorial } from "@features/clientes/types/clientes.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  cliente: Cliente
  historial: ServicioHistorial[]
  cargandoHistorial?: boolean
  onEditar: (cliente: Cliente) => void
  onEliminar: (cliente: Cliente) => void
}

// Presentacional: perfil del cliente, historial de servicios y accesos rápidos.
export function ClientesDetail({
  cliente,
  historial,
  cargandoHistorial,
  onEditar,
  onEliminar,
}: Props) {
  const { relativo, fechaCorta } = useFormato()
  const config = configEtiquetaCliente[cliente.etiqueta]
  const contacto = [
    { icono: Phone, valor: cliente.telefono, tabular: true },
    { icono: Mail, valor: cliente.correo, tabular: false },
    { icono: Scissors, valor: cliente.barberoFavorito, tabular: false },
  ]
  const estadisticas = [
    {
      etiqueta: "Total visitas",
      valor: `${cliente.visitas}`,
      icono: Calendar,
      sub: `Última: ${relativo(cliente.ultimaVisitaEn)}`,
    },
    {
      etiqueta: "Total gastado",
      valor: `$${formatNumber(cliente.gastadoTotal)}`,
      icono: TrendingUp,
      sub: "Acumulado",
    },
    {
      etiqueta: "Ticket prom.",
      valor: `$${formatNumber(Math.round(cliente.gastadoTotal / cliente.visitas))}`,
      icono: Star,
      sub: "Por visita",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Perfil */}
      <Card className="gap-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <InitialsAvatar
              iniciales={cliente.iniciales}
              color={config.color}
              tamano="lg"
              className="size-16 text-xl"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{cliente.nombre}</h2>
                <StatusBadge etiqueta={cliente.etiqueta} tono={config.tono} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {contacto.map((c) => (
                  <span
                    key={c.valor}
                    className={
                      "flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground" +
                      (c.tabular ? " tabular-nums" : "")
                    }
                  >
                    <c.icono className="size-3 text-primary" aria-hidden />
                    <span className="max-w-44 truncate">{c.valor}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onEditar(cliente)}
              className="cursor-pointer"
            >
              <Pencil aria-hidden /> Editar
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onEliminar(cliente)}
              className="cursor-pointer text-destructive hover:text-destructive"
            >
              <Trash2 aria-hidden /> Eliminar
            </Button>
            <Button size="lg" className="cursor-pointer font-semibold">
              <Calendar aria-hidden /> Agendar cita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {estadisticas.map((s) => (
            <div key={s.etiqueta} className="rounded-xl border border-border bg-secondary/60 p-4">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {s.etiqueta}
                </p>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <s.icono className="size-3.5 text-primary" aria-hidden />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {s.valor}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Historial */}
      <SectionCard
        titulo="Historial de servicios"
        subtitulo={cargandoHistorial ? undefined : `${historial.length} servicios registrados`}
        accion={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 cursor-pointer text-xs text-primary hover:text-primary/80"
          >
            Ver todo <ChevronRight className="size-3" aria-hidden />
          </Button>
        }
      >
        {cargandoHistorial ? (
          <DataSkeleton variant="list" count={3} />
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <Calendar className="size-7 opacity-30" aria-hidden />
            <p className="mt-2 text-xs">Aún no hay servicios registrados</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {historial.map((h) => (
              <li
                key={`${h.iniciaEn}-${h.servicio}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/60 p-3"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                  aria-hidden
                >
                  <Scissors className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{h.servicio}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {fechaCorta(h.iniciaEn)} · {h.barbero}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-primary tabular-nums">{h.precio}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Accesos rápidos */}
      <SectionCard titulo="Acceso rápido">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-auto min-h-11 flex-1 cursor-pointer py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <QrCode className="text-primary" aria-hidden /> Ver QR del cliente
          </Button>
          <Button
            variant="outline"
            className="h-auto min-h-11 flex-1 cursor-pointer py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Mail className="text-primary" aria-hidden /> Enviar recordatorio
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
