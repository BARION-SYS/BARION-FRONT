import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Sesion } from "@features/auth/types/auth.types"

interface AuthState {
  sesion: Sesion | null
  setSesion: (sesion: Sesion) => void
  cerrarSesion: () => void
}

// Store global de sesión — solo estado (set/get), nunca llama services.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sesion: null,
      setSesion: (sesion) => set({ sesion }),
      cerrarSesion: () => set({ sesion: null }),
    }),
    { name: "trimly-auth" }
  )
)
