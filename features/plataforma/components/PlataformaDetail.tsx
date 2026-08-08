"use client"

import {
  Activity,
  Building2,
  CalendarClock,
  Coins,
  Globe,
  MapPin,
  MoonStar,
  Scissors,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import { EnlaceCopiable } from "@shared/components/enlaces/EnlaceCopiable"
import {
  ESTADO_BARBERIA,
  MOTIVO_TRANSICION,
  TRANSICIONES_ESTADO,
  etiquetaSuscripcion,
  nombreDePais,
} from "@features/plataforma/utils/inventario"
import type { BarberiaFicha, EstadoBarberia } from "@features/plataforma/types/plataforma.types"

interface PlataformaDetailProps {
  ficha: BarberiaFicha | null
  loading: boolean
  /** Sin `plataforma.barberias.gestionar` la ficha se lee, no se toca. */
  gestiona: boolean
  cargandoAccion: boolean
  onCambiarEstado: (estado: EstadoBarberia) => void
}

/**
 * La ficha de una barbería: lo que la fila de la tabla no cabe.
 *
 * Es la única lectura del área que dice cómo está montada por dentro —su huso,
 * su moneda, cuánta prueba le queda— y por eso también es el sitio donde se
 * cambia su estado: decidir suspender mirando una fila de tabla es decidir sin
 * mirar. Barion NO entra en sus datos de negocio: sin `app.barberia_id` la base
 * no le entrega ni una cita, y esta pantalla no lo pretende.
 */
export function PlataformaDetail({
  ficha,
  loading,
  gestiona,
  cargandoAccion,
  onCambiarEstado,
}: PlataformaDetailProps) {
  const { fechaCorta, numero, relativo } = useFormato()

  if (loading || !ficha) return <DataSkeleton variant="form" count={5} />

  const estado = ESTADO_BARBERIA[ficha.estado]
  const origen = typeof window === "undefined" ? "" : window.location.origin

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start gap-3">
        <InitialsAvatar iniciales={inicialesDe(ficha.nombreComercial)} tamano="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{ficha.nombreComercial}</p>
          <p className="truncate text-xs text-muted-foreground">/{ficha.slug}</p>
        </div>
        <StatusBadge tono={estado.tono} etiqueta={estado.etiqueta} />
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Dato icono={Globe} etiqueta="País" valor={nombreDePais(ficha.codigoPais)} />
        <Dato icono={Coins} etiqueta="Moneda" valor={ficha.monedaPorDefecto} />
        <Dato icono={MapPin} etiqueta="Huso horario" valor={ficha.zonaHoraria} />
        <Dato icono={Building2} etiqueta="Sedes activas" valor={numero(ficha.sedesActivas)} />
        <Dato icono={Scissors} etiqueta="Barberos activos" valor={numero(ficha.barberosActivos)} />
        <Dato icono={Users} etiqueta="Cuentas con acceso" valor={numero(ficha.membresiasActivas)} />
        <Dato icono={CalendarClock} etiqueta="Alta" valor={fechaCorta(ficha.creadoEn)} />
        <Dato
          icono={CalendarClock}
          etiqueta="Prueba termina"
          // Sin fecha no se pinta un cero ni un «hoy»: no hay prueba corriendo.
          valor={ficha.pruebaTerminaEn ? fechaCorta(ficha.pruebaTerminaEn) : "—"}
        />
        <Dato
          icono={Coins}
          etiqueta="Plan"
          valor={ficha.suscripcion?.planCodigo ?? "Sin plan"}
          nota={
            ficha.suscripcion ? etiquetaSuscripcion(ficha.suscripcion.estado) : "Sin suscripción"
          }
        />
      </dl>

      {/* Cuánto se usa, en conteos. Barion sabe CUÁNTA clientela sostiene una
          barbería —es lo que dice si su plan se le queda corto o si lleva tres
          meses parada— y no QUIÉN la compone: la api no publica ninguna ruta que
          devuelva esas filas, y esa raya está escrita en `02-rls.sql` */}
      <section className="flex flex-col gap-3 border-t border-border pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Cómo la usan
          </p>
          {ficha.uso.citas30d === 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-(--advertencia)">
              <MoonStar className="size-3.5" aria-hidden />
              Sin actividad en 30 días
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Dato
            icono={Users}
            etiqueta="Clientes"
            valor={numero(ficha.uso.clientesTotal)}
            nota={`${numero(ficha.uso.clientesNuevos30d)} nuevos en 30 días`}
          />
          <Dato
            icono={CalendarClock}
            etiqueta="Citas · 30 d"
            valor={numero(ficha.uso.citas30d)}
            nota={`${numero(ficha.uso.citasTotal)} en total`}
          />
          <Dato
            icono={Activity}
            etiqueta="Última cita"
            // «Nunca» y no un guion: que jamás se haya creado una cita es un
            // dato, y el guion se lee como «no lo sabemos».
            valor={ficha.uso.ultimaCitaCreadaEn ? relativo(ficha.uso.ultimaCitaCreadaEn) : "Nunca"}
            nota="Cuándo se agendó, no cuándo ocurre"
          />
        </dl>
      </section>

      {/* El propietario es la contraparte del contrato con Barion —a quien se le
          cobra y a quien llama soporte—, no un cliente de la barbería. Por eso
          sale con su contacto mientras que de la clientela solo salen conteos */}
      <section className="flex flex-col gap-3 border-t border-border pt-5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Propietario
        </p>

        {ficha.propietario ? (
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
            <InitialsAvatar iniciales={inicialesDe(ficha.propietario.nombre)} />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-medium">{ficha.propietario.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">
                {ficha.propietario.email ?? "Sin correo"}
                {ficha.propietario.telefonoE164 ? ` · ${ficha.propietario.telefonoE164}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {ficha.propietario.ultimoAccesoEn
                  ? `Último acceso ${relativo(ficha.propietario.ultimoAccesoEn)}`
                  : "No ha entrado nunca"}
                {" · "}
                {/* Sin proveedor vinculado entra con contraseña. Se dice para que
                    soporte no mande a restablecer una clave que nunca puso quien
                    abrió su barbería con Google */}
                {ficha.propietario.proveedores.length > 0
                  ? `Entra con ${ficha.propietario.proveedores.join(", ")}`
                  : "Entra con correo y contraseña"}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] px-3 py-2 text-xs text-foreground">
            Esta barbería no tiene ninguna cuenta de propietario activa. Nadie puede administrarla.
          </p>
        )}
      </section>

      <div className="flex flex-col gap-4 border-t border-border pt-5">
        <EnlaceCopiable
          etiqueta="Portal público de reservas"
          descripcion="Lo que ven sus clientes. Es también el destino de su código QR"
          valor={`${origen}/b/${ficha.slug}`}
        />
        <EnlaceCopiable
          etiqueta="Entrada de su equipo"
          descripcion="Por aquí entran el propietario y sus barberos"
          valor={`${origen}/b/${ficha.slug}/entrar`}
        />
      </div>

      {gestiona && (
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Cambiar estado
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {TRANSICIONES_ESTADO[ficha.estado].map((destino) => (
              <Button
                key={destino}
                type="button"
                variant={destino === "suspendida" ? "destructive" : "outline"}
                disabled={cargandoAccion}
                onClick={() => onCambiarEstado(destino)}
                className="h-auto flex-1 flex-col items-start gap-0.5 py-2 text-left"
              >
                <span className="text-sm font-medium">
                  Pasar a {ESTADO_BARBERIA[destino].etiqueta.toLowerCase()}
                </span>
                <span className="text-[11px] font-normal opacity-80">
                  {MOTIVO_TRANSICION[destino]}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface DatoProps {
  icono: LucideIcon
  etiqueta: string
  valor: string
  nota?: string
}

function Dato({ icono: Icono, etiqueta, valor, nota }: DatoProps) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">
        <Icono className="size-3" aria-hidden />
        {etiqueta}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium capitalize">{valor}</dd>
      {nota && <p className="text-[11px] text-muted-foreground">{nota}</p>}
    </div>
  )
}
