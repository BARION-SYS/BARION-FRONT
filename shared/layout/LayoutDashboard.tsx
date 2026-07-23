"use client"

import { useState } from "react"
import { MotionConfig } from "motion/react"
import { Sidebar } from "@shared/layout/Sidebar"
import { Navbar } from "@shared/layout/Navbar"

// Única instancia del estado del chrome (colapso + drawer móvil); hijos reciben props.
export function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const [colapsada, setColapsada] = useState(false)
  const [abiertaEnMovil, setAbiertaEnMovil] = useState(false)

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
          {children}
        </div>
      </div>
    </MotionConfig>
  )
}
