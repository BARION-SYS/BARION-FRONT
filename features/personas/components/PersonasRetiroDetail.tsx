"use client"

import { CalendarClock, Phone } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { useFormato } from "@shared/hooks/useFormato"
import type { CitaComprometida } from "@features/barberos/types/barberos.types"

interface PersonasRetiroDetailProps {
  /** Cómo se llama quien salió de la agenda: es a quien se refieren las citas. */
  nombre: string
  citasComprometidas: number
  citasPendientes: CitaComprometida[]
  onCerrar: () => void
}

/**
 * Lo que queda colgando después de retirar a alguien de la agenda.
 *
 * **Sus citas futuras no se cancelan, y es a propósito**: son clientes ya
 * citados a los que hay que avisar uno por uno. Cancelarlas en cascada dejaría a
 * un puñado de gente presentándose a una hora que ya no existe, sin que nadie
 * se lo haya dicho.
 *
 * Así que lo que hace esta pantalla es la otra mitad de la decisión: enseñar
 * cuántas son y quiénes, con su teléfono, para que quien retiró pueda llamarles
 * y reasignarlas. Es el mismo criterio que al programar una ausencia, donde la
 * api devuelve cuántas citas quedaron dentro del rango.
 *
 * Sirve a los **tres** caminos que sacan a alguien de la agenda —retirarlo,
 * dejar de atender uno mismo y quitarle el acceso— porque los tres devuelven la
 * misma lista. Por eso recibe los datos sueltos y no una ficha de barbero.
 */
export function PersonasRetiroDetail({
  nombre,
  citasComprometidas: total,
  citasPendientes,
  onCerrar,
}: PersonasRetiroDetailProps) {
  const { fechaHora } = useFormato()
  const hayMas = total > citasPendientes.length

  return (
    <div className="flex flex-col gap-4">
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">
            {nombre} no tenía ninguna cita por delante.
          </strong>{" "}
          Ya no aparece en el escaparate, ni en los cupos, ni en los selectores de reserva. Su
          historial, sus liquidaciones y sus citas pasadas se quedan como estaban.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">
              {total === 1
                ? "Queda 1 cita suya por delante."
                : `Quedan ${total} citas suyas por delante.`}
            </strong>{" "}
            No se han cancelado: son clientes ya citados a los que hay que avisar uno por uno.
            Llámales y reasígnalas desde Citas.
          </p>

          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {citasPendientes.map((cita) => (
              <li
                key={cita.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="tabular-nums">{fechaHora(cita.iniciaEn)}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{cita.cliente.nombre}</span>
                {cita.cliente.telefonoE164 && (
                  <a
                    href={`tel:${cita.cliente.telefonoE164}`}
                    className="flex items-center gap-1 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <Phone className="size-3" aria-hidden />
                    {cita.cliente.telefonoE164}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {hayMas && (
            <p className="text-xs text-muted-foreground">
              Se enumeran las {citasPendientes.length} primeras. El resto están en Citas, filtrando
              por {nombre}.
            </p>
          )}
        </>
      )}

      <Button type="button" className="h-10 self-start" onClick={onCerrar}>
        Entendido
      </Button>
    </div>
  )
}
