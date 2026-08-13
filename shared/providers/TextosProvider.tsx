"use client"

import { createContext, useContext, useMemo } from "react"
import { IDIOMA_POR_REGION, type Idioma } from "@shared/textos/config"
import { esCO, type Diccionario } from "@shared/textos/diccionarios/es-CO"
import { esES } from "@shared/textos/diccionarios/es-ES"
import { enUS } from "@shared/textos/diccionarios/en-US"
import { useTenant } from "@shared/providers/TenantProvider"
import { useIdiomaStore } from "@store/idioma.store"

const DICCIONARIOS: Record<Idioma, Diccionario> = {
  "es-CO": esCO,
  "es-ES": esES,
  "en-US": enUS,
}

interface Textos {
  idioma: Idioma
  t: Diccionario
}

const TextosContext = createContext<Textos | null>(null)

/**
 * El idioma de la aplicación.
 *
 * ── De dónde sale, y en qué orden ───────────────────────────────────────────
 * Primero lo que esa persona eligió; si no eligió nada, el de la región de la
 * barbería. **El idioma del navegador no participa**, y es deliberado: el
 * navegador es de quien mira y el panel es del negocio — un técnico que abre el
 * panel de una barbería colombiana con Chrome en inglés no debería cambiarle el
 * idioma a nadie.
 *
 * ── Los tres diccionarios se importan de golpe ──────────────────────────────
 * Y no con `import()` por idioma. Cargarlos aparte obliga a pintar algo mientras
 * llega el que toca, y ese algo sería la pantalla en español delante de quien no
 * lo habla: un parpadeo de idioma equivocado en CADA recarga, para ahorrar unos
 * kilobytes de texto. El día que el diccionario pese de verdad, esto se parte
 * por idioma **y** por área (panel / portal), que es donde está el ahorro real.
 *
 * ── Va DENTRO de `TenantProvider` ───────────────────────────────────────────
 * Porque la región de la barbería es el respaldo del idioma. El árbol es
 * Tenant → Textos, no al revés.
 */
export function TextosProvider({ children }: { children: React.ReactNode }) {
  const tenant = useTenant()
  const elegido = useIdiomaStore((estado) => estado.idioma)

  const valor = useMemo<Textos>(() => {
    const idioma = elegido ?? IDIOMA_POR_REGION[tenant.region]
    return { idioma, t: DICCIONARIOS[idioma] }
  }, [elegido, tenant.region])

  return <TextosContext.Provider value={valor}>{children}</TextosContext.Provider>
}

/**
 * El diccionario del idioma activo.
 *
 * Uso: `const t = useTextos()` y después `t.navbar.miPerfil`. No hay claves en
 * cadena (`t("navbar.miPerfil")`) a propósito: una cadena mal escrita se
 * descubre en pantalla y un acceso mal escrito no compila.
 */
export function useTextos(): Diccionario {
  return useContextoTextos().t
}

/** El idioma activo — para formatear, y para el selector que lo cambia. */
export function useIdioma(): Idioma {
  return useContextoTextos().idioma
}

function useContextoTextos(): Textos {
  const contexto = useContext(TextosContext)
  if (!contexto) throw new Error("useTextos debe usarse dentro de TextosProvider")
  return contexto
}
