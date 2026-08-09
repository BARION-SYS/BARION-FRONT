"use client"

import { Controller, useForm, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Loader2 } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { useFormato } from "@shared/hooks/useFormato"
import { nombresDeRegion, regiones, type CodigoRegion } from "@config/regiones"
import { ETIQUETA_PERIODO } from "@features/plataforma/constants/planes.copy"
import { nombreDePais } from "@features/plataforma/utils/inventario"
import { precioDelPais } from "@features/plataforma/utils/planes"
import {
  esquemaAltaBarberia,
  type DatosAltaBarberia,
} from "@features/plataforma/schemas/plataforma.schema"
import type { PlanPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaFormProps {
  /** El catálogo real: el código del plan se elige, no se teclea. */
  planes: PlanPlataforma[]
  cargando?: boolean
  onSubmit: (datos: DatosAltaBarberia) => Promise<void>
}

/**
 * Alta de una barbería. Largo a propósito: lo que sale de aquí es una barbería
 * ENTREGABLE —con sede y con dueño que puede entrar—, no un registro vacío que
 * haya que completar después.
 *
 * El identificador público se pide explícitamente en vez de derivarlo del
 * nombre: es la dirección que el cliente va a repartir a sus clientes y a
 * imprimir en su QR, así que cambiarlo luego rompe cosas fuera del sistema.
 *
 * El plan sale del catálogo publicado y no de un campo de texto: un código
 * inventado se acepta hasta que la API responde 404, y para entonces quien vende
 * ya le dijo un precio al cliente.
 */
export function PlataformaForm({ planes, cargando, onSubmit }: PlataformaFormProps) {
  const { dineroEn } = useFormato()
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosAltaBarberia>({
    resolver: standardSchemaResolver(esquemaAltaBarberia),
    defaultValues: { codigoPais: "CO", planCodigo: planes[0]?.codigo ?? "", diasPrueba: 7 },
  })

  const codigoPais = watch("codigoPais")
  const planCodigo = watch("planCodigo")
  const plan = planes.find((p) => p.codigo === planCodigo)
  const precio = plan ? precioDelPais(plan, codigoPais) : undefined

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-5">
      <Seccion titulo="La barbería">
        <CampoTexto
          nombre="nombreComercial"
          etiqueta="Nombre comercial"
          placeholder="Barbería El Corte"
          register={register}
          errors={errors}
        />

        <CampoTexto
          nombre="slug"
          etiqueta="Identificador público"
          placeholder="barberia-el-corte"
          ayuda="Será su dirección: /b/identificador. Se imprime en su QR, así que conviene acertar a la primera."
          register={register}
          errors={errors}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="codigoPais"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="codigoPais">País</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="codigoPais" className="w-full">
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(regiones).map(([codigo, config]) => (
                      <SelectItem key={codigo} value={codigo}>
                        {nombresDeRegion[codigo as CodigoRegion]} · {config.moneda}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  De él salen su moneda, su idioma y su huso horario.
                </p>
                {errors.codigoPais && <FieldError>{errors.codigoPais.message}</FieldError>}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="planCodigo"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="planCodigo">Plan</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="planCodigo" className="w-full">
                    <SelectValue placeholder="Elige un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planes.map((opcion) => (
                      <SelectItem key={opcion.codigo} value={opcion.codigo}>
                        {opcion.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* El precio del país elegido, para no prometer otro por teléfono. */}
                <p className="text-xs text-muted-foreground">
                  {precio
                    ? `${dineroEn(Number(precio.montoCentavos), precio.moneda)}${ETIQUETA_PERIODO[precio.periodo] ?? ""} en ${nombreDePais(codigoPais)}`
                    : "Sin precio publicado para este país: se acuerda aparte."}
                </p>
                {errors.planCodigo && <FieldError>{errors.planCodigo.message}</FieldError>}
              </Field>
            )}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="diasPrueba">Días de prueba</FieldLabel>
          <Input
            id="diasPrueba"
            type="number"
            inputMode="numeric"
            min={0}
            max={365}
            {...register("diasPrueba", { valueAsNumber: true })}
          />
          {errors.diasPrueba && <FieldError>{errors.diasPrueba.message}</FieldError>}
        </Field>
      </Seccion>

      <Seccion titulo="Su primera sede">
        <CampoTexto
          nombre="sedeNombre"
          etiqueta="Nombre de la sede"
          placeholder="Sede Centro"
          ayuda="Sin sede no puede agendar nada. Las demás las añade él."
          register={register}
          errors={errors}
        />
      </Seccion>

      <Seccion titulo="El propietario">
        <CampoTexto
          nombre="propietarioNombre"
          etiqueta="Nombre"
          placeholder="Julián Restrepo"
          register={register}
          errors={errors}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            nombre="propietarioEmail"
            etiqueta="Correo"
            tipo="email"
            autoComplete="email"
            placeholder="dueno@barberia.co"
            register={register}
            errors={errors}
          />
          <CampoTexto
            nombre="propietarioTelefonoE164"
            etiqueta="Teléfono"
            tipo="tel"
            autoComplete="tel"
            placeholder="+573001112233"
            register={register}
            errors={errors}
          />
        </div>

        <CampoTexto
          nombre="propietarioContrasena"
          etiqueta="Contraseña temporal"
          autoComplete="off"
          placeholder="mínimo 12 caracteres"
          ayuda="Se la entregas al cliente junto con el enlace. Él la cambia al entrar, y a partir de ahí no vuelve a estar disponible en ningún sitio."
          register={register}
          errors={errors}
        />
      </Seccion>

      <Button type="submit" disabled={cargando} className="h-10">
        {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Crear barbería
      </Button>
    </form>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-5 first:border-0 first:pt-0">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {titulo}
      </p>
      {children}
    </section>
  )
}

interface CampoTextoProps {
  nombre: keyof DatosAltaBarberia
  etiqueta: string
  placeholder?: string
  ayuda?: string
  tipo?: string
  autoComplete?: string
  register: UseFormRegister<DatosAltaBarberia>
  errors: FieldErrors<DatosAltaBarberia>
}

/** Campo de texto del alta: etiqueta visible, ayuda persistente y error inline. */
function CampoTexto({
  nombre,
  etiqueta,
  placeholder,
  ayuda,
  tipo = "text",
  autoComplete,
  register,
  errors,
}: CampoTextoProps) {
  const error = errors[nombre]
  return (
    <Field>
      <FieldLabel htmlFor={nombre}>{etiqueta}</FieldLabel>
      <Input
        id={nombre}
        type={tipo}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        {...register(nombre)}
      />
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
