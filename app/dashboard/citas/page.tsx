"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { CitasToolbar } from "@features/citas/components/CitasToolbar"
import { CitasList } from "@features/citas/components/CitasList"
import { GrillaSemana } from "@features/citas/components/GrillaSemana"
import { PanelDia } from "@features/citas/components/PanelDia"
import { CitasDetail } from "@features/citas/components/CitasDetail"
import { CitasForm } from "@features/citas/components/CitasForm"
import { useCitas } from "@features/citas/hooks/useCitas"
import type { DatosCita } from "@features/citas/schemas/citas.schema"
import type { CitaCalendario, VistaCalendario } from "@features/citas/types/citas.types"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"

// Contenedor: única instancia de hooks; los hijos reciben datos + callbacks por props.
export default function CitasPage() {
  const {
    semana,
    citas,
    loadingCitas,
    loadingAction,
    error,
    fetchCitas,
    handleCreateCita,
    handleReagendarCita,
    handleCancelarCita,
    handleDeleteCita,
  } = useCitas()

  // Estado de UI — vive solo en el contenedor.
  const [vista, setVista] = useState<VistaCalendario>("semana")
  const [diaSeleccionado, setDiaSeleccionado] = useState(0)
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaCalendario | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [formAbierto, setFormAbierto] = useState(false)
  const [citaEnEdicion, setCitaEnEdicion] = useState<CitaCalendario | null>(null)

  useEffect(() => {
    void fetchCitas()
  }, [fetchCitas])

  const abrirCrearCita = () => {
    setCitaEnEdicion(null)
    setFormAbierto(true)
  }

  // Cierra el detalle y abre el form precargado con la cita seleccionada.
  const abrirReagendarCita = () => {
    if (!citaSeleccionada) return
    setCitaEnEdicion(citaSeleccionada)
    setCitaSeleccionada(null)
    setFormAbierto(true)
  }

  const enviarCita = async (datos: DatosCita) => {
    try {
      const message = citaEnEdicion
        ? await handleReagendarCita(citaEnEdicion.id, datos)
        : await handleCreateCita(datos)
      notify.success(message)
      setFormAbierto(false)
      setCitaEnEdicion(null)
      void fetchCitas()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const cancelarCitaSeleccionada = async () => {
    if (!citaSeleccionada) return
    try {
      const message = await handleCancelarCita(citaSeleccionada.id)
      notify.success(message)
      setCitaSeleccionada(null)
      void fetchCitas()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const eliminarCitaSeleccionada = async () => {
    if (!citaSeleccionada) return
    try {
      const message = await handleDeleteCita(citaSeleccionada.id)
      notify.success(message)
      setCitaSeleccionada(null)
      void fetchCitas()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const termino = busqueda.trim().toLowerCase()
  const citasFiltradas = termino
    ? citas.filter((c) =>
        [c.cliente, c.servicio, c.barbero].some((campo) => campo.toLowerCase().includes(termino))
      )
    : citas
  const citasDelDia = citasFiltradas.filter((c) => c.dia === diaSeleccionado)

  const cargando = loadingCitas || !semana

  return (
    // Móvil: scroll de página. md+: app-like — el alto es fijo y scrollean las áreas internas.
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:overflow-hidden md:p-6">
      <CitasToolbar
        rotulo={semana?.rotulo ?? ""}
        vista={vista}
        alCambiarVista={setVista}
        busqueda={busqueda}
        alCambiarBusqueda={setBusqueda}
        alNuevaCita={abrirCrearCita}
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {!error && cargando && (
        <div className="space-y-4">
          <DataSkeleton variant="text" count={1} className="max-w-md" />
          <DataSkeleton variant="table" count={8} />
        </div>
      )}

      {!error && !cargando && semana && (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
            <motion.div
              key={vista}
              className="flex min-h-0 min-w-0 flex-1"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.08 }}
            >
              {vista === "lista" ? (
                <CitasList
                  semana={semana}
                  citas={citasFiltradas}
                  alSeleccionarCita={setCitaSeleccionada}
                />
              ) : (
                <GrillaSemana
                  semana={semana}
                  citas={citasFiltradas}
                  diaSeleccionado={diaSeleccionado}
                  alSeleccionarDia={setDiaSeleccionado}
                  alSeleccionarCita={setCitaSeleccionada}
                  vista={vista}
                />
              )}
            </motion.div>
            {/* Panel lateral solo en vista semana y xl+: el detalle del día vive al costado */}
            {vista === "semana" && (
              <motion.div
                className="hidden min-h-0 shrink-0 xl:flex xl:w-72"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.08 }}
              >
                <PanelDia
                  dia={semana.dias[diaSeleccionado]}
                  mes={semana.mes}
                  horas={semana.horas}
                  citas={citasDelDia}
                  citaSeleccionada={citaSeleccionada}
                  alSeleccionarCita={setCitaSeleccionada}
                />
              </motion.div>
            )}
          </div>

          <CitasDetail
            cita={citaSeleccionada}
            semana={semana}
            alCerrar={() => setCitaSeleccionada(null)}
            alCancelar={() => void cancelarCitaSeleccionada()}
            alReagendar={abrirReagendarCita}
            alEliminar={() => void eliminarCitaSeleccionada()}
            mutando={loadingAction}
          />
        </>
      )}

      <CitasForm
        open={formAbierto}
        onOpenChange={setFormAbierto}
        cita={citaEnEdicion}
        semana={semana}
        onSubmit={enviarCita}
        guardando={loadingAction}
      />
    </main>
  )
}
