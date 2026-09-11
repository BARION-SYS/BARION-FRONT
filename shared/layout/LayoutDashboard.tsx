"use client"

import { useState } from "react"
import { MotionConfig } from "motion/react"
import { AvisoDemo } from "@features/auth/components/AvisoDemo"
import { Sidebar } from "@shared/layout/Sidebar"
import { Navbar } from "@shared/layout/Navbar"
import { useAuthStore } from "@store/auth.store"

// Única instancia del estado del chrome (colapso + drawer móvil); hijos reciben props.
export function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const [colapsada, setColapsada] = useState(false)
  const [abiertaEnMovil, setAbiertaEnMovil] = useState(false)
  // La sesión demo es de solo lectura: el aviso vive en el chrome para que
  // acompañe a todas las pantallas sin que ninguna tenga que acordarse.
  const esDemo = useAuthStore((s) => s.sesion?.esDemo ?? false)

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar
          colapsada={colapsada}
          alAlternarColapso={() => setColapsada((c) => !c)}
          abiertaEnMovil={abiertaEnMovil}
          alCerrarMovil={() => setAbiertaEnMovil(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar alAbrirMenuMovil={() => setAbiertaEnMovil(true)} />
          {esDemo && <AvisoDemo />}
          {children}
        </div>
      </div>
    </MotionConfig>
  )
}
