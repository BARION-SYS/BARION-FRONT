import { Trash2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { configEstadoCita } from "@features/citas/utils/estadoCita"
import type { CitaCalendario, SemanaCalendario } from "@features/citas/types/citas.types"

interface Props {
  cita: CitaCalendario | null
  semana: SemanaCalendario
  alCerrar: () => void
  alCancelar: () => void
  alReagendar: () => void
  alEliminar: () => void
  mutando?: boolean
}

// "Carlos M." → "CM"
function inicialesDe(nombre: string) {
  return nombre
    .split(" ")
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function CitasDetail({
  cita,
  semana,
  alCerrar,
  alCancelar,
  alReagendar,
  alEliminar,
  mutando,
}: Props) {
  const estado = cita ? configEstadoCita[cita.estado] : null
  const dia = cita ? semana.dias[cita.dia] : null

  return (
    <Modal
      open={cita !== null}
      onOpenChange={(abierta) => !abierta && alCerrar()}
      titulo="Detalle de Cita"
      className="sm:max-w-xs"
    >
      {cita && estado && dia && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <InitialsAvatar iniciales={inicialesDe(cita.cliente)} tamano="md" />
              <div className="flex flex-col items-start gap-1">
                <p className="text-sm font-semibold text-foreground">{cita.cliente}</p>
                <StatusBadge etiqueta={estado.etiqueta} tono={estado.tono} icono={estado.icono} />
              </div>
            </div>

            <dl className="space-y-3">
              {[
                { rotulo: "Servicio", valor: cita.servicio },
                { rotulo: "Barbero", valor: cita.barbero },
                { rotulo: "Hora", valor: semana.horas[cita.horaInicio] },
                {
                  rotulo: "Fecha",
                  valor: `${dia.etiqueta} ${dia.fecha} ${semana.mes.slice(0, 3)}`,
                },
              ].map((fila) => (
                <div key={fila.rotulo} className="flex items-center justify-between text-xs">
                  <dt className="text-muted-foreground">{fila.rotulo}</dt>
                  <dd className="font-medium text-foreground tabular-nums">{fila.valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="icon-lg"
              className="cursor-pointer"
              aria-label="Eliminar cita"
              disabled={mutando}
              onClick={alEliminar}
            >
              <Trash2 aria-hidden />
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 cursor-pointer text-xs font-semibold"
              disabled={mutando}
              onClick={alCancelar}
            >
              Cancelar cita
            </Button>
            <Button
              size="lg"
              className="flex-1 cursor-pointer text-xs font-semibold"
              disabled={mutando}
              onClick={alReagendar}
            >
              Reagendar
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
