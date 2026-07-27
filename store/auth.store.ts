import { create } from "zustand"
import type { Sesion, SesionActual } from "@features/auth/types/auth.types"

interface AuthState {
  sesion: Sesion | SesionActual | null
  /** `false` hasta que el intento de rehidratar termina (haya sesión o no). */
  hidratada: boolean
  setSesion: (sesion: Sesion | SesionActual) => void
  setHidratada: (hidratada: boolean) => void
  cerrarSesion: () => void
}

// Store global de sesión — solo estado (set/get), nunca llama services.
//
// SIN `persist`: la sesión de verdad es la cookie httpOnly, que este código no
// puede leer. Guardar una copia en localStorage crearía una segunda verdad que
// sobrevive a la cookie: al caducar el token el panel seguiría pintándose como
// autenticado y cada petición devolvería 401. Se rehidrata contra `/auth/yo`,
// que es la única fuente que sabe si la sesión sigue viva.
//
// `hidratada` existe para distinguir "no hay sesión" de "todavía no se sabe" —
// sin esa distinción, un guard de ruta expulsa al usuario en cada recarga.
export const useAuthStore = create<AuthState>()((set) => ({
  sesion: null,
  hidratada: false,
  setSesion: (sesion) => set({ sesion, hidratada: true }),
  setHidratada: (hidratada) => set({ hidratada }),
  cerrarSesion: () => set({ sesion: null, hidratada: true }),
}))
