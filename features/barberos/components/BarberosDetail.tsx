"use client"

import { CalendarClock, KeyRound, Mail, Phone, Scissors, Star } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { HorarioSemanal } from "@features/barberos/components/HorarioSemanal"
import { useFormato } from "@shared/hooks/useFormato"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import type { TonoEstado } from "@shared/types/ui.types"
import type { Barbero, JornadaSemanal } from "@features/barberos/types/barberos.types"
import { useTextos } from "@shared/textos/useTextos"

interface BarberosDetailProps {
  barbero: Barbero
  jornada: JornadaSemanal | null
  /** Sin `barberos.gestionar` el perfil se consulta, no se edita. */
  gestiona: boolean
  onEditar: () => void
  onDisponibilidad: () => void
  /** Su oferta: qué servicios hace, a qué precio. Es lo que se reserva. */
  onOferta: () => void
  onAlternarActivo: () => void
}

/**
 * Perfil del barbero seleccionado. Presentacional — solo dispara callbacks.
 *
 * No pinta cifras de producción: citas, ingresos y comisión liquidada son
 * lecturas de la fase de reportes y todavía no existen. Lo que sí se enseña es
 * el ACUERDO —el porcentaje pactado— que es dato del perfil.
 */
export function BarberosDetail({
  barbero,
  jornada,
  gestiona,
  onEditar,
  onDisponibilidad,
  onOferta,
  onAlternarActivo,
}: BarberosDetailProps) {
  const t = useTextos("barberos.detalle")
  const { dinero } = useFormato()
  const color = tokenDeColor(barbero.indiceColor)
  const estado = estadoDe(barbero)

  const contacto = [
    { icono: Phone, valor: barbero.telefonoE164 },
    { icono: Mail, valor: barbero.email },
  ].filter((linea) => linea.valor)

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        titulo={t("perfil")}
        accion={
          gestiona ? (
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={onDisponibilidad}>
                <CalendarClock className="size-4" aria-hidden />
                Disponibilidad
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onOferta}>
                <Scissors className="size-4" aria-hidden />
                Oferta
              </Button>
              <Button type="button" size="sm" onClick={onEditar}>
                Editar
              </Button>
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <InitialsAvatar
            iniciales={inicialesDe(barbero.nombrePublico)}
            color={color}
            tamano="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{barbero.nombrePublico}</h3>
              <StatusBadge tono={estado.tono} etiqueta={t(estado.clave)} compacta />
              {!barbero.tieneAcceso && (
                <StatusBadge tono="neutro" etiqueta={t("sinCuenta")} icono={KeyRound} compacta />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{barbero.titulo ?? t("barbero")}</p>
            {barbero.calificacion !== null && (
              <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                <Star className="size-3 fill-primary" aria-hidden />
                {barbero.calificacion.toFixed(1)} · {barbero.resenas}{" "}
                {barbero.resenas === 1 ? "reseña" : "reseñas"}
              </p>
            )}
          </div>
        </div>

        {barbero.bio && <p className="mt-4 text-sm text-muted-foreground">{barbero.bio}</p>}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {contacto.map((linea) => (
            <div key={linea.valor} className="flex items-center gap-2 text-sm">
              <linea.icono className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate">{linea.valor}</span>
            </div>
          ))}

          <div className="flex items-center gap-2 text-sm">
            <Scissors className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              {barbero.comisionBps === null
                ? t("cienPorCiento")
                : `Comisión pactada del ${barbero.comisionBps / 100} %`}
            </span>
          </div>

          {barbero.fechaContratacion && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>Desde {barbero.fechaContratacion}</span>
            </div>
          )}
        </dl>

        {gestiona && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-4 self-start"
            onClick={onAlternarActivo}
          >
            {barbero.activo ? t("retirar") : t("reincorporar")}
          </Button>
        )}
      </SectionCard>

      <SectionCard titulo={t("jornada")} subtitulo={t("jornadaAyuda")}>
        <HorarioSemanal tramos={jornada?.tramos ?? []} />
      </SectionCard>

      <SectionCard titulo={t("servicios")} subtitulo={t("serviciosAyuda")}>
        {barbero.oferta.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Todavía no ofrece ningún servicio.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {barbero.oferta.map((servicio) => (
              <li
                key={servicio.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{servicio.nombre}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {servicio.duracionMin} min
                </span>
                <span className="font-medium tabular-nums">
                  {dinero(Number(servicio.precioCentavos))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}

/**
 * Tres estados, y ninguno se distingue solo por color: cada uno lleva etiqueta.
 *
 * Devuelve la CLAVE y no el texto: el tono es diseño y no cambia con el idioma.
 * Además esta función vive fuera del componente, donde no alcanza ningún hook.
 */
function estadoDe(barbero: Barbero): {
  clave: "inactivo" | "ausenteHoy" | "activo"
  tono: TonoEstado
} {
  if (!barbero.activo) return { clave: "inactivo", tono: "neutro" }
  return barbero.enVacaciones
    ? { clave: "ausenteHoy", tono: "advertencia" }
    : { clave: "activo", tono: "exito" }
}
