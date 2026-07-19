import { create } from "zustand"
import { persist } from "zustand/middleware"

interface MarcaState {
  /** Color primario del tenant — botones, acentos, gráficas; null = default */
  colorMarca: string | null
  /** Color de fondo del tenant; null = default del tema */
  colorFondo: string | null
  setColorMarca: (color: string | null) => void
  setColorFondo: (color: string | null) => void
}

// Marca del tenant — SOLO el admin la modifica; los clientes solo la ven en el portal.
// Solo estado: TenantProvider aplica los tokens.
export const useMarcaStore = create<MarcaState>()(
  persist(
    (set) => ({
      colorMarca: null,
      colorFondo: null,
      setColorMarca: (colorMarca) => set({ colorMarca }),
      setColorFondo: (colorFondo) => set({ colorFondo }),
    }),
    { name: "trimly-marca" }
  )
)
