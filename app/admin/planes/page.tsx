"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Tags } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { SidePanel } from "@shared/components/modals/SidePanel"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { puede } from "@features/auth/utils/permisos"
import { useAuthStore } from "@store/auth.store"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import { PlataformaPlanCard } from "@features/plataforma/components/PlataformaPlanCard"
import {
  ID_FORM_PLAN,
  PlataformaPlanForm,
} from "@features/plataforma/components/PlataformaPlanForm"
import {
  PlataformaPlanToolbar,
  type FiltroPublicacion,
} from "@features/plataforma/components/PlataformaPlanToolbar"
import type { DatosPlanNuevo } from "@features/plataforma/schemas/plataforma.schema"
import type { PlanAdmin } from "@features/plataforma/types/plataforma.types"

/**
 * Qué se le vende a las barberías, y desde aquí se administra.
 *
 * La pantalla lee el catálogo INTERNO (`GET /plataforma/planes`), no el que
 * publica el sitio de venta: aquel enseña lo que se vende y este lo que existe
 * —los retirados, las banderas apagadas y las tarifas que ya no se ofrecen—.
 * Sin ver lo apagado no hay manera de encenderlo.
 *
 * Lo que desbloquea es cambiar un precio sin abrir la base. Dos reglas del
 * contrato que la pantalla respeta a la vista:
 *
 * - **No hay borrar.** El código es con lo que se contrata, así que retirar un
 *   plan es apagarlo: sale del catálogo y quien lo tiene sigue igual.
 * - **Los precios son upsert por (país, período).** Lo que no se manda se queda
 *   como está, y el formulario dice qué manda antes de guardar.
 *
 * Al lado de cada plan va cuántas barberías lo tienen: un plan que no contrata
 * nadie es una decisión pendiente, y sin esa cifra no se ve.
 */
export default function AdminPlanesPage() {
  const {
    catalogoPlanes,
    barberias,
    loadingCatalogo,
    loadingAction,
    error,
    fetchCatalogoPlanes,
    fetchBarberias,
    handleCreatePlan,
    handleUpdatePlan,
  } = usePlataforma()

  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "plataforma.planes.gestionar")

  // Estado de UI: vive en el contenedor, nunca en el hook.
  const [busqueda, setBusqueda] = useState("")
  const [publicacion, setPublicacion] = useState<FiltroPublicacion>("todos")
  // Con el panel abierto, `null` es un alta y un plan es una edición.
  const [editando, setEditando] = useState<PlanAdmin | null>(null)
  const [abierto, setAbierto] = useState(false)

  const cargar = useCallback(() => {
    // Sin paginar: el catálogo son unos pocos planes y partirlo en páginas solo
    // esconde el que se busca.
    void fetchCatalogoPlanes({
      paginar: false,
      busqueda: busqueda || undefined,
      activo: publicacion === "todos" ? undefined : publicacion === "publicados",
    })
  }, [fetchCatalogoPlanes, busqueda, publicacion])

  useEffect(() => {
    cargar()
  }, [cargar])

  // El inventario entero, una vez: es de donde sale cuántas barberías tiene
  // cada plan, y una página suelta contaría solo las veinte primeras.
  useEffect(() => {
    void fetchBarberias({ paginar: false })
  }, [fetchBarberias])

  const contratadosPorPlan = useMemo(() => {
    const cuentas = new Map<string, number>()
    for (const barberia of barberias) {
      const codigo = barberia.suscripcion?.planCodigo
      if (codigo) cuentas.set(codigo, (cuentas.get(codigo) ?? 0) + 1)
    }
    return cuentas
  }, [barberias])

  const onAbrir = useCallback((plan: PlanAdmin | null) => {
    setEditando(plan)
    setAbierto(true)
  }, [])

  const onGuardar = useCallback(
    async (datos: DatosPlanNuevo) => {
      try {
        // El alta manda el código; la edición no puede, porque es inmutable y
        // la API ni siquiera lo acepta en el `PATCH`.
        const { codigo: _codigo, ...sinCodigo } = datos
        const mensaje = editando
          ? await handleUpdatePlan(editando.id, sinCodigo)
          : await handleCreatePlan(datos)
        setAbierto(false)
        // El `message` de la API dice si se retiró, si se publicó o si solo se
        // editó — y en el primer caso, que a nadie se le quita lo contratado.
        notify.success(mensaje)
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [editando, handleCreatePlan, handleUpdatePlan, cargar]
  )

  if (!gestiona) {
    return (
      <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
        <SinDatos
          titulo="El catálogo es de quien lo administra"
          detalle="Hace falta la capacidad «plataforma.planes.gestionar»: una sola para leerlo y para cambiarlo, porque el catálogo interno no lo consulta nadie que no pueda tocarlo."
          icono={Tags}
          alto={240}
        />
      </main>
    )
  }

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <SectionCard titulo="Planes" subtitulo="Qué se vende: límites, funciones y precio por país">
        <div className="flex flex-col gap-5">
          <PlataformaPlanToolbar
            busqueda={busqueda}
            publicacion={publicacion}
            total={catalogoPlanes.length}
            onBuscar={setBusqueda}
            onFiltrarPublicacion={setPublicacion}
            onLimpiar={() => {
              setBusqueda("")
              setPublicacion("todos")
            }}
            gestiona={gestiona}
            onCrear={() => onAbrir(null)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Loadable
            loading={loadingCatalogo}
            isEmpty={catalogoPlanes.length === 0}
            variant="card"
            count={2}
            emptyState={
              <SinDatos
                titulo="Ningún plan coincide"
                detalle="Prueba con otro texto o quita el filtro. Si el catálogo está vacío, empieza por «Nuevo plan»: sin ninguno, un alta no puede elegir plan."
                icono={Tags}
              />
            }
          >
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {catalogoPlanes.map((plan) => (
                <PlataformaPlanCard
                  key={plan.id}
                  plan={plan}
                  contratado={contratadosPorPlan.get(plan.codigo) ?? 0}
                  gestiona={gestiona}
                  onEditar={onAbrir}
                />
              ))}
            </div>
          </Loadable>
        </div>
      </SectionCard>

      <SidePanel
        open={abierto}
        onOpenChange={setAbierto}
        titulo={editando ? `Editar ${editando.nombre}` : "Nuevo plan"}
        descripcion={
          editando
            ? "El código no se cambia. Retirarlo lo saca del catálogo sin tocar a quien ya lo tiene contratado."
            : "Nace con sus tarifas: un plan publicado sin ningún precio activo lo rechaza la API."
        }
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" form={ID_FORM_PLAN} disabled={loadingAction}>
              {loadingAction && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {editando ? "Guardar cambios" : "Crear plan"}
            </Button>
          </>
        }
      >
        {/* La clave fuerza un formulario nuevo al cambiar de plan: sin ella,
            react-hook-form conserva los valores del anterior y se editaría un
            plan con los precios de otro. */}
        <PlataformaPlanForm key={editando?.id ?? "nuevo"} plan={editando} onSubmit={onGuardar} />
      </SidePanel>
    </main>
  )
}
