"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { NominaBarberoCard } from "@features/nomina/components/NominaBarberoCard"
import { NominaBarberoDetail } from "@features/nomina/components/NominaBarberoDetail"
import { ID_FORM_AJUSTE, NominaAjusteForm } from "@features/nomina/components/NominaAjusteForm"
import { puede } from "@features/auth/utils/permisos"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import type { DatosAjuste } from "@features/nomina/schemas/nomina.schema"
import { NominaResumen } from "@features/nomina/components/NominaResumen"
import { useNomina } from "@features/nomina/hooks/useNomina"
import type { PeriodoNomina } from "@features/nomina/types/nomina.types"
import {
  PERIODOS_NOMINA,
  participacionDe,
  rangoDe,
  totalesDe,
} from "@features/nomina/utils/periodo"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { useFormato } from "@shared/hooks/useFormato"
import { useSedeActual } from "@store/sede.store"

/**
 * La nómina.
 *
 * Tres cosas que esta pantalla da por buenas porque las decide la api:
 *
 * - **Un período es un filtro de fechas.** No hay liquidación que abrir ni que
 *   cerrar, así que las pestañas solo componen un `desde`/`hasta`.
 * - **Un endpoint, dos alcances.** Con `ganancias.ver_propias` la api devuelve
 *   una sola fila —la suya—, así que esta MISMA pantalla es el "cuánto llevo"
 *   del barbero. No hay vista aparte que mantener.
 * - **El ledger es inmutable.** No hay nada que editar aquí: los asientos los
 *   escribe la agenda al cerrar una cita.
 */
export default function NominaPage() {
  const {
    resumen,
    asientos,
    loadingResumen,
    loadingAsientos,
    loadingAction,
    error,
    fetchResumen,
    fetchAsientos,
    handleCreateAjuste,
  } = useNomina()

  const sesion = useAuthStore((estado) => estado.sesion)
  const puedeAjustar = puede(sesion, "ganancias.ajustar")

  const sedeActual = useSedeActual()
  const { timezone, moneda, aCentavos } = useFormato()

  const [periodo, setPeriodo] = useState<PeriodoNomina>("semana")
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string | null>(null)
  const [ajustando, setAjustando] = useState(false)

  const rango = useMemo(
    () => rangoDe(periodo, timezone, sedeActual?.inicioSemana ?? 1),
    [periodo, timezone, sedeActual?.inicioSemana]
  )

  useEffect(() => {
    fetchResumen(rango)
  }, [fetchResumen, rango])

  const seleccionado =
    resumen.find((fila) => fila.barberoId === barberoSeleccionado) ?? resumen[0] ?? null
  const idSeleccionado = seleccionado?.barberoId ?? null

  // El detalle se pide por barbero: con `ganancias.ver_propias` la api ignora el
  // filtro y devuelve lo suyo igual, así que sirve para los dos alcances.
  useEffect(() => {
    if (!idSeleccionado) return
    fetchAsientos({ ...rango, barberoId: idSeleccionado })
  }, [fetchAsientos, rango, idSeleccionado])

  const totales = totalesDe(resumen)
  const etiquetaPeriodo = PERIODOS_NOMINA.find((opcion) => opcion.valor === periodo)?.etiqueta ?? ""

  const onAjustar = useCallback(
    async (datos: DatosAjuste) => {
      try {
        // La conversión a centavos vive aquí: la moneda es de la sede y quien
        // la conoce es la pantalla. El signo se conserva — negativo descuenta.
        notify.success(
          await handleCreateAjuste({
            barberoId: datos.barberoId,
            montoCentavos: aCentavos(Number(datos.monto)),
            moneda,
            motivo: datos.motivo,
            ganadoEn: datos.ganadoEn,
          })
        )
        setAjustando(false)
        // Las dos lecturas: el ajuste mueve el total del resumen y añade un
        // asiento al detalle.
        void fetchResumen(rango)
        if (idSeleccionado) void fetchAsientos({ ...rango, barberoId: idSeleccionado })
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleCreateAjuste, moneda, aCentavos, fetchResumen, fetchAsientos, rango, idSeleccionado]
  )

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      <Tabs value={periodo} onValueChange={(valor) => setPeriodo(valor as PeriodoNomina)}>
        <TabsList className="group-data-horizontal/tabs:h-9">
          {PERIODOS_NOMINA.map((opcion) => (
            <TabsTrigger
              key={opcion.valor}
              value={opcion.valor}
              className="cursor-pointer px-3 text-xs"
            >
              {opcion.etiqueta}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {loadingResumen && resumen.length === 0 ? (
        <div className="space-y-6">
          <DataSkeleton variant="stats" count={4} />
          <DataSkeleton variant="list" count={3} />
        </div>
      ) : resumen.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Todavía no hay nada liquidado en este periodo. Una cita suma cuando se completa.
        </p>
      ) : (
        <>
          <section aria-label="Resumen de nómina">
            <NominaResumen totales={totales} />
          </section>

          <section
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
            aria-label="Nómina por barbero"
          >
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Equipo</h2>
              {resumen.map((fila) => (
                <NominaBarberoCard
                  key={`${fila.barberoId}-${fila.moneda}`}
                  fila={fila}
                  participacion={participacionDe(
                    fila.produccionCentavos,
                    totales.produccionCentavos
                  )}
                  seleccionado={fila.barberoId === idSeleccionado}
                  onSeleccionar={() => setBarberoSeleccionado(fila.barberoId)}
                />
              ))}
            </div>
            <div className="lg:col-span-2">
              {seleccionado && (
                <NominaBarberoDetail
                  fila={seleccionado}
                  asientos={asientos}
                  loadingAsientos={loadingAsientos}
                  etiquetaPeriodo={etiquetaPeriodo}
                  puedeAjustar={puedeAjustar}
                  onAjustar={() => setAjustando(true)}
                />
              )}
            </div>
          </section>
        </>
      )}
      <Modal
        open={ajustando}
        onOpenChange={(abierto) => !abierto && setAjustando(false)}
        size="sm"
        titulo="Ajustar la nómina"
        footer={
          <>
            <Button variant="outline" onClick={() => setAjustando(false)} disabled={loadingAction}>
              Cancelar
            </Button>
            <Button type="submit" form={ID_FORM_AJUSTE} disabled={loadingAction}>
              Guardar ajuste
            </Button>
          </>
        }
      >
        {seleccionado && (
          <NominaAjusteForm
            barberoId={seleccionado.barberoId}
            nombre={seleccionado.barbero?.nombrePublico ?? "este barbero"}
            onSubmit={(datos) => void onAjustar(datos)}
          />
        )}
      </Modal>
    </main>
  )
}
