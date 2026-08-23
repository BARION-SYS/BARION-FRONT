"use client"

import { useState } from "react"

import {
  CalendarClock,
  Mail,
  Phone,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { StatCard } from "@shared/components/stats/StatCard"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Switch } from "@shared/components/ui/switch"
import { InfoTooltip } from "@shared/components/tooltips/InfoTooltip"
import { useFormato } from "@shared/hooks/useFormato"
import { useTextos } from "@shared/textos/useTextos"
import { inicialesDe } from "@shared/utils/iniciales"
import type {
  Cliente,
  Consentimientos,
  Segmento,
  TipoConsentimiento,
  Visita,
} from "@features/clientes/types/clientes.types"

interface ClientesDetailProps {
  cliente: Cliente
  /** El segmento del que sale la etiqueta, para poder decir de dónde viene. */
  segmentoEtiqueta: Segmento | null
  historial: Visita[]
  consentimientos: Consentimientos | null
  cargandoFicha: boolean
  gestiona: boolean
  /** `clientes.anonimizar`: es otra capacidad, y más grave. */
  puedeAnonimizar: boolean
  onEditar: () => void
  /** Cerrarle la reserva en línea, o levantársela antes de tiempo. */
  onBloquear: () => void
  onDesbloquear: () => void
  onAnonimizar: () => void
  onConsentimiento: (tipo: TipoConsentimiento, otorgado: boolean) => void
}

/**
 * Los cuatro consentimientos, en el orden en que se piden.
 *
 * La LISTA y su orden son estructura y no cambian con el idioma; cómo se llama
 * cada uno sale del diccionario dentro del componente. A nivel de módulo no
 * alcanza ningún hook, que es lo que obligaba a tener el español aquí.
 */
const CANALES: readonly TipoConsentimiento[] = [
  "marketing_whatsapp",
  "marketing_sms",
  "marketing_email",
  "tratamiento_datos",
]

/**
 * La ficha: quién es, cuánto vale, qué permisos dio y qué se le ha hecho.
 *
 * Las cifras —visitas, gasto, última visita— las mantiene la agenda al cerrar
 * cada cita: aquí no se suman a partir del historial, que solo trae una página.
 */
