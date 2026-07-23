// Utilidades puras de color para el tema de marca del tenant.

// Luminancia relativa (WCAG) de un hex #rrggbb.
function luminancia(hex: string): number {
  const limpio = hex.replace("#", "")
  if (limpio.length !== 6) return 0
  const [r, g, b] = [0, 2, 4].map((i) => {
    const canal = parseInt(limpio.slice(i, i + 2), 16) / 255
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Texto que contrasta con el color dado: oscuro sobre colores claros, blanco sobre oscuros.
export function foregroundPara(hex: string): string {
  return luminancia(hex) > 0.45 ? "#0a0a0b" : "#ffffff"
}

interface Hsl {
  h: number
  s: number
  l: number
}

function hexAHsl(hex: string): Hsl {
  const limpio = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslAHex({ h, s, l }: Hsl): string {
  const sN = s / 100
  const lN = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sN * Math.min(lN, 1 - lN)
  const canal = (n: number) => {
    const c = lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${canal(0)}${canal(8)}${canal(4)}`
}

function acotarL(hex: string, min: number, max: number): string {
  const c = hexAHsl(hex)
  return hslAHex({ ...c, l: Math.min(max, Math.max(min, c.l)) })
}

// Variantes ADAPTATIVAS del color elegido: mantiene el matiz pero ajusta la
// luminosidad por tema para no romper contraste ni estética.
export function variantesPrimario(hex: string): { claro: string; oscuro: string } {
  return {
    claro: acotarL(hex, 30, 46), // tema claro: más profundo, contrasta sobre superficies claras
    oscuro: acotarL(hex, 52, 72), // tema oscuro: más luminoso, resalta sobre superficies oscuras
  }
}

export function variantesFondo(hex: string): { claro: string; oscuro: string } {
  const c = hexAHsl(hex)
  const sat = Math.min(c.s, 35)
  return {
    // claro con l:87: el matiz elegido se PERCIBE con cuerpo — con l alto todo quedaba blanco
    claro: hslAHex({ h: c.h, s: Math.min(sat, 32), l: 87 }),
    // oscuro con l:10 (no 7): teñido pero legible — a 7 las superficies se empastaban
    oscuro: hslAHex({ h: c.h, s: sat, l: 10 }),
  }
}

function varsPrimario(hex: string, esOscuro: boolean): Record<string, string> {
  const c = hexAHsl(hex)
  // Accent = tono de hover/resaltado: en oscuro el primario mismo; en claro un tinte suave del matiz.
  const accent = esOscuro ? hex : hslAHex({ h: c.h, s: Math.min(c.s, 45), l: 93 })
  const accentFg = esOscuro ? foregroundPara(hex) : acotarL(hex, 26, 38)
  return {
    "--primary": hex,
    "--primary-foreground": foregroundPara(hex),
    "--ring": hex,
    "--chart-1": hex,
    "--accent": accent,
    "--accent-foreground": accentFg,
    "--sidebar-primary": hex,
    "--sidebar-primary-foreground": foregroundPara(hex),
    "--sidebar-ring": hex,
  }
}

function varsFondo(hex: string, esOscuro: boolean): Record<string, string> {
  const c = hexAHsl(hex)
  const tono = (l: number, sMax = c.s) => hslAHex({ h: c.h, s: Math.min(c.s, sMax), l })
  // Toda la escala de superficies sale del matiz del fondo: cards, hovers, bordes.
  // La card también se tiñe (no blanco puro): sidebar y navbar usan bg-card y
  // deben acompañar el color global; sigue más clara que el fondo para resaltar.
  const card = esOscuro ? tono(14) : tono(96, 18)
  const superficie = esOscuro ? tono(19) : tono(82, 28)
  const borde = esOscuro ? tono(25) : tono(76, 28)
  return {
    "--background": hex,
    "--foreground": foregroundPara(hex),
    "--card": card,
    "--card-foreground": foregroundPara(card),
    "--popover": card,
    "--popover-foreground": foregroundPara(card),
    "--secondary": superficie,
    "--secondary-foreground": foregroundPara(superficie),
    "--muted": superficie,
    "--border": borde,
    "--input": esOscuro ? superficie : borde,
    "--sidebar": card,
    "--sidebar-accent": superficie,
    "--sidebar-border": borde,
  }
}

function bloqueCss(selector: string, vars: Record<string, string>): string {
  const cuerpo = Object.entries(vars)
    .map(([clave, valor]) => `${clave}: ${valor};`)
    .join(" ")
  return `${selector} { ${cuerpo} }`
}

// Mapa completo de tokens para un tema dado (con defaults del sistema si no hay elección).
// Lo usa la preview del BrandStudio: se aplica inline y los hijos usan clases normales.
export function tokensDeTema(
  colorMarca: string | null,
  colorFondo: string | null,
  esOscuro: boolean
): Record<string, string> {
  const marca = colorMarca
    ? variantesPrimario(colorMarca)[esOscuro ? "oscuro" : "claro"]
    : esOscuro
      ? "#d4a843"
      : "#8f6b21"
  const fondo = colorFondo
    ? variantesFondo(colorFondo)[esOscuro ? "oscuro" : "claro"]
    : esOscuro
      ? "#0a0a0b"
      : "#fafaf9"
  return { ...varsPrimario(marca, esOscuro), ...varsFondo(fondo, esOscuro) }
}

// CSS de marca del tenant: un bloque por tema con las variantes adaptativas.
// Se inyecta como <style> después de globals.css — cada tema recibe su variante.
export function cssDeMarca(colorMarca: string | null, colorFondo: string | null): string {
  if (!colorMarca && !colorFondo) return ""
  const claro: Record<string, string> = {}
  const oscuro: Record<string, string> = {}
  if (colorMarca) {
    const v = variantesPrimario(colorMarca)
    Object.assign(claro, varsPrimario(v.claro, false))
    Object.assign(oscuro, varsPrimario(v.oscuro, true))
  }
  if (colorFondo) {
    const v = variantesFondo(colorFondo)
    Object.assign(claro, varsFondo(v.claro, false))
    Object.assign(oscuro, varsFondo(v.oscuro, true))
  }
  return `${bloqueCss(":root", claro)}\n${bloqueCss(".dark", oscuro)}`
}
