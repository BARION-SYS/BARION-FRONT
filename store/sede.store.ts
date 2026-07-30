import { create } from "zustand"
import type { Sede } from "@features/sedes/types/sedes.types"

interface SedeState {
  sedes: Sede[]
  sedeActualId: string | null
  /** La llena `Navbar` al cargar `useSedes()`; el resto del panel solo lee. */
  setSedes: (sedes: Sede[]) => void
  setSedeActual: (id: string) => void
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
}))

export function useSedeActual(): Sede | null {
  return useSedeStore(
    (estado) => estado.sedes.find((sede) => sede.id === estado.sedeActualId) ?? null
  )
}
