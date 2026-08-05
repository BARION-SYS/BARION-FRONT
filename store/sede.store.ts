import { create } from "zustand"
import type { Sede } from "@features/sedes/types/sedes.types"

interface SedeState {
  sedes: Sede[]
  sedeActualId: string | null
  /** La llena `Navbar` al cargar `useSedes()`; el resto del panel solo lee. */
  setSedes: (sedes: Sede[]) => void
  setSedeActual: (id: string) => void
  /**
   * Sustituye UNA sede por la que acaba de devolver la api (rotar su `slugQr`,
   * por ejemplo). Evita re-pedir la lista entera para refrescar un campo y deja
   * una sola verdad: todo el panel lee estas sedes.
   */
  reemplazarSede: (sede: Sede) => void
}

// Sede activa del panel — transversal a listados y formateo de fecha/hora.
//
// Sin `persist` a propósito: es una elección por SESIÓN, no por navegador. Dos
// barberías distintas en el mismo navegador (cuentas separadas) no deben
// heredarse la sede seleccionada la una a la otra.
export const useSedeStore = create<SedeState>((set, get) => ({
  sedes: [],
  sedeActualId: null,
  setSedes: (sedes) => {
    const actual = get().sedeActualId
    set({
      sedes,
      // Conserva la elegida si sigue en la lista; si no, cae a la primera.
      sedeActualId: sedes.some((sede) => sede.id === actual) ? actual : (sedes[0]?.id ?? null),
    })
  },
  setSedeActual: (id) => set({ sedeActualId: id }),
  reemplazarSede: (sede) =>
    set({ sedes: get().sedes.map((actual) => (actual.id === sede.id ? sede : actual)) }),
}))

export function useSedeActual(): Sede | null {
  return useSedeStore(
    (estado) => estado.sedes.find((sede) => sede.id === estado.sedeActualId) ?? null
  )
}
