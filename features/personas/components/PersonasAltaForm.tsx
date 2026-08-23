"use client"

import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Scissors } from "lucide-react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@shared/components/ui/field"
import { Input } from "@shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select"
import { Switch } from "@shared/components/ui/switch"
import {
  esquemaAltaPersona,
  type DatosAltaPersona,
} from "@features/personas/schemas/personas.schema"
import { CampoTelefono } from "@shared/components/forms/CampoTelefono"
import { useTenant } from "@shared/providers/TenantProvider"
import type { Rol } from "@features/roles/types/roles.types"
import type { Sede } from "@features/sedes/types/sedes.types"
import { useTextos } from "@shared/textos/useTextos"

/**
 * El botón que envía vive en el pie del panel, fuera del `<form>`. Se atan por
 * este id — el atributo `form` de HTML—, que es lo que deja el pie fijo sin
 * meter la mutación dentro del formulario.
 */
export const ID_FORM_ALTA_PERSONA = "form-alta-persona"

/** El formulario pide porcentaje; la API guarda puntos base. */
const BPS_POR_PUNTO = 100

/** Centinela de «sin sede»: un select no sabe representar `undefined`. */
const TODAS_LAS_SEDES = "todas"

interface PersonasAltaFormProps {
  roles: Rol[]
  sedes: Sede[]
  /** Sede activa del panel: la persona nace donde se está trabajando. */
  sedeActualId?: string
  onSubmit: (datos: DatosAltaPersona) => Promise<void>
}

/**
 * Agregar una persona: un formulario, y **quien atiende, entra**.
 *
 * Se lee de arriba abajo como tres preguntas, y ese orden es la explicación:
 * **quién es**, **su acceso** —porque siempre se crea cuenta, y por eso el
 * correo y el teléfono son la credencial y el canal, no un contacto opcional— y
 * **qué hace aquí**, que empieza por el rol porque el rol decide el resto.
 *
 * Agregar a alguien con agenda y sin cuenta se retiró: un barbero que no entra
 * no gestiona su agenda —la gestiona el propietario por él— y eso vacía lo que
 * el producto vende.
 *
 * Lo único que queda por decidir es si además atiende, y **eso lo acota el
 * rol**, que llega en el contrato (`Rol.agenda`): con `siempre` el interruptor
 * se enseña encendido y bloqueado, con `opcional` se puede marcar, y con
 * `nunca` ni siquiera aparece. El formulario no deja construir un estado que la
 * api tenga que rechazar con un 422.
 */
