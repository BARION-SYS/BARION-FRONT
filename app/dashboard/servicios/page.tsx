"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { useSedeActual } from "@store/sede.store"
import { useSedes } from "@features/sedes/hooks/useSedes"
import { useServicios } from "@features/servicios/hooks/useServicios"
import { ServiciosForm } from "@features/servicios/components/ServiciosForm"
import { ServiciosList } from "@features/servicios/components/ServiciosList"
import { ServiciosToolbar } from "@features/servicios/components/ServiciosToolbar"
import type { DatosServicio } from "@features/servicios/schemas/servicios.schema"
import type { Servicio } from "@features/servicios/types/servicios.types"

/**
 * El catálogo de la barbería: qué se ofrece, cuánto dura y entre qué precios.
 *
 * No es lo que se reserva —eso es la oferta de cada barbero, que se edita en
 * Personas › Atienden—, pero sin esto no hay nada de lo que colgar un precio.
 *
 * El barbero también entra aquí: con `catalogo.ver` consulta la carta, y si
 * tiene `oferta.gestionar_propia` puede PROPONER un servicio, que nace pendiente
 * de que alguien lo publique.
 */
export default function ServiciosPage() {
  const {
    servicios,
    loadingLista,
    loadingAction,
    error,
    fetchServicios,
    handleCreateServicio,
    handleUpdateServicio,
    handleToggleServicio,
  } = useServicios()

  const { sedes, fetchSedes } = useSedes()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "catalogo.gestionar")
  const propone = puede(sesion, "oferta.gestionar_propia")
  const sedeActual = useSedeActual()

  // Estado de UI: vive en el contenedor.
  const [buscar, setBuscar] = useState("")
  const [categoria, setCategoria] = useState("")
  const [soloActivos, setSoloActivos] = useState(false)
  const [creando, setCreando] = useState(false)
  const [servicioEnEdicion, setServicioEnEdicion] = useState<Servicio | null>(null)

  const cargar = useCallback(
    () => fetchServicios({ sedeId: sedeActual?.id, paginar: false }),
    [fetchServicios, sedeActual?.id]
  )

  useEffect(() => {
    void cargar()
    void fetchSedes()
  }, [cargar, fetchSedes])

  // Las categorías salen de la carta, no de una lista fija: cada barbería
  // agrupa como quiere y una lista cerrada obligaría a mantenerla aquí.
  const categorias = useMemo(
    () =>
      [...new Set(servicios.map((s) => s.categoria).filter((c): c is string => Boolean(c)))].sort(),
    [servicios]
  )

  // Búsqueda y categoría se filtran en cliente: la lista llega entera
  // (`paginar=false`) porque una carta de barbería son decenas de filas, no
  // miles, y así el filtro es inmediato.
  const visibles = useMemo(
    () =>
      servicios.filter(
        (servicio) =>
          (!soloActivos || servicio.activo) &&
          (!categoria || servicio.categoria === categoria) &&
          (!buscar || servicio.nombre.toLowerCase().includes(buscar.toLowerCase()))
      ),
    [servicios, soloActivos, categoria, buscar]
  )

  const conAviso = async (accion: () => Promise<string>) => {
    try {
      notify.success(await accion())
      void cargar()
      return true
    } catch (err) {
      notify.error(getErrorMessage(err))
      return false
    }
  }

  const onGuardar = useCallback(
    async (datos: DatosServicio) => {
      const guardado = servicioEnEdicion
        ? await conAviso(() => handleUpdateServicio(servicioEnEdicion.id, datos))
        : await conAviso(() => handleCreateServicio(datos))

      if (guardado) {
        setServicioEnEdicion(null)
        setCreando(false)
      }
    },
    [servicioEnEdicion, handleUpdateServicio, handleCreateServicio] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <SectionCard
        titulo="Catálogo"
        subtitulo="Lo que ofrece la barbería. El precio que se cobra lo pone cada barbero en su oferta"
        accion={
          gestiona || propone ? (
            <Button type="button" size="sm" onClick={() => setCreando(true)}>
              <Plus className="size-4" aria-hidden />
              {gestiona ? "Nuevo servicio" : "Proponer servicio"}
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <ServiciosToolbar
            buscar={buscar}
            categoria={categoria}
            soloActivos={soloActivos}
            categorias={categorias}
            onBuscar={setBuscar}
            onCategoria={setCategoria}
            onSoloActivos={setSoloActivos}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <ServiciosList
            servicios={visibles}
            loading={loadingLista}
            gestiona={gestiona}
            onEditar={setServicioEnEdicion}
            onAlternarActivo={(servicio) => void conAviso(() => handleToggleServicio(servicio))}
          />
        </div>
      </SectionCard>

      <Modal
        open={creando || servicioEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreando(false)
            setServicioEnEdicion(null)
          }
        }}
        titulo={servicioEnEdicion ? servicioEnEdicion.nombre : "Nuevo servicio"}
        descripcion="Duración y limpieza deciden el hueco que ocupa en la agenda."
        size="lg"
      >
        <ServiciosForm
          key={servicioEnEdicion?.id ?? "nuevo"}
          servicio={servicioEnEdicion}
          sedes={sedes}
          gestiona={gestiona}
          cargando={loadingAction}
          onSubmit={onGuardar}
        />
      </Modal>
    </main>
  )
}
