import { create } from "zustand"
import type { CodigoRegion } from "@config/regiones"

interface PortalState {
  /**
   * La región de la barbería que se está mirando. `null` fuera del portal, que
   * es lo que hace que el panel no se vea afectado por esto.
   */
  region: CodigoRegion | null
  setRegion: (region: CodigoRegion | null) => void
}

/**
 * De qué barbería es el escaparate que se está mirando.
 *
 * ── Por qué existe, y por qué NO se guarda ──────────────────────────────────
 * En el panel el idioma sale de quien lo usa; en el portal no hay «quien lo
 * usa» con preferencia guardada — hay un cliente que entró por un enlace. Lo que
 * sí hay es una barbería concreta, y la api dice de qué país es
 * (`GET /publico/barberias/:slug` devuelve `pais`, `moneda` y `locale`).
 *
 * Así que el portal de una barbería española se lee en español de España sin
 * que nadie elija nada, y el de una estadounidense en inglés. **No es una
 * preferencia**: es un dato del negocio, igual que su moneda.
 *
 * Por eso este store NO usa `persist`, a diferencia de `idioma.store` y
 * `marca.store`: guardarlo en el navegador haría que el escaparate de la
 * siguiente barbería que se visite arrancara con el país de la anterior. Vive lo
 * que dure la pestaña y lo escribe cada página del portal con su ficha, igual
 * que ya hace con los colores.
 *
 * ── Lo que sigue sin decidirse, y es lo único ───────────────────────────────
 * Si el cliente puede CAMBIARLO. Hoy no se le ofrece selector: lee el idioma de
 * la barbería y punto. Añadirlo sería escribir en `idioma.store`, que ya tiene
 * prioridad sobre esto — o sea, un componente y ninguna reestructuración.
 */
export const usePortalStore = create<PortalState>()((set) => ({
  region: null,
  setRegion: (region) => set({ region }),
}))
