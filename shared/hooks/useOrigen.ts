"use client"

import { useMontado } from "@shared/hooks/useMontado"

/**
 * El dominio por el que se está sirviendo la aplicación, para ENSEÑARLO.
 *
 * Hace falta cuando hay que mostrarle a alguien una dirección suya —«esto es lo
 * que compartes con tus clientes»— y esa dirección tiene que ser la real: un
 * dominio escrito a mano en el código enseña `barion.app` en un despliegue que
 * vive en otro sitio, y quien lo copie compartirá un enlace que no existe.
 *
 * No es una variable de entorno a propósito: el navegador ya sabe por dónde
 * entró, y una variable más que configurar es una variable más que se olvida.
 *
 * Devuelve cadena vacía en el servidor y en el primer render del cliente: el
 * marcado tiene que coincidir en los dos lados o React descarta la hidratación
 * entera. Por eso lo que se pinta con esto lleva siempre la ruta delante, que sí
 * se conoce desde el principio.
 */
export function useOrigen(): string {
  return useMontado() ? window.location.origin : ""
}
