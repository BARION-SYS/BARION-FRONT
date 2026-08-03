"use client"

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
  onAnonimizar: () => void
  onConsentimiento: (tipo: TipoConsentimiento, otorgado: boolean) => void
}

const CANALES: { tipo: TipoConsentimiento; etiqueta: string }[] = [
  { tipo: "marketing_whatsapp", etiqueta: "WhatsApp" },
  { tipo: "marketing_sms", etiqueta: "SMS" },
  { tipo: "marketing_email", etiqueta: "Correo" },
  { tipo: "tratamiento_datos", etiqueta: "Tratamiento de datos" },
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
  onAnonimizar,
  onConsentimiento,
}: ClientesDetailProps) {
  const { dinero, numero, fecha, relativo } = useFormato()
  const anonimizado = cliente.estado === "anonimizado"

  const vigente = (tipo: TipoConsentimiento) =>
    consentimientos?.vigentes.find((v) => v.tipo === tipo)?.otorgado ?? false

  // De dónde sale la etiqueta. Sin esto es una palabra pegada al nombre y nadie
  // sabe si la puso el sistema, un compañero o nadie.
  const origenEtiqueta = segmentoEtiqueta
    ? [
        segmentoEtiqueta.descripcion,
        segmentoEtiqueta.tipo === "dinamico"
          ? "Se rehace cada noche a partir de sus citas."
          : "La mantiene el equipo a mano.",
      ]
        .filter(Boolean)
        .join(" ")
    : null

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        titulo="Ficha"
        accion={
          anonimizado ? undefined : (
            <div className="flex gap-2">
              {gestiona && (
                <Button type="button" size="sm" variant="outline" onClick={onEditar}>
                  Editar
                </Button>
              )}
              {puedeAnonimizar && (
                <Button type="button" size="sm" variant="destructive" onClick={onAnonimizar}>
                  Anonimizar
                </Button>
              )}
            </div>
          )
        }
      >
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
                  ? "Correo verificado"
                  : "Teléfono verificado"
                : "Sin verificar"
            }
            icono={cliente.verificado ? ShieldCheck : ShieldAlert}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard titulo="Visitas" valor={numero(cliente.totalVisitas)} icono={Scissors} />
          <StatCard
            titulo="Gastado"
            valor={dinero(Number(cliente.totalGastadoCentavos))}
            icono={Wallet}
          />
          <StatCard
            titulo="Última visita"
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

      <SectionCard
        titulo="Permisos de comunicación"
        subtitulo="Cada cambio se guarda como un registro nuevo: es la prueba de cuándo lo dio"
      >
        <Loadable loading={cargandoFicha} variant="form">
          <ul className="flex flex-col gap-2">
            {CANALES.map((canal) => (
              <li
                key={canal.tipo}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <label htmlFor={canal.tipo} className="text-sm">
                  {canal.etiqueta}
                </label>
                <Switch
                  id={canal.tipo}
                  checked={vigente(canal.tipo)}
                  disabled={!gestiona || anonimizado}
                  onCheckedChange={(valor) => onConsentimiento(canal.tipo, valor)}
                  aria-label={canal.etiqueta}
                />
              </li>
            ))}
          </ul>
        </Loadable>
      </SectionCard>

      <SectionCard titulo="Historial" subtitulo="Sus visitas, con lo que se cobró en cada una">
        <Loadable
          loading={cargandoFicha}
          isEmpty={historial.length === 0}
          variant="list"
          emptyState={
            <p className="py-8 text-center text-sm text-muted-foreground">Todavía no ha venido.</p>
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
                      "Sin servicios"}
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
