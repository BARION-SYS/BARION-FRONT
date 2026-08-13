"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { useMontado } from "@shared/hooks/useMontado"
import { useTextos } from "@shared/providers/TextosProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"

// Único control de tema de la app — no duplicarlo.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const montado = useMontado()
  const t = useTextos()

  if (!montado) return <Button variant="outline" size="icon" aria-label={t.tema.boton} disabled />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label={t.tema.cambiar}>
            {theme === "light" ? (
              <Sun aria-hidden />
            ) : theme === "dark" ? (
              <Moon aria-hidden />
            ) : (
              <Monitor aria-hidden />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun aria-hidden /> {t.tema.claro}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon aria-hidden /> {t.tema.oscuro}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor aria-hidden /> {t.tema.sistema}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
