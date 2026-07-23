"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  CalendarDays,
  Check,
  LayoutDashboard,
  Palette,
  RotateCcw,
  Scissors,
  Users,
} from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Modal } from "@shared/components/modals/Modal"
import { InfoTooltip } from "@shared/components/tooltips/InfoTooltip"
import { coloresFondo, coloresMarca } from "@config/marca"
import { foregroundPara, tokensDeTema } from "@shared/utils/color"
import { useMarcaStore } from "@store/marca.store"
import { notify } from "@shared/services/notify"

interface GrupoColoresProps {
  titulo: string
  colores: readonly string[]
  seleccionado: string | null
  alElegir: (color: string) => void
  etiquetaCustom: string
}

// Fila de muestras + selector libre. Color dinámico vía variable CSS, nunca style directo.
function GrupoColores({
  titulo,
  colores,
  seleccionado,
  alElegir,
  etiquetaCustom,
}: GrupoColoresProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{titulo}</p>
      <div className="flex flex-wrap items-center gap-2">
        {colores.map((color) => (
          <InfoTooltip key={color} contenido={color}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => alElegir(color)}
              aria-label={`Usar el color ${color}`}
              aria-pressed={color === seleccionado}
              className="size-9 rounded-full border border-border bg-(--muestra) text-(--muestra-fg)"
              style={
                { "--muestra": color, "--muestra-fg": foregroundPara(color) } as React.CSSProperties
              }
            >
              {color === seleccionado && <Check className="size-4" aria-hidden />}
            </Button>
          </InfoTooltip>
        ))}
        {/* Sin pieza shadcn para selector de color: input nativo */}
        <input
          type="color"
          value={seleccionado ?? "#0a0a0b"}
          onChange={(evento) => alElegir(evento.target.value)}
          aria-label={etiquetaCustom}
          className="h-9 w-9 cursor-pointer rounded-full border border-border bg-transparent"
        />
      </div>
    </div>
  )
}

// Preview del panel con los tokens del borrador: los hijos usan clases NORMALES
// (bg-background, bg-card, text-primary…) y heredan los tokens locales del contenedor.
function PreviewPanel({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border"
      style={tokens as React.CSSProperties}
      aria-hidden
    >
      <div className="flex h-64 bg-background text-foreground">
        {/* Mini sidebar */}
        <div className="hidden w-28 flex-col gap-1 border-r border-border bg-card p-2 sm:flex">
          <div className="flex items-center gap-1.5 px-1.5 py-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
              <Scissors className="size-3 text-primary-foreground" />
            </span>
            <span className="text-[9px] font-bold">BARION</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1.5 text-[9px] font-medium text-primary">
            <LayoutDashboard className="size-3" /> Dashboard
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1.5 text-[9px] text-secondary-foreground">
            <CalendarDays className="size-3" /> Citas (hover)
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[9px] text-muted-foreground">
            <Users className="size-3" /> Clientes
          </div>
        </div>

        {/* Contenido */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 items-center justify-between border-b border-border bg-card/50 px-3">
            <span className="text-[10px] font-semibold">Dashboard</span>
            <span className="h-4 w-14 rounded-md border border-border bg-secondary" />
          </div>
          <div className="flex-1 space-y-2.5 overflow-hidden p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[8px] tracking-wide text-muted-foreground uppercase">
                  Ingresos hoy
                </p>
                <p className="text-sm font-bold text-primary">$2,480</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[8px] tracking-wide text-muted-foreground uppercase">
                  Citas hoy
                </p>
                <p className="text-sm font-bold">24</p>
              </div>
            </div>
            <div className="space-y-1.5 rounded-lg border border-border bg-card p-2.5">
              <div className="flex h-10 items-end gap-1">
                {[45, 70, 55, 90, 65, 100, 75].map((altura, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm bg-primary/70"
                    style={{ height: `${altura}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary px-3 py-1.5 text-[9px] font-bold text-primary-foreground">
                Botón principal
              </span>
              <span className="rounded-full bg-accent px-2 py-1 text-[8px] font-medium text-accent-foreground">
                Hover / acento
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Estudio de marca del tenant — SOLO el admin. Borrador + preview del diseño; nada cambia hasta Aplicar.
export function BrandStudio() {
  const colorMarca = useMarcaStore((s) => s.colorMarca)
  const colorFondo = useMarcaStore((s) => s.colorFondo)
  const setColorMarca = useMarcaStore((s) => s.setColorMarca)
  const setColorFondo = useMarcaStore((s) => s.setColorFondo)

  const { resolvedTheme } = useTheme()
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  const temaOscuro = !montado || resolvedTheme !== "light"

  const [abierto, setAbierto] = useState(false)
  const [borradorMarca, setBorradorMarca] = useState<string | null>(null)
  const [borradorFondo, setBorradorFondo] = useState<string | null>(null)

  const alCambiarAbierto = (siguiente: boolean) => {
    setAbierto(siguiente)
    if (siguiente) {
      setBorradorMarca(colorMarca)
      setBorradorFondo(colorFondo)
    }
  }

  const sinCambios = borradorMarca === colorMarca && borradorFondo === colorFondo

  const aplicar = () => {
    setColorMarca(borradorMarca)
    setColorFondo(borradorFondo)
    setAbierto(false)
    notify.success("Colores del negocio actualizados")
  }

  const tokens = tokensDeTema(borradorMarca, borradorFondo, temaOscuro)

  return (
    <>
      <InfoTooltip contenido="Colores del negocio">
        <Button
          variant="outline"
          size="icon"
          aria-label="Colores del negocio"
          onClick={() => alCambiarAbierto(true)}
        >
          <Palette aria-hidden />
        </Button>
      </InfoTooltip>

      <Modal
        open={abierto}
        onOpenChange={alCambiarAbierto}
        titulo="Colores del negocio"
        descripcion="Se adaptan solos al tema claro y oscuro — aplican al panel y al portal de tus clientes."
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setBorradorMarca(null)
                setBorradorFondo(null)
              }}
              disabled={!borradorMarca && !borradorFondo}
              className="mr-auto gap-1.5 text-muted-foreground"
            >
              <RotateCcw aria-hidden /> Restablecer
            </Button>
            <Button variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={aplicar} disabled={sinCambios}>
              Aplicar cambios
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[240px_1fr]">
          <div className="space-y-4">
            <GrupoColores
              titulo="Color primario"
              colores={coloresMarca}
              seleccionado={borradorMarca}
              alElegir={setBorradorMarca}
              etiquetaCustom="Elegir un color primario personalizado"
            />
            <GrupoColores
              titulo="Color de fondo"
              colores={coloresFondo}
              seleccionado={borradorFondo}
              alElegir={setBorradorFondo}
              etiquetaCustom="Elegir un color de fondo personalizado"
            />
            <p className="text-[11px] text-muted-foreground">
              La vista previa usa tu tema actual; cada color genera su variante clara y oscura
              automáticamente.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Así quedará el panel</p>
            <PreviewPanel tokens={tokens} />
          </div>
        </div>
      </Modal>
    </>
  )
}
