/**
 * Cómo se mueve la aplicación. **Una sola receta** — el par de
 * `BARION-WEB/lib/movimiento.ts` (mismos nombres y valores; no se comparte
 * código entre repos, se copia a propósito).
 *
 * Las reglas que hay detrás:
 * - La respuesta va en la pulsación, no al soltar (los botones bajan a 0,97).
 * - Nada de la interfaz pasa de 300 ms; las salidas, más rápidas que las entradas.
 * - Lo que se puede interrumpir usa muelle, que parte del valor que hay en pantalla.
 * - Con «reducir movimiento» manda el `MotionConfig reducedMotion="user"`.
 */
// ── Muelles con nombre ──────────────────────────────────────────────────────
// Tomados de cómo los usa Apple (WWDC «Designing Fluid Interfaces»): por
// defecto CRÍTICAMENTE AMORTIGUADOS —damping = 2·√stiffness, sin rebote—, y
// rebote solo cuando lo que se mueve llega con impulso. Van como
// `{ stiffness, damping }` para servir igual a `transition` (con
// `type: "spring"`) que a `useSpring`. Ninguna pantalla escribe sus números.

/** Contenido que entra o cambia de sitio: vistas, tarjetas, paneles. */
export const RESORTE = { stiffness: 260, damping: 32 } as const
/** Controles pequeños que responden al dedo: indicadores, píldoras, checks. */
export const RESORTE_RAPIDO = { stiffness: 500, damping: 45 } as const
/** Lo que llega con impulso y puede pasarse un poco (ratio 0,8). */
export const RESORTE_VIVO = { stiffness: 420, damping: 33 } as const
/** Lo que sigue al scroll o al puntero: suaviza sin quedarse atrás. */
export const RESORTE_SUAVE = { stiffness: 100, damping: 20 } as const

// ── Curvas ─────────────────────────────────────────────────────────────────
/** Salida fuerte: arranca de inmediato y se asienta. La curva por defecto. */
export const CURVA_SALIDA = [0.23, 1, 0.32, 1] as const
/** La de las hojas de iOS: para lo que entra o sale deslizando (cajones, hojas). */
export const CURVA_IOS = [0.32, 0.72, 0, 1] as const

/** Las salidas son más rápidas que las entradas: lo que se va no hace esperar. */
export const TRANSICION_SALIDA = { duration: 0.18, ease: CURVA_SALIDA } as const
