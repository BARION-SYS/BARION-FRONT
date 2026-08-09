"use client"

import { useCallback, useEffect } from "react"
import { PlataformaMercadosList } from "@features/plataforma/components/PlataformaMercadosList"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import type { PaisAdmin } from "@features/plataforma/types/plataforma.types"

/**
 * Dónde opera Barion, y con qué impuesto factura en cada sitio.
 *
 * **Existe porque las dos cosas cambian con el negocio y no con el código.**
 * Abrir España el día que haya pasarela allí, o encender el impuesto el día que
 * Barion pase el tope que lo hace responsable de IVA, eran hasta ahora un
 * `UPDATE` a mano contra la base — y lo segundo tiene fecha: una factura emitida
 * no se corrige, se anula, así que el valor tiene que poder cambiarse el día
 * exacto en que empieza a aplicar.
 *
 * **Y esta pantalla es la fuente de verdad de los dos frentes**: el selector de
 * país del alta y el de precios del sitio de venta leen la misma lista. Antes
 * cada uno declaraba la suya y la landing ofrecía mercados donde el alta
 * respondía 422, después de rellenar el formulario entero.
 */
export default function AdminMercadosPage() {
  const { paises, loadingPaises, loadingAction, error, fetchPaises, handleUpdatePais } =
    usePlataforma()

  useEffect(() => {
    void fetchPaises()
  }, [fetchPaises])

  const aplicar = useCallback(
    async (codigo: string, cambios: { activo?: boolean; impuestoSaasBps?: number | null }) => {
      try {
        notify.success(await handleUpdatePais(codigo, cambios))
        void fetchPaises()
      } catch (err) {
        notify.error(getErrorMessage(err))
        // Se recarga también al fallar: el campo del impuesto guarda su valor al
        // salir del foco, así que dejarlo con lo tecleado tras un rechazo haría
        // creer que se guardó.
        void fetchPaises()
      }
    },
    [handleUpdatePais, fetchPaises]
  )

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <SectionCard
        titulo="Mercados"
        subtitulo="Dónde se puede dar de alta una barbería, y con qué impuesto factura Barion allí"
      >
        <PlataformaMercadosList
          paises={paises}
          loading={loadingPaises}
          cargandoAccion={loadingAction}
          onAlternar={(pais: PaisAdmin) => void aplicar(pais.codigo, { activo: !pais.activo })}
          onFijarImpuesto={(pais: PaisAdmin, bps) =>
            void aplicar(pais.codigo, { impuestoSaasBps: bps })
          }
        />
      </SectionCard>
    </main>
  )
}
