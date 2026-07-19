"use client"

import { createContext, useContext, useEffect } from "react"
import { REGION_DEFAULT, regiones, type CodigoRegion, type ConfigRegional } from "@config/regiones"
import { cssDeMarca } from "@shared/utils/color"
import { useMarcaStore } from "@store/marca.store"

export interface ConfigTenant extends ConfigRegional {
  region: CodigoRegion
}

const TenantContext = createContext<ConfigTenant | null>(null)

// Config del tenant (moneda/locale/timezone + color de marca) — se carga UNA vez.
// Mock: región base; al integrar la API se hidrata con GET /tenant.
export function TenantProvider({
  children,
  region = REGION_DEFAULT,
}: {
  children: React.ReactNode
  region?: CodigoRegion
}) {
  const config: ConfigTenant = { region, ...regiones[region] }
  const colorMarca = useMarcaStore((s) => s.colorMarca)
  const colorFondo = useMarcaStore((s) => s.colorFondo)

  // Marca del tenant (la define SOLO el admin): inyecta un <style> con un bloque
  // :root (claro) y otro .dark (oscuro) usando variantes ADAPTATIVAS del color elegido.
  // CSS puro: cada tema recibe su variante; sin elección → defaults de globals.css.
  useEffect(() => {
    const id = "tokens-marca-tenant"
    const css = cssDeMarca(colorMarca, colorFondo)
    let estilo = document.getElementById(id) as HTMLStyleElement | null
    if (!css) {
      estilo?.remove()
      return
    }
    if (!estilo) {
      estilo = document.createElement("style")
      estilo.id = id
      document.head.appendChild(estilo)
    }
    estilo.textContent = css
  }, [colorMarca, colorFondo])

  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
}

export function useTenant(): ConfigTenant {
  const config = useContext(TenantContext)
  if (!config) throw new Error("useTenant debe usarse dentro de <TenantProvider>")
  return config
}
