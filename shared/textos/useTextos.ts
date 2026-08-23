"use client"

import { useMemo } from "react"
import { createTranslator } from "next-intl"
import { IDIOMA_POR_REGION, type Idioma } from "@shared/textos/config"
import { mensajesEnUS, mensajesEsCO, mensajesEsES, type Mensajes } from "@shared/textos/completitud"
import { useTenant } from "@shared/providers/TenantProvider"
import { useIdiomaStore } from "@store/idioma.store"
import { usePortalStore } from "@store/portal.store"

const MENSAJES: Record<Idioma, Mensajes> = {
  "es-CO": mensajesEsCO,
  "es-ES": mensajesEsES,
  "en-US": mensajesEnUS,
}

/**
 * El idioma activo y su traductor.
 *
 * ── Por qué NO hay un provider de textos ────────────────────────────────────
 * Porque no hace falta ninguno. El idioma ya vive en un store —es preferencia de
 * quien usa el panel, igual que los colores— y `createTranslator` es una función
 * suelta: se le pasan el idioma y los mensajes y devuelve el traductor. Montar
 * un contexto encima solo serviría para volver a leer lo que el store ya
 * publica, y añadiría un sitio más donde el árbol puede quedar mal ordenado.
 *
 * `NextIntlClientProvider` existe para lo que este panel no necesita: mensajes
 * que llegan desde un componente de servidor. Aquí todo lo que pinta texto es
 * cliente, así que la ruta corta es la correcta.
 *
 * ── De dónde sale el idioma, y en qué orden ─────────────────────────────────
 *
 * 1. **Lo que esa persona eligió**, si eligió algo (`idioma.store`).
 * 2. **La región de la barbería que se está mirando**, en el portal
 *    (`portal.store`): ahí no hay una persona con preferencia guardada, hay un
 *    cliente que entró por un enlace, y lo que sí hay es una barbería concreta
 *    de un país concreto. Su escaparate se lee en su idioma sin que nadie elija.
 * 3. **La región base del producto**, que es el respaldo del panel.
 *
 * **El del navegador no participa en ninguno de los tres**, y es deliberado: el
 * navegador es de quien mira y el panel es del negocio — un técnico que abre el
 * panel de una barbería colombiana con Chrome en inglés no debería cambiarle el
 * idioma a nadie.
 *
 * ── Los tres se importan de golpe ───────────────────────────────────────────
 * Y no con `import()` por idioma. Cargarlos aparte obliga a pintar algo mientras
 * llega el que toca, y ese algo sería la pantalla en español delante de quien no
 * lo habla: un parpadeo de idioma equivocado en CADA recarga, para ahorrar unos
 * kilobytes de texto.
 */
export function useIdioma(): Idioma {
  const elegido = useIdiomaStore((estado) => estado.idioma)
  const regionDelPortal = usePortalStore((estado) => estado.region)
  const tenant = useTenant()
  return elegido ?? IDIOMA_POR_REGION[regionDelPortal ?? tenant.region]
}

/**
 * El traductor de un espacio del diccionario.
 *
 * ```tsx
 * const t = useTextos("dashboard.barberos")
 * <SectionCard titulo={t("titulo")} />
 * ```
 *
 * **Con espacio, las claves son relativas a él**, que es lo que se quiere casi
 * siempre: un componente declara de qué parte del diccionario habla, y mover un
 * bloque no obliga a reescribir cada llamada.
 *
 * **Sin espacio devuelve el traductor de raíz** y las claves llevan el camino
 * entero (`t("navbar.miPerfil")`). No es el atajo del que tiene prisa: lo usan
 * las piezas que legítimamente cruzan varias áreas —el navbar enseña a la vez
 * tema, idioma, marca y notificaciones—, y obligarlas a cuatro hooks sería peor
 * que una clave más larga. En un componente de feature, si hace falta la raíz,
 * casi siempre es que el texto está en el espacio equivocado.
 *
 * Las claves y los argumentos se comprueban contra el JSON: una clave que no
 * existe no compila, y a un mensaje con `{nombre}` dentro no se le puede olvidar
 * el dato.
 */
export function useTextos<Espacio extends EspacioMensajes>(
  espacio: Espacio
): ReturnType<typeof createTranslator<Mensajes, Espacio>>
export function useTextos(): ReturnType<typeof createTranslator<Mensajes>>
export function useTextos(espacio?: string) {
  const idioma = useIdioma()

  return useMemo(
    () =>
      createTranslator({
        locale: idioma,
        messages: MENSAJES[idioma],
        ...(espacio ? { namespace: espacio as EspacioMensajes } : {}),
      }),
    [idioma, espacio]
  )
}

/**
 * Los espacios que se pueden pedir: cualquier objeto del diccionario, a
 * cualquier profundidad. Sale del JSON, así que renombrar un bloque rompe la
 * compilación de quien lo pedía en vez de devolver mensajes vacíos.
 */
type EspacioMensajes = EspaciosDe<Mensajes>

type EspaciosDe<T, Prefijo extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${Prefijo}${K}` | EspaciosDe<T[K], `${Prefijo}${K}.`>
    : never
}[keyof T & string]