export function ClientesDetail({
  cliente,
  segmentoEtiqueta,
  historial,
  consentimientos,
  cargandoFicha,
  gestiona,
  puedeAnonimizar,
  onEditar,
  onBloquear,
  onDesbloquear,
  onConsentimiento,
  onAnonimizar,
}: ClientesDetailProps) {
  const t = useTextos("clientes")

  /**
   * El nombre de cada consentimiento, por su clave del contrato.
   *
   * Mapa explícito y no `t("detalle")[canal]`: un consentimiento nuevo en la api
   * **no compila** hasta tener su texto en los tres idiomas, que es para lo que
   * existe el diccionario tipado.
   */
  const etiquetaCanal = (canal: TipoConsentimiento): string => {
    switch (canal) {
      case "marketing_whatsapp":
        return t("detalle.whatsapp")
      case "marketing_sms":
        return t("detalle.sms")
      case "marketing_email":
        return t("detalle.correo")
      case "tratamiento_datos":
        return t("detalle.tratamiento")
    }
  }

  const { dinero, numero, fecha, relativo } = useFormato()
  const anonimizado = cliente.estado === "anonimizado"
  // El reloj se lee UNA vez al montar y no en cada render: leerlo mientras se
  // pinta es impuro —la misma pantalla daría resultados distintos— y el lint lo
  // rechaza con razón. Un minuto de desfase no cambia nada aquí.
  const [ahora] = useState(() => Date.now())
  // Vencido cuenta como no bloqueado: la fecha caduca sola, que es lo que
  // impide que un bloqueo se convierta en una expulsión por olvido.
  const bloqueado = !!cliente.bloqueadoHasta && new Date(cliente.bloqueadoHasta).getTime() > ahora

  const vigente = (tipo: TipoConsentimiento) =>
    consentimientos?.vigentes.find((v) => v.tipo === tipo)?.otorgado ?? false

  // De dónde sale la etiqueta. Sin esto es una palabra pegada al nombre y nadie
  // sabe si la puso el sistema, un compañero o nadie.
  const origenEtiqueta = segmentoEtiqueta
    ? [
        segmentoEtiqueta.descripcion,
        segmentoEtiqueta.tipo === "dinamico"
          ? t("detalle.etiquetaAyuda")
          : t("detalle.etiquetaManualAyuda"),
      ]
        .filter(Boolean)
        .join(" ")
    : null

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        titulo={t("detalle.ficha")}
        accion={
          anonimizado ? undefined : (
            <div className="flex gap-2">
              {gestiona && (
                <Button type="button" size="sm" variant="outline" onClick={onEditar}>
                  Editar
                </Button>
              )}
              {gestiona &&
                (bloqueado ? (
                  <Button type="button" size="sm" variant="outline" onClick={onDesbloquear}>
                    Levantar bloqueo
                  </Button>
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={onBloquear}>
                    Bloquear reserva
                  </Button>
                ))}
              {puedeAnonimizar && (
                <Button type="button" size="sm" variant="destructive" onClick={onAnonimizar}>
                  Anonimizar
                </Button>
              )}
            </div>
          )
        }
      >
        {bloqueado && cliente.bloqueadoHasta && (
          <p className="mb-4 rounded-lg border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("detalle.noReservaEnLinea")}</span>{" "}
            hasta el {fecha(cliente.bloqueadoHasta)}. Sus citas actuales siguen en pie y la barbería
            puede seguir citándolo a mano.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <InitialsAvatar
            iniciales={inicialesDe(`${cliente.nombre} ${cliente.apellido ?? ""}`)}
            tamano="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-base font-semibold">
              {cliente.nombre} {cliente.apellido}
              {cliente.etiqueta && (
                <InfoTooltip contenido={origenEtiqueta} activo={Boolean(origenEtiqueta)}>
                  <span>
                    <StatusBadge tono="primario" etiqueta={cliente.etiqueta.nombre} compacta />
                  </span>
                </InfoTooltip>
              )}
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" aria-hidden />
                {cliente.telefonoE164}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" aria-hidden />
                {cliente.email}
              </span>
              {cliente.barberoFavorito && (
                <span>Se atiende con {cliente.barberoFavorito.nombrePublico}</span>
              )}
            </p>
          </div>

          {/* No es un adorno: sin canal probado no hay campaña que llegue ni
              reserva que él pueda hacer solo. Verificado = correo (el canal de
              hoy) o teléfono, para quien pasó el OTP cuando salía por SMS. */}
          <StatusBadge
            tono={cliente.verificado ? "exito" : "advertencia"}
            etiqueta={
              cliente.verificado
                ? cliente.emailVerificado
                  ? t("detalle.correoVerificado")
                  : t("detalle.telefonoVerificado")
                : t("detalle.sinVerificar")
            }
            icono={cliente.verificado ? ShieldCheck : ShieldAlert}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            titulo={t("detalle.visitas")}
            valor={numero(cliente.totalVisitas)}
            icono={Scissors}
          />
          <StatCard
            titulo={t("detalle.gastado")}
            valor={dinero(Number(cliente.totalGastadoCentavos))}
            icono={Wallet}
          />
          <StatCard
            titulo={t("detalle.ultimaVisita")}
            valor={cliente.ultimaVisitaEn ? relativo(cliente.ultimaVisitaEn) : "—"}
            icono={CalendarClock}
          />
        </div>

        {cliente.notas && (
          <p className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            {cliente.notas}
          </p>
        )}
      </SectionCard>

      <SectionCard titulo={t("detalle.permisos")} subtitulo={t("detalle.consentimientoAyuda")}>
        <Loadable loading={cargandoFicha} variant="form">
          <ul className="flex flex-col gap-2">
            {CANALES.map((canal) => (
              <li
                key={canal}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <label htmlFor={canal} className="text-sm">
                  {etiquetaCanal(canal)}
                </label>
                <Switch
                  id={canal}
                  checked={vigente(canal)}
                  disabled={!gestiona || anonimizado}
                  onCheckedChange={(valor) => onConsentimiento(canal, valor)}
                  aria-label={etiquetaCanal(canal)}
                />
              </li>
            ))}
          </ul>
        </Loadable>
      </SectionCard>

      <SectionCard titulo={t("detalle.historial")} subtitulo={t("detalle.historialAyuda")}>
        <Loadable
          loading={cargandoFicha}
          isEmpty={historial.length === 0}
          variant="list"
          emptyState={
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("detalle.sinVisitasDetalle")}
            </p>
          }
        >
          <ul className="flex flex-col gap-2">
            {historial.map((visita) => (
              <li
                key={visita.citaId}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {visita.servicios.map((servicio) => servicio.nombre).join(" + ") ||
                      t("detalle.sinServicios")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {fecha(visita.iniciaEn)}
                    {visita.barbero ? ` · ${visita.barbero.nombrePublico}` : ""}
                  </p>
                </div>
                {/* Congelado en la cita: cambiar el precio hoy no reescribe
                    lo que se cobró entonces. */}
                <span className="text-sm">{dinero(Number(visita.precioCentavos))}</span>
              </li>
            ))}
          </ul>
        </Loadable>
      </SectionCard>
    </div>
  )
}
