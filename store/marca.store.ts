import { create } from "zustand"
import { persist } from "zustand/middleware"

interface MarcaState {
  /** Color primario — botones, acentos, gráficas; null = default del tema */
  colorMarca: string | null
  /** Color de fondo; null = default del tema */
  colorFondo: string | null
  setMarca: (colores: { colorMarca: string | null; colorFondo: string | null }) => void
}

// Colores del panel — **preferencia de quien lo usa, no dato del negocio**.
//
// Con `persist`: viven en este navegador y no viajan a la API a propósito. No
// son información del sistema, así que nadie tiene que aprobarlos, no hay
// permiso que los proteja y cambiarlos no le mueve la pantalla a nadie más. Cada
// persona pone el panel como le gusta y ahí se queda.
//
// El portal público es otra cosa: la marca que ve el cliente sí es de la
// barbería y llega con su ficha (`GET /publico/barberias/:slug`) — las páginas
// de `/b/[slug]` escriben aquí lo que les devuelve esa lectura.
export const useMarcaStore = create<MarcaState>()(
  persist(
    (set) => ({
      colorMarca: null,
      colorFondo: null,
      setMarca: ({ colorMarca, colorFondo }) => set({ colorMarca, colorFondo }),
    }),
    { name: "barion-marca" }
  )
)
