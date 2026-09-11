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
        {/*
          El `<main>` de cada pantalla scrollea en vertical y NUNCA de lado:
          con `overflow-y: auto` el eje x calcula `auto` también, y cualquier
          pieza que sobresalga un píxel —una gráfica, un margen negativo— lo
          volvía deslizable hacia los lados. Tampoco rebota. Se fija aquí, en el
          chrome, para que valga en el panel y en el admin sin que cada página
          se acuerde (las tablas anchas llevan su propio `overflow-x-auto`)
        */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden [&_main]:overflow-x-hidden [&_main]:overscroll-none">
          <Navbar alAbrirMenuMovil={() => setAbiertaEnMovil(true)} />
          {esDemo && <AvisoDemo />}
          {children}
        </div>
      </div>
    </MotionConfig>
  )
}