export function PersonasAltaForm({ roles, sedes, sedeActualId, onSubmit }: PersonasAltaFormProps) {
  const t = useTextos("personas.alta")
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosAltaPersona>({
    resolver: standardSchemaResolver(esquemaAltaPersona),
    defaultValues: {
      nombre: "",
      email: "",
      telefonoE164: "",
      // El rol NACE VACÍO, y es deliberado. Preseleccionaba el primero del
      // catálogo, que llega ordenado de mayor a menor: un alta despachada
      // deprisa concedía «propietario» sin que nadie lo hubiera elegido. Elegir
      // quién manda en la barbería no puede ser lo que pasa si no tocas nada.
      rol: "",
      contrasenaInicial: "",
      atiende: false,
      sedeId: sedeActualId,
    },
  })

  const { region } = useTenant()

  // Las etiquetas que el disparador del select tiene que enseñar, con el
  // centinela incluido: sin esta lista pinta el valor crudo.
  const opcionesDeSede = useMemo(
    () => [
      { value: TODAS_LAS_SEDES, label: t("todasLasSedes") },
      ...sedes.map((sede) => ({ value: sede.id, label: sede.nombre })),
    ],
    [sedes]
  )

  const codigoRol = watch("rol")
  const marcado = watch("atiende")
  const rolElegido = roles.find((rol) => rol.codigo === codigoRol)
  const agendaDelRol = rolElegido?.agenda ?? "opcional"
  const atiende = agendaDelRol === "siempre" || (agendaDelRol === "opcional" && marcado)

  /**
   * Lo que se envía es lo que la pantalla enseña, no lo que quedó guardado
   * debajo: con un rol que atiende siempre, el interruptor está encendido y
   * bloqueado aunque el campo siga en `false`. Y la comisión solo viaja con la
   * ficha — sin ella no hay acuerdo que pactar.
   */
  const enviar = (datos: DatosAltaPersona) =>
    onSubmit({
      ...datos,
      atiende,
      comisionBps: atiende ? datos.comisionBps : undefined,
    })

  return (
    <form
      id={ID_FORM_ALTA_PERSONA}
      onSubmit={(e) => void handleSubmit(enviar)(e)}
      className="flex flex-col gap-8"
    >
      <FieldSet>
        <FieldLegend variant="label">{t("quienEs")}</FieldLegend>
        <Field data-invalid={!!errors.nombre}>
          <FieldLabel htmlFor="nombre">{t("nombre")}</FieldLabel>
          <Input
            id="nombre"
            placeholder={t("nombreEjemplo")}
            aria-invalid={!!errors.nombre}
            {...register("nombre")}
          />
          <FieldError errors={[errors.nombre]} />
        </Field>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t("suAcceso")}</FieldLegend>
        <FieldDescription>
          Agregar a alguien crea siempre su cuenta en Barion: el correo es su usuario.
        </FieldDescription>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">{t("correo")}</FieldLabel>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="carlos@elcorte.co"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldDescription>{t("correoAyuda")}</FieldDescription>
            <FieldError errors={[errors.email]} />
          </Field>

          {/*
            El teléfono en dos piezas y con el indicativo FIJO al país de la
            barbería. Antes era un campo suelto que pedía el E.164 entero
            (`+573001112233`): quien da de alta a su equipo teclea `3207512575`,
            que es su número de siempre, y el alta fallaba con un mensaje sobre
            un formato que nadie tiene por qué conocer.
          */}
          <Controller
            control={control}
            name="telefonoE164"
            render={({ field }) => (
              <Field data-invalid={!!errors.telefonoE164}>
                <FieldLabel htmlFor="telefonoE164">{t("telefono")}</FieldLabel>
                <CampoTelefono
                  id="telefonoE164"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  paisSugerido={region}
                  prefijoFijo
                  invalido={!!errors.telefonoE164}
                />
                <FieldDescription>
                  Para llamarle, no para entrar. Si el número ya está en otra cuenta de Barion,
                  déjalo vacío.
                </FieldDescription>
                <FieldError errors={[errors.telefonoE164]} />
              </Field>
            )}
          />
        </div>

        <Field data-invalid={!!errors.contrasenaInicial}>
          <FieldLabel htmlFor="contrasenaInicial">{t("contrasenaInicial")}</FieldLabel>
          <Input
            id="contrasenaInicial"
            type="text"
            autoComplete="off"
            placeholder={t("contrasenaAyuda")}
            aria-invalid={!!errors.contrasenaInicial}
            {...register("contrasenaInicial")}
          />
          {/* Regla que nadie puede deducir: se enseña una vez y no hay dónde reconsultarla. */}
          <FieldDescription>
            Se enseña <span className="font-medium text-foreground">una sola vez</span> al terminar
            y después no se puede volver a consultar, solo generar otra.
          </FieldDescription>
          <FieldError errors={[errors.contrasenaInicial]} />
        </Field>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t("queHaceAqui")}</FieldLegend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="rol"
            render={({ field }) => (
              <Field data-invalid={!!errors.rol}>
                <FieldLabel htmlFor="rol">Rol</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="rol" className="w-full">
                    <SelectValue placeholder={t("eligeUnRol")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol.id} value={rol.codigo}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.rol]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="sedeId"
            render={({ field }) => (
              <Field data-invalid={!!errors.sedeId}>
                <FieldLabel htmlFor="sedeId">{t("sede")}</FieldLabel>
                {/*
                  «Todas las sedes» necesita su propia opción, con un centinela.
                  Sin ella la ayuda prometía el itinerante y no había forma de
                  llegar: el campo nace con la sede activa del panel, y un select
                  no tiene manera de volver a vacío. Mismo centinela que usa el
                  formulario de servicios, que ya resolvía esto.
                */}
                {/*
                  `items` manda sobre la etiqueta que deriva el disparador. Sin
                  él, un valor que todavía no está en la lista —el store de sedes
                  aún no cargó— se pintaba TAL CUAL: un uuid en mitad del
                  formulario.
                */}
                <Select
                  value={field.value ?? TODAS_LAS_SEDES}
                  items={opcionesDeSede}
                  onValueChange={(valor) =>
                    field.onChange(valor === TODAS_LAS_SEDES ? undefined : valor)
                  }
                >
                  <SelectTrigger id="sedeId" className="w-full">
                    <SelectValue placeholder={t("todasLasSedes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODAS_LAS_SEDES}>{t("todasLasSedes")}</SelectItem>
                    {sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.sedeId]} />
              </Field>
            )}
          />
        </div>

        {agendaDelRol !== "nunca" && (
          <Controller
            control={control}
            name="atiende"
            render={({ field }) => (
              <section className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <Scissors
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <FieldLabel htmlFor="atiende" className="text-sm font-medium">
                        Atiende clientes
                      </FieldLabel>
                      <FieldDescription className="mt-1">
                        {agendaDelRol === "siempre"
                          ? `Lo decide el rol: ${rolElegido?.nombre ?? "este rol"} siempre atiende, y eso no se puede quitar.`
                          : t("atiendeAyuda")}
                      </FieldDescription>
                    </div>
                  </div>
                  <Switch
                    id="atiende"
                    checked={atiende}
                    disabled={agendaDelRol === "siempre"}
                    onCheckedChange={field.onChange}
                    aria-label={t("atiende")}
                  />
                </div>

                {atiende && (
                  <div className="border-t border-border pt-4">
                    <Field data-invalid={!!errors.comisionBps}>
                      <FieldLabel htmlFor="comisionBps">{t("comision")}</FieldLabel>
                      <Input
                        id="comisionBps"
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        placeholder="50"
                        aria-invalid={!!errors.comisionBps}
                        {...register("comisionBps", {
                          // Puntos base hacia la API; quien lo llena piensa en "50 %".
                          setValueAs: (valor: string) =>
                            valor === "" ? undefined : Number(valor) * BPS_POR_PUNTO,
                        })}
                      />
                      <FieldDescription>{t("comisionAyuda")}</FieldDescription>
                      <FieldError errors={[errors.comisionBps]} />
                    </Field>
                  </div>
                )}
              </section>
            )}
          />
        )}
      </FieldSet>
    </form>
  )
}
