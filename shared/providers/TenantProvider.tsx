"use client"

import { createContext, useContext, useEffect } from "react"
import { REGION_DEFAULT, regiones, type CodigoRegion, type ConfigRegional } from "@config/regiones"
import { cssDeMarca } from "@shared/utils/color"
import { useMarcaStore } from "@store/marca.store"

export interface ConfigTenant extends ConfigRegional {
  region: CodigoRegion
}

const TenantContext = createContext<ConfigTenant | null>(null)

/**
 * Config regional de referencia (moneda/locale/timezone) + los colores elegidos
 * en este navegador.
 *
 * ── La región es una CONSTANTE, y hoy es la correcta ────────────────────────
 * *(Este comentario decía «Mock: región base; al integrar la API se hidrata con
 * GET /tenant». Las dos mitades eran falsas: ese endpoint no existe ni existió, y
 * no es un mock — es la región base del producto.)*
 *
 * Barion **solo opera en Colombia** (`BARION-SYS/docs/DECISIONES.md` § 26: `ES` y
 * `US` quedan declarados y con `paises.activo = false`, y el alta responde 422
 * allí). Como el registro solo admite países abiertos, toda barbería que existe
 * hoy es colombiana y `REGION_DEFAULT` acierta para todas. No lleva prop de
 * región a propósito: una que nadie pasa promete que esto se configura, y no se
 * configura.
 *
 * ── Qué se salva solo, y qué no ─────────────────────────────────────────────
 * El único consumidor es `useFormato`, y ahí **la sede manda**: coge su
 * `zonaHoraria` y su `moneda`, y esto es solo el respaldo. Así que timezone y
 * moneda ya son del sitio correcto — la timezone además tiene que serlo, porque
 * es de la SEDE y no del país.
 *
 * **`locale` es la excepción: no tiene ninguna capa encima.** Sale de aquí
 * siempre, así que el día que exista una barbería fuera de Colombia formateará
 * sus fechas y sus números en `es-CO`. No se nota hoy y por eso queda escrito.
 *
 * ── Lo que costaría cerrarlo, para no volver a investigarlo ─────────────────
 * El país tendría que llegar al panel, y el sitio natural es la sesión —es lo
 * único que toda pantalla del panel ya tiene—. Hoy no viaja ahí: `BarberiaSesion`
 * es `{ id, slug, nombreComercial }` porque `app_publico.barberias_de_usuario` no
 * devuelve `codigo_pais`. O sea que **no es un cambio de front**: es una función
 * SQL de `BARION-DB`, su puntero en la api y un `pnpm db:setup` — que además hoy
 * hay que rodear a mano (`PENDIENTES.md` § 0.16). Deducir el locale de la moneda
 * de la sede NO vale: `USD` no distingue EE. UU. de Ecuador o Panamá, y sería
 * inventarse el dato.
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const config: ConfigTenant = {
    region: REGION_DEFAULT,
    ...regiones[REGION_DEFAULT],
  }
  const colorMarca = useMarcaStore((s) => s.colorMarca)
  const colorFondo = useMarcaStore((s) => s.colorFondo)

  // Colores del panel: inyecta un <style> con un bloque
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
