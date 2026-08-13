import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Idioma } from "@shared/textos/config"

interface IdiomaState {
  /** `null` = seguir al de la región de la barbería, que es lo que hace todo el mundo. */
  idioma: Idioma | null
  setIdioma: (idioma: Idioma | null) => void
}

// El idioma del panel — **preferencia de quien lo usa, no dato del negocio**,
// igual que los colores (`marca.store.ts`) y por las mismas razones: vive en
// este navegador, no viaja a la api, nadie tiene que aprobarlo y cambiarlo no le
// mueve la pantalla a nadie más.
//
// No es lo mismo que el idioma de un CORREO, y por eso no se guarda aquí: ese lo
// manda el destinatario y lo decide el worker con lo que sepa de él. Una
// preferencia de navegador no sirve para escribirle a alguien que no está
// delante.
//
// `null` en vez de un idioma escrito es a propósito: quien nunca lo tocó sigue a
// su región, así que el día que se abra un mercado nuevo el panel le habla en su
// idioma sin que tenga que ir a buscarlo.
export const useIdiomaStore = create<IdiomaState>()(
  persist(
    (set) => ({
      idioma: null,
      setIdioma: (idioma) => set({ idioma }),
    }),
    { name: "barion-idioma" }
  )
)
