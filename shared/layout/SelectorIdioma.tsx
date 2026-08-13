"use client"

import { Check, Languages } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { ETIQUETA_IDIOMA, IDIOMAS } from "@shared/textos/config"
import { useIdioma, useTextos } from "@shared/providers/TextosProvider"
import { useIdiomaStore } from "@store/idioma.store"

/**
 * Único control de idioma de la aplicación — como `ThemeToggle` con el tema, y
 * al lado suyo: las tres cosas que cada quien ajusta a su gusto (idioma, tema y
 * colores) viven juntas en el navbar.
 *
 * Cada idioma se lee **en su propio idioma**, nunca traducido al activo: quien
 * tiene el panel en uno que no entiende necesita reconocer el suyo en la lista.
 *
 * «El de la barbería» es una opción de verdad y no un adorno: quien nunca eligió
 * sigue a su mercado, y volver ahí es lo que hace que el día que la barbería
 * cambie de país el panel le hable en el idioma nuevo.
 */
export function SelectorIdioma() {
  const t = useTextos()
  const activo = useIdioma()
  const elegido = useIdiomaStore((estado) => estado.idioma)
  const setIdioma = useIdiomaStore((estado) => estado.setIdioma)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label={t.idioma.cambiar}>
            <Languages aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIdioma(null)}>
          {elegido === null && <Check aria-hidden />}
          {t.idioma.automatico}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {IDIOMAS.map((idioma) => (
          <DropdownMenuItem key={idioma} onClick={() => setIdioma(idioma)}>
            {elegido === idioma && <Check aria-hidden />}
            <span lang={idioma}>{ETIQUETA_IDIOMA[idioma]}</span>
            {elegido === null && idioma === activo && (
              <span className="ml-auto text-[10px] text-muted-foreground">
                {t.idioma.automatico}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
