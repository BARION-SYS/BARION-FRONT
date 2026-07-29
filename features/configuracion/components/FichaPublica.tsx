"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2, Plus, X } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import { SectionCard } from "@shared/components/cards/SectionCard"
import {
  esquemaTextoFicha,
  type DatosFicha,
  type DatosTextoFicha,
} from "@features/configuracion/schemas/configuracion.schema"
import type { Barberia } from "@features/configuracion/types/configuracion.types"

interface FichaPublicaProps {
  barberia: Barberia
  soloLectura?: boolean
  cargando?: boolean
  onSubmit: (datos: DatosFicha) => Promise<void>
}

/** Tope de la API. Más de ocho viñetas dejan de leerse y empiezan a estorbar. */
const MAX_VENTAJAS = 8
const MAX_LARGO_VENTAJA = 80

/**
 * El texto con el que la barbería se presenta en su portal.
 *
 * Va aparte de la información general porque son dos endpoints y dos momentos
 * distintos: la identidad fiscal se toca una vez al abrir; esto se reescribe
 * cada vez que el negocio quiere vender algo mejor.
 *
 * Las viñetas se llevan en estado y no con `useFieldArray`: son cadenas sueltas,
 * y sobre primitivos ese helper pierde el vínculo entre el campo y su valor en
 * cuanto se borra uno del medio — el usuario ve cómo se le mueve el texto de
 * sitio.
 */
export function FichaPublica({ barberia, soloLectura, cargando, onSubmit }: FichaPublicaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosTextoFicha>({
    resolver: standardSchemaResolver(esquemaTextoFicha),
    defaultValues: {
      eslogan: barberia.ficha.eslogan ?? undefined,
      descripcion: barberia.ficha.descripcion ?? undefined,
    },
  })

  // El orden se respeta al guardar: es copy de venta, y lo primero pesa más.
  const [ventajas, setVentajas] = useState<string[]>(barberia.ficha.ventajas)

  const editar = (indice: number, texto: string) =>
    setVentajas((lista) => lista.map((v, i) => (i === indice ? texto : v)))

  const quitar = (indice: number) => setVentajas((lista) => lista.filter((_, i) => i !== indice))

  const largas = ventajas.some((v) => v.length > MAX_LARGO_VENTAJA)

  return (
    <SectionCard titulo="Cara pública" subtitulo="Lo que ve quien entra a reservar desde el portal">
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) =>
          void handleSubmit((datos) =>
            // Las viñetas en blanco no viajan: la API también las descarta, pero
            // enviarlas dejaría el contador de ocho contando huecos.
            onSubmit({ ...datos, ventajas: ventajas.map((v) => v.trim()).filter(Boolean) })
          )(e)
        }
      >
        <Field data-invalid={!!errors.eslogan}>
          <FieldLabel htmlFor="eslogan">Eslogan</FieldLabel>
          <Input
            id="eslogan"
            type="text"
            placeholder="Cortes clásicos, sin filas"
            disabled={soloLectura}
            aria-invalid={!!errors.eslogan}
            {...register("eslogan")}
          />
          <p className="text-xs text-muted-foreground">
            Una línea, la cabecera del portal. Hasta 120 caracteres.
          </p>
          <FieldError errors={[errors.eslogan]} />
        </Field>

        <Field data-invalid={!!errors.descripcion}>
          <FieldLabel htmlFor="descripcion">Descripción</FieldLabel>
          {/* shadcn no trae textarea instalado: nativo con el estilo del Input */}
          <textarea
            id="descripcion"
            rows={4}
            disabled={soloLectura}
            aria-invalid={!!errors.descripcion}
            className="w-full resize-none rounded-lg border border-input bg-input/30 px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
            {...register("descripcion")}
          />
          <FieldError errors={[errors.descripcion]} />
        </Field>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <FieldLabel htmlFor="ventaja-0">Ventajas</FieldLabel>
            <span className="text-xs text-muted-foreground">
              {ventajas.length} de {MAX_VENTAJAS}
            </span>
          </div>

          {ventajas.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Sin viñetas. No todas las barberías las quieren.
            </p>
          )}

          {ventajas.map((ventaja, indice) => (
            <div key={indice} className="flex items-center gap-2">
              <Input
                id={`ventaja-${indice}`}
                type="text"
                value={ventaja}
                maxLength={MAX_LARGO_VENTAJA}
                placeholder="Reserva en 30 segundos"
                disabled={soloLectura}
                aria-label={`Ventaja ${indice + 1}`}
                onChange={(e) => editar(indice, e.target.value)}
              />
              {!soloLectura && (
                <button
                  type="button"
                  onClick={() => quitar(indice)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                >
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">Quitar la ventaja {indice + 1}</span>
                </button>
              )}
            </div>
          ))}

          {!soloLectura && ventajas.length < MAX_VENTAJAS && (
            <button
              type="button"
              onClick={() => setVentajas((lista) => [...lista, ""])}
              className="inline-flex items-center gap-1 self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="size-3" aria-hidden />
              Añadir ventaja
            </button>
          )}

          {largas && (
            <p className="text-sm text-destructive">
              Alguna ventaja supera los {MAX_LARGO_VENTAJA} caracteres.
            </p>
          )}
        </div>

        {!soloLectura && (
          <Button type="submit" disabled={cargando || largas} className="mt-2">
            {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Guardar cara pública
          </Button>
        )}
      </form>
    </SectionCard>
  )
}
