"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Checkbox } from "@shared/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { Textarea } from "@shared/components/ui/textarea"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import { cn } from "@shared/utils/cn"
import type { DatosCita } from "@features/citas/schemas/citas.schema"
import type { Disponibilidad } from "@features/citas/types/citas.types"
import type { Barbero } from "@features/barberos/types/barberos.types"
import type { Cliente } from "@features/clientes/types/clientes.types"
import type { LineaOferta } from "@features/servicios/types/servicios.types"
import { useTextos } from "@shared/textos/useTextos"

interface CitasFormProps {
  sedeId: string
  clientes: Cliente[]
  barberos: Barbero[]
  /** La oferta del barbero elegido: es lo que se reserva de verdad. */
  oferta: LineaOferta[]
  disponibilidad: Disponibilidad | null
  cargandoDisponibilidad?: boolean
  cargando?: boolean
  /** El padre pide la oferta de ese barbero. */
  onBarbero: (barberoId: string) => void
  /** El padre consulta el motor con lo elegido hasta ahora. */
  onConsultar: (params: { barberoId: string; ofertaIds: string[]; desde: string }) => void
  onSubmit: (datos: DatosCita) => Promise<void>
}

/**
 * Reservar, en el orden en que se decide de verdad: quién viene, con quién, qué
 * se hace y **entonces** cuándo cabe.
 *
 * La hora no se teclea: se elige entre las franjas que devuelve el motor. Y esa
 * franja **no aparta nada** — si al enviar llega un 409, alguien se adelantó y
 * hay que volver a mirar.
 */
export function CitasForm({
  sedeId,
  clientes,
  barberos,
  oferta,
  disponibilidad,
  cargandoDisponibilidad,
  cargando,
  onBarbero,
  onConsultar,
  onSubmit,
}: CitasFormProps) {
  const t = useTextos("citas")
  const { hora, fecha: formatearFecha } = useFormato()

  const [clienteId, setClienteId] = useState("")
  const [barberoId, setBarberoId] = useState("")
  const [ofertaIds, setOfertaIds] = useState<string[]>([])
  const [dia, setDia] = useState("")
  const [iniciaEn, setIniciaEn] = useState("")
  const [notas, setNotas] = useState("")

  const elegirBarbero = (valor: string) => {
    setBarberoId(valor)
    setOfertaIds([])
    setIniciaEn("")
    onBarbero(valor)
  }

  const alternarServicio = (id: string) => {
    setOfertaIds((previos) =>
      previos.includes(id) ? previos.filter((otro) => otro !== id) : [...previos, id]
    )
    setIniciaEn("")
  }

  const consultar = (fechaElegida: string) => {
    setDia(fechaElegida)
    setIniciaEn("")
    if (barberoId && ofertaIds.length > 0 && fechaElegida) {
      onConsultar({ barberoId, ofertaIds, desde: fechaElegida })
    }
  }

  const listo = Boolean(clienteId && barberoId && ofertaIds.length > 0 && iniciaEn)

  const enviar = () =>
    void onSubmit({
      sedeId,
      barberoId,
      clienteId,
      ofertaIds,
      iniciaEn,
      notasCliente: notas || undefined,
    })

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="clienteId">{t("form.cliente")}</FieldLabel>
          <Select value={clienteId} onValueChange={(valor) => setClienteId(valor ?? "")}>
            <SelectTrigger id="clienteId" className="w-full">
              <SelectValue placeholder="¿Quién viene?" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="barberoId">{t("form.barbero")}</FieldLabel>
          <Select value={barberoId} onValueChange={(valor) => elegirBarbero(valor ?? "")}>
            <SelectTrigger id="barberoId" className="w-full">
              <SelectValue placeholder="¿Quién atiende?" />
            </SelectTrigger>
            <SelectContent>
              {barberos.map((barbero) => (
                <SelectItem key={barbero.id} value={barbero.id}>
                  {barbero.nombrePublico}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            La cita es siempre de alguien concreto: el precio y la duración son los suyos.
          </p>
        </Field>
      </div>

      {barberoId && (
        <Field>
          <FieldLabel>{t("form.servicios")}</FieldLabel>
          {oferta.length === 0 ? (
            <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              Ese barbero todavía no ofrece nada. Su oferta se arma en Personas › Atienden.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {oferta.map((linea) => (
                <li key={linea.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`ofe-${linea.id}`}
                    checked={ofertaIds.includes(linea.id)}
                    onCheckedChange={() => alternarServicio(linea.id)}
                  />
                  <label htmlFor={`ofe-${linea.id}`} className="flex-1 text-sm">
                    {linea.nombre}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {linea.duracionMin} min
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Field>
      )}

      {ofertaIds.length > 0 && (
        <Field>
          <FieldLabel htmlFor="dia">Día</FieldLabel>
          <Input id="dia" type="date" value={dia} onChange={(e) => consultar(e.target.value)} />
        </Field>
      )}

      {dia && (
        <Field>
          <FieldLabel>{t("form.hora")}</FieldLabel>
          {cargandoDisponibilidad ? (
            <DataSkeleton variant="list" count={2} />
          ) : (
            <FranjasDelDia
              disponibilidad={disponibilidad}
              dia={dia}
              elegida={iniciaEn}
              onElegir={setIniciaEn}
              hora={hora}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Estas horas están libres ahora mismo; no quedan apartadas hasta reservar.
          </p>
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="notas">{t("form.notas")}</FieldLabel>
        <Textarea
          id="notas"
          rows={2}
          className="resize-none"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </Field>

      <Button type="button" disabled={!listo || cargando} onClick={enviar} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {iniciaEn ? `Reservar ${formatearFecha(iniciaEn)} ${hora(iniciaEn)}` : t("form.reservar")}
      </Button>
    </div>
  )
}

interface FranjasProps {
  disponibilidad: Disponibilidad | null
  dia: string
  elegida: string
  onElegir: (inicio: string) => void
  hora: (valor: string) => string
}

function FranjasDelDia({ disponibilidad, dia, elegida, onElegir, hora }: FranjasProps) {
  const delDia = disponibilidad?.dias.find((jornada) => jornada.fecha === dia)
  const libres = delDia?.franjas.filter((franja) => franja.disponible) ?? []

  if (libres.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        No queda hueco ese día. Prueba otra fecha o con otro barbero.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {libres.map((franja) => (
        <button
          key={franja.inicio}
          type="button"
          onClick={() => onElegir(franja.inicio)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm transition-colors",
            franja.inicio === elegida
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:bg-secondary"
          )}
        >
          {hora(franja.inicio)}
        </button>
      ))}
    </div>
  )
}
