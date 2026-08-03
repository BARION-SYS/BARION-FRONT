"use client"

import { useCallback, useEffect, useMemo } from "react"
import { Tags } from "lucide-react"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import { PlataformaPlanCard } from "@features/plataforma/components/PlataformaPlanCard"

/**
 * Qué se le vende a las barberías.
 *
 * El catálogo es el MISMO que publica el sitio de venta (`GET /publico/planes`,
 * la única lectura sin sesión de la api): tener una segunda tabla de precios
 * para el panel garantizaría que un día digan cosas distintas.
 *
 * Es de solo lectura porque la api todavía no publica un CRUD de planes. Poner
 * aquí un botón de editar sería prometer una administración que no existe; lo
 * que sí resuelve esta pantalla es no tener que abrir la base para saber qué se
 * está cobrando en cada país.
 *
 * Al lado de cada plan va cuántas barberías lo tienen: un plan que no contrata
 * nadie es una decisión pendiente, y sin esa cifra no se ve.
 */
export default function AdminPlanesPage() {
  const { planes, barberias, loadingPlanes, error, fetchPlanes, fetchBarberias } = usePlataforma()

  const cargar = useCallback(() => {
    void fetchPlanes()
    // Sin paginar: lo que se cuenta es cuántas barberías tiene cada plan, y una
    // página suelta contaría solo las veinte primeras.
    void fetchBarberias({ paginar: false })
  }, [fetchPlanes, fetchBarberias])

  useEffect(() => {
    cargar()
  }, [cargar])

  const contratadosPorPlan = useMemo(() => {
    const cuentas = new Map<string, number>()
    for (const barberia of barberias) {
      const codigo = barberia.suscripcion?.planCodigo
      if (codigo) cuentas.set(codigo, (cuentas.get(codigo) ?? 0) + 1)
    }
    return cuentas
  }, [barberias])

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Loadable
        loading={loadingPlanes}
        isEmpty={planes.length === 0}
        variant="card"
        count={2}
        emptyState={
          <SinDatos
            titulo="No hay planes publicados"
            detalle="El catálogo llega vacío: no hay ningún plan activo con precio. Hasta que lo haya, un alta no puede elegir plan."
            icono={Tags}
          />
        }
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {planes.map((plan) => (
            <PlataformaPlanCard
              key={plan.codigo}
              plan={plan}
              contratado={contratadosPorPlan.get(plan.codigo) ?? 0}
            />
          ))}
        </div>
      </Loadable>
    </main>
  )
}
