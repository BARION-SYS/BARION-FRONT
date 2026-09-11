"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, SearchX } from "lucide-react"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import {
  ConfirmacionEstado,
  type CambioEstadoPendiente,
} from "@features/plataforma/components/ConfirmacionEstado"
import { IndicadoresFicha } from "@features/plataforma/components/IndicadoresFicha"
import { PlataformaActividadChart } from "@features/plataforma/components/PlataformaActividadChart"
import { PlataformaConfiguracionCard } from "@features/plataforma/components/PlataformaConfiguracionCard"
import { PlataformaDesenlaceChart } from "@features/plataforma/components/PlataformaDesenlaceChart"
import { PlataformaDetail } from "@features/plataforma/components/PlataformaDetail"
import { PlataformaEquipoCard } from "@features/plataforma/components/PlataformaEquipoCard"
import { PlataformaFacturasList } from "@features/plataforma/components/PlataformaFacturasList"
import { PlataformaPropietarioCard } from "@features/plataforma/components/PlataformaPropietarioCard"
import { PlataformaSedesList } from "@features/plataforma/components/PlataformaSedesList"
import { PlataformaSuscripcionCard } from "@features/plataforma/components/PlataformaSuscripcionCard"
import { resumirDesenlaces } from "@features/plataforma/utils/series"
import type { EstadoBarberia } from "@features/plataforma/types/plataforma.types"

/**
 * La ficha de UNA barbería, en página propia.
 *
 * Antes era un cuadro sobre la lista; ahora tiene dirección —se comparte, se
 * abre en otra pestaña y sobrevive a una recarga—, que es lo que pide una ficha
 * a la que soporte vuelve varias veces durante una llamada.
 *
 * Cuatro lecturas en paralelo, cada una con su skeleton: la ficha (lo que se
 * pinta primero), la actividad, el catálogo de planes (para cruzar límites) y,
 * con la capacidad de cobrar, lo que Barion le ha facturado. Barion NO entra en
 * sus datos de negocio: todo lo de aquí son conteos, y sin `app.barberia_id` la
 * base no le entrega ni una cita.
 */
export default function AdminBarberiaPage() {
  const { id } = useParams<{ id: string }>()
  const {
    ficha,
    actividad,
    facturacionBarberia,
    planes,
    loadingFicha,
    loadingActividad,
    loadingFacturacion,
    loadingAction,
    error,
    fetchBarberia,
    fetchActividad,
    fetchFacturacionBarberia,
    fetchPlanes,
    handleChangeEstadoBarberia,
    limpiarFicha,
  } = usePlataforma()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "plataforma.barberias.gestionar")
  const veFacturacion = puede(sesion, "plataforma.suscripciones.gestionar")

  // Estado de UI del contenedor.
  const [ahora] = useState(() => new Date())
  // Solo se pinta cuando llega la ficha —ya en el cliente—, así que no hay
  // diferencia de hidratación que temer.
  const [origen] = useState(() => (typeof window === "undefined" ? "" : window.location.origin))
  const [cambio, setCambio] = useState<CambioEstadoPendiente | null>(null)

  useEffect(() => {
    void fetchBarberia(id)
    void fetchActividad(id)
    // Al salir se limpia: la siguiente ficha no puede arrancar enseñando esta.
    return () => limpiarFicha()
  }, [id, fetchBarberia, fetchActividad, limpiarFicha])

  useEffect(() => {
    void fetchPlanes()
  }, [fetchPlanes])

  useEffect(() => {
    if (veFacturacion) void fetchFacturacionBarberia(id)
  }, [id, veFacturacion, fetchFacturacionBarberia])

  const desenlace = useMemo(
    () => (actividad ? resumirDesenlaces(actividad.citasPorEstado) : null),
    [actividad]
  )
  const plan = useMemo(
    () => planes.find((candidato) => candidato.codigo === ficha?.suscripcion?.planCodigo) ?? null,
    [planes, ficha]
  )

  const onPedirCambio = useCallback(
    (destino: EstadoBarberia) => {
      if (!ficha) return
      setCambio({ nombre: ficha.nombreComercial, actual: ficha.estado, destino })
    },
    [ficha]
  )

  const onConfirmarCambio = useCallback(async () => {
    if (!cambio) return
    try {
      // La respuesta ES la ficha actualizada: el hook la repone sin otra lectura.
      const mensaje = await handleChangeEstadoBarberia(id, { estado: cambio.destino })
      notify.success(mensaje)
      setCambio(null)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [cambio, handleChangeEstadoBarberia, id])

  if (!ficha) {
    return (
      <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
        {!loadingFicha && error ? (
          <div className="flex flex-col items-start gap-4">
            <SinDatos
              titulo="No encontramos esta barbería"
              detalle={error}
              icono={SearchX}
              alto={220}
            />
            <Button variant="outline" render={<Link href="/admin/barberias" />}>
              <ArrowLeft className="size-4" aria-hidden />
              Volver al inventario
            </Button>
          </div>
        ) : (
          <>
            <DataSkeleton variant="card" />
            <DataSkeleton variant="stats" count={4} />
            <DataSkeleton variant="chart" />
          </>
        )}
      </main>
    )
  }

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <PlataformaDetail ficha={ficha} gestiona={gestiona} onCambiarEstado={onPedirCambio} />

      <IndicadoresFicha
        ficha={ficha}
        semanas={actividad?.serieSemanal ?? null}
        desenlace={desenlace}
        ventanaDias={actividad?.ventanaDias ?? 90}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <PlataformaActividadChart
            semanas={actividad?.serieSemanal ?? null}
            loading={loadingActividad}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <PlataformaDesenlaceChart
              desenlace={desenlace}
              ventanaDias={actividad?.ventanaDias ?? 90}
              loading={loadingActividad}
            />
            <PlataformaSedesList sedes={actividad?.sedes ?? null} loading={loadingActividad} />
          </div>
          {veFacturacion && (
            <PlataformaFacturasList
              facturacion={facturacionBarberia}
              loading={loadingFacturacion}
              ahora={ahora}
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <PlataformaSuscripcionCard ficha={ficha} plan={plan} />
          <PlataformaPropietarioCard propietario={ficha.propietario} />
          <PlataformaEquipoCard equipo={actividad?.equipo ?? null} loading={loadingActividad} />
          <PlataformaConfiguracionCard ficha={ficha} origen={origen} />
        </aside>
      </div>

      <ConfirmacionEstado
        cambio={cambio}
        cargando={loadingAction}
        onConfirmar={() => void onConfirmarCambio()}
        onCerrar={() => setCambio(null)}
      />
    </main>
  )
}
