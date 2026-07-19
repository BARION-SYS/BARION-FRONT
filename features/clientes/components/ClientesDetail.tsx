import {
  Calendar,
  ChevronRight,
  Mail,
  Pencil,
  Phone,
  QrCode,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Card } from "@shared/components/ui/card"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { configEtiquetaCliente } from "@features/clientes/utils/etiquetaCliente"
import type { Cliente, ServicioHistorial } from "@features/clientes/types/clientes.types"
import { formatNumber } from "@shared/utils/numbers"

interface Props {
  cliente: Cliente
  historial: ServicioHistorial[]
  onEditar: (cliente: Cliente) => void
  onEliminar: (cliente: Cliente) => void
}

// Presentacional: perfil del cliente, historial de servicios y accesos rápidos.
export function ClientesDetail({ cliente, historial, onEditar, onEliminar }: Props) {
  const config = configEtiquetaCliente[cliente.etiqueta]
  const estadisticas = [
    {
      etiqueta: "Total visitas",
      valor: `${cliente.visitas}`,
      icono: Calendar,
      sub: `Última: ${cliente.ultimaVisita}`,
    },
    {
      etiqueta: "Total gastado",
      valor: `$${formatNumber(cliente.gastadoTotal)}`,
      icono: TrendingUp,
      sub: "Acumulado",
    },
    {
      etiqueta: "Ticket prom.",
      valor: `$${Math.round(cliente.gastadoTotal / cliente.visitas)}`,
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
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{cliente.nombre}</h2>
                <StatusBadge etiqueta={cliente.etiqueta} tono={config.tono} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Barbero favorito: {cliente.barberoFavorito}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Phone className="size-3" aria-hidden /> {cliente.telefono}
              </p>
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
            <Button size="lg" className="cursor-pointer">
              <Calendar aria-hidden /> Agendar cita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {estadisticas.map((s) => (
            <div key={s.etiqueta} className="rounded-xl bg-secondary p-4">
              <div className="mb-2 flex items-center gap-2">
                <s.icono className="size-4 text-primary" aria-hidden />
                <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  {s.etiqueta}
                </p>
              </div>
              <p className="text-xl font-bold text-foreground tabular-nums">{s.valor}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Historial */}
      <SectionCard
        titulo="Historial de servicios"
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
        <ul className="space-y-2">
          {historial.map((h) => (
            <li
              key={`${h.fecha}-${h.servicio}`}
              className="flex items-center gap-3 rounded-lg bg-secondary p-3"
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                aria-hidden
              >
                <Calendar className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{h.servicio}</p>
                <p className="text-[11px] text-muted-foreground">
                  {h.fecha} · {h.barbero}
                </p>
              </div>
              <p className="text-sm font-bold text-primary tabular-nums">{h.precio}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Accesos rápidos */}
      <SectionCard titulo="Acceso rápido">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-auto min-h-9 flex-1 cursor-pointer py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <QrCode aria-hidden /> Ver QR del cliente
          </Button>
          <Button
            variant="outline"
            className="h-auto min-h-9 flex-1 cursor-pointer py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Mail aria-hidden /> Enviar recordatorio
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
