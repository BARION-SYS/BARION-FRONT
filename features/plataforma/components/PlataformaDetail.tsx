"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { AccionesBarberia } from "@features/plataforma/components/AccionesBarberia"
import { ESTADO_BARBERIA, nombreDePais } from "@features/plataforma/utils/inventario"
import { PULSO, pulsoDe } from "@features/plataforma/utils/salud"
import { configEstadoSuscripcion } from "@features/plataforma/utils/suscripciones"
import type { BarberiaFicha, EstadoBarberia } from "@features/plataforma/types/plataforma.types"

interface PlataformaDetailProps {
  ficha: BarberiaFicha
  /** Sin `plataforma.barberias.gestionar` la ficha se lee, no se toca. */
  gestiona: boolean
  onCambiarEstado: (destino: EstadoBarberia) => void
}

/**
 * La cabecera de la ficha: quién es, en qué estado está y cómo se mueve.
 *
 * Cuatro píldoras y ninguna sobra, porque responden cuatro preguntas distintas:
 * si PUEDE operar (estado), si DE VERDAD opera (pulso), si su portal se sirve
 * (verificación) y si está al día con Barion (suscripción).
 */
export function PlataformaDetail({ ficha, gestiona, onCambiarEstado }: PlataformaDetailProps) {
  const { fechaCorta, relativo } = useFormato()
  const estado = ESTADO_BARBERIA[ficha.estado]
  const pulso = PULSO[pulsoDe(ficha)]
  const suscripcion = ficha.suscripcion ? configEstadoSuscripcion(ficha.suscripcion.estado) : null

  return (
    <header className="flex flex-col gap-4">
      <Link
        href="/admin/barberias"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Barberías
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <InitialsAvatar
            iniciales={inicialesDe(ficha.nombreComercial)}
            tamano="lg"
            className="shrink-0"
          />
          <div className="min-w-0 space-y-2">
            <div>
              <h1 className="truncate text-xl font-semibold tracking-tight text-balance sm:text-2xl">
                {ficha.nombreComercial}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                /{ficha.slug} · {nombreDePais(ficha.codigoPais)} · alta el{" "}
                {fechaCorta(ficha.creadoEn)} ({relativo(ficha.creadoEn)})
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
              {ficha.estado === "activa" && (
                <StatusBadge tono={pulso.tono} etiqueta={pulso.etiqueta} icono={pulso.icono} />
              )}
              {ficha.verificadaEn ? (
                <StatusBadge tono="exito" etiqueta="Verificada" icono={ShieldCheck} />
              ) : (
                <StatusBadge tono="advertencia" etiqueta="Sin verificar" icono={ShieldAlert} />
              )}
              {suscripcion && <StatusBadge {...suscripcion} />}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            render={<a href={`/b/${ficha.slug}`} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="size-4" aria-hidden />
            Ver su portal
          </Button>
          <AccionesBarberia
            barberia={ficha}
            gestiona={gestiona}
            enFicha
            onCambiarEstado={(_, destino) => onCambiarEstado(destino)}
          />
        </div>
      </div>
    </header>
  )
}
