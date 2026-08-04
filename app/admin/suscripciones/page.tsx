"use client"

import { useCallback, useEffect, useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { SidePanel } from "@shared/components/modals/SidePanel"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import {
  ID_FORM_SUSCRIPCION,
  PlataformaSuscripcionForm,
} from "@features/plataforma/components/PlataformaSuscripcionForm"
import { PlataformaSuscripcionList } from "@features/plataforma/components/PlataformaSuscripcionList"
import {
  PlataformaSuscripcionToolbar,
  TODOS,
} from "@features/plataforma/components/PlataformaSuscripcionToolbar"
import type { DatosCorreccionSuscripcion } from "@features/plataforma/schemas/plataforma.schema"
import type {
  EstadoSuscripcion,
  SuscripcionPlataforma,
} from "@features/plataforma/types/plataforma.types"

/**
 * Qué tiene contratado cada barbería, y dónde soporte lo corrige.
 *
 * Aquí se arregla la FACTURACIÓN. Cortarle el acceso a una barbería morosa es
 * otra decisión y vive en el inventario, con su propia ruta: mezclarlas haría
 * que corregir un vencimiento pareciera un castigo.
 *
 * La corrección son cuatro campos —plan, vencimiento, días de gracia y baja
 * programada— y ni uno más: el resto lo escribe el worker al consumir los
 * webhooks del cobro, y reescribirlo a mano sería contarle a la base una
 * historia que el banco no confirmó.
 */
export default function AdminSuscripcionesPage() {
  const {
    suscripciones,
    paginacionSuscripciones,
    totalSuscripciones,
    catalogoPlanes,
    loadingSuscripciones,
    loadingAction,
    error,
    fetchSuscripciones,
    fetchCatalogoPlanes,
    handleCorregirSuscripcion,
  } = usePlataforma()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "plataforma.suscripciones.gestionar")
  const gestionaPlanes = puede(sesion, "plataforma.planes.gestionar")

  // Estado de UI: vive en el contenedor, nunca en el hook.
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState<EstadoSuscripcion | typeof TODOS>(TODOS)
  const [planCodigo, setPlanCodigo] = useState<string>(TODOS)
  const [pagina, setPagina] = useState(1)
  const [corrigiendo, setCorrigiendo] = useState<SuscripcionPlataforma | null>(null)

  const cargar = useCallback(() => {
    void fetchSuscripciones({
      busqueda: busqueda || undefined,
      estado: estado === TODOS ? undefined : estado,
      planCodigo: planCodigo === TODOS ? undefined : planCodigo,
      page: pagina,
    })
  }, [fetchSuscripciones, busqueda, estado, planCodigo, pagina])

  useEffect(() => {
    cargar()
  }, [cargar])

  /**
   * El catálogo COMPLETO, no el público: mover a un plan retirado está
   * permitido y a veces hay que dejar a alguien en el que se le vendió. Va tras
   * su propia capacidad porque es otra ruta con otro permiso — sin él, la
   * pantalla sigue sirviendo y el selector se queda con el plan vigente.
   */
  useEffect(() => {
    if (gestionaPlanes) void fetchCatalogoPlanes({ paginar: false })
  }, [gestionaPlanes, fetchCatalogoPlanes])

  const onFiltrar = useCallback((accion: () => void) => {
    accion()
    // Filtrar reinicia la página: quedarse en la 3 de un resultado que ahora
    // tiene una sola es enseñar un vacío que parece un error.
    setPagina(1)
  }, [])

  const onCorregir = useCallback(
    async (datos: DatosCorreccionSuscripcion) => {
      if (!corrigiendo) return
      try {
        const mensaje = await handleCorregirSuscripcion(corrigiendo.barberia.id, datos)
        setCorrigiendo(null)
        // El `message` advierte cuando el cambio deja la cuenta sobre el límite.
        notify.success(mensaje)
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [corrigiendo, handleCorregirSuscripcion, cargar]
  )

  if (!gestiona) {
    return (
      <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
        <SinDatos
          titulo="La facturación la corrige soporte"
          detalle="Hace falta la capacidad «plataforma.suscripciones.gestionar»: cada campo que se abre aquí es una forma más de descuadrar el cobro de un cliente."
          icono={CreditCard}
          alto={240}
        />
      </main>
    )
  }

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <SectionCard
        titulo="Suscripciones"
        subtitulo="Qué tiene contratado cada barbería y hasta cuándo le vale"
      >
        <div className="flex flex-col gap-5">
          <PlataformaSuscripcionToolbar
            busqueda={busqueda}
            estado={estado}
            planCodigo={planCodigo}
            planes={catalogoPlanes}
            total={totalSuscripciones}
            onBuscar={(valor) => onFiltrar(() => setBusqueda(valor))}
            onFiltrarEstado={(valor) => onFiltrar(() => setEstado(valor))}
            onFiltrarPlan={(valor) => onFiltrar(() => setPlanCodigo(valor))}
            onLimpiar={() =>
              onFiltrar(() => {
                setBusqueda("")
                setEstado(TODOS)
                setPlanCodigo(TODOS)
              })
            }
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <PlataformaSuscripcionList
            suscripciones={suscripciones}
            loading={loadingSuscripciones}
            gestiona={gestiona}
            paginacion={paginacionSuscripciones}
            onCorregir={setCorrigiendo}
            onPagina={setPagina}
          />
        </div>
      </SectionCard>

      <SidePanel
        open={corrigiendo !== null}
        onOpenChange={(abierto) => !abierto && setCorrigiendo(null)}
        titulo={corrigiendo ? corrigiendo.barberia.nombreComercial : "Corregir la suscripción"}
        descripcion="Solo la facturación. Suspender el acceso es otra decisión y vive en el inventario."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCorrigiendo(null)}>
              Cancelar
            </Button>
            <Button type="submit" form={ID_FORM_SUSCRIPCION} disabled={loadingAction}>
              {loadingAction && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Guardar corrección
            </Button>
          </>
        }
      >
        {corrigiendo && (
          <PlataformaSuscripcionForm
            key={corrigiendo.id}
            suscripcion={corrigiendo}
            planes={catalogoPlanes}
            onSubmit={onCorregir}
          />
        )}
      </SidePanel>
    </main>
  )
}
