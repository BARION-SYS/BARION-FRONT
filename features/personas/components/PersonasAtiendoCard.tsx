"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Scissors } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { Switch } from "@shared/components/ui/switch"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { esquemaAtiendoYo, type DatosAtiendoYo } from "@features/barberos/schemas/barberos.schema"
import type { Barbero } from "@features/barberos/types/barberos.types"

interface PersonasAtiendoCardProps {
  /** Ficha propia, o `null` si quien mira no atiende. */
  miPerfil: Barbero | null
  loading?: boolean
  /** Nombre de la membresía: lo que la barbería ya sabe de esta persona. */
  nombreSugerido: string
  /** Sede activa del panel. La ficha nace en la sede en la que se está trabajando. */
  sedeId?: string
  cargando?: boolean
  onActivar: (datos: DatosAtiendoYo) => Promise<void>
  onDesactivar: () => Promise<void>
}

/** El formulario pide porcentaje; la API guarda puntos base. */
const BPS_POR_PUNTO = 100

/**
 * «Yo también atiendo» — el interruptor con el que quien administra se pone a sí
 * mismo en la agenda.
 *
 * Existe porque el propietario de dos sillas corta, y era el único que no podía
 * darse de alta: `POST /equipo` crea una cuenta que él ya tiene, y la ficha de
 * barbero no acepta vincular una membresía. Sin esto tendría que pedírselo a
 * alguien, y en una barbería de una persona no hay a quién.
 *
 * Apagarlo **no borra nada**: desactiva la ficha, que conserva su historial y sus
 * liquidaciones, y no cancela las citas que ya tuviera.
 */
export function PersonasAtiendoCard({
  miPerfil,
  loading,
  nombreSugerido,
  sedeId,
  cargando,
  onActivar,
  onDesactivar,
}: PersonasAtiendoCardProps) {
  const atiende = miPerfil !== null && miPerfil.activo
  const [abierto, setAbierto] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosAtiendoYo>({
    resolver: standardSchemaResolver(esquemaAtiendoYo),
    defaultValues: {
      nombrePublico: miPerfil?.nombrePublico ?? nombreSugerido,
      titulo: miPerfil?.titulo ?? undefined,
      comisionBps: miPerfil?.comisionBps ?? undefined,
      sedeId,
    },
  })

  if (loading) return <DataSkeleton variant="text" />

  const alCambiar = (activar: boolean) => {
    if (!activar) {
      setAbierto(false)
      void onDesactivar()
      return
    }
    // Reincorporarse no vuelve a preguntar: la ficha ya tiene sus datos y lo
    // único que cambia es que vuelve a estar activa.
    if (miPerfil) {
      void onActivar({ nombrePublico: miPerfil.nombrePublico, sedeId })
      return
    }
    setAbierto(true)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <Scissors className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <FieldLabel htmlFor="atiendoYo" className="text-sm font-medium">
              Yo también atiendo
            </FieldLabel>
            <p className="mt-1 text-xs text-muted-foreground">
              {atiende
                ? "Apareces en la agenda y en el escaparate, y se te pueden reservar citas."
                : "Actívalo si cortas tú: se te abre agenda propia y el cliente puede reservarte."}
            </p>
          </div>
        </div>
        <Switch
          id="atiendoYo"
          checked={atiende}
          disabled={cargando}
          onCheckedChange={alCambiar}
          aria-label="Yo también atiendo"
        />
      </div>

      {abierto && !atiende && (
        <form
          onSubmit={(e) =>
            void handleSubmit(async (datos) => {
              await onActivar(datos)
              setAbierto(false)
            })(e)
          }
          className="flex flex-col gap-4 border-t border-border pt-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={!!errors.nombrePublico}>
              <FieldLabel htmlFor="nombrePublicoPropio">Nombre público</FieldLabel>
              <Input
                id="nombrePublicoPropio"
                placeholder="Camilo"
                aria-invalid={!!errors.nombrePublico}
                {...register("nombrePublico")}
              />
              <FieldError errors={[errors.nombrePublico]} />
            </Field>

            <Field data-invalid={!!errors.titulo}>
              <FieldLabel htmlFor="tituloPropio">Título</FieldLabel>
              <Input id="tituloPropio" placeholder="Propietario" {...register("titulo")} />
              <FieldError errors={[errors.titulo]} />
            </Field>

            <Field data-invalid={!!errors.comisionBps}>
              <FieldLabel htmlFor="comisionBpsPropia">Comisión (%)</FieldLabel>
              <Input
                id="comisionBpsPropia"
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="100"
                {...register("comisionBps", {
                  setValueAs: (valor: string) =>
                    valor === "" ? undefined : Number(valor) * BPS_POR_PUNTO,
                })}
              />
              <FieldError errors={[errors.comisionBps]} />
            </Field>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={cargando}>
              {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Ponerme en la agenda
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
