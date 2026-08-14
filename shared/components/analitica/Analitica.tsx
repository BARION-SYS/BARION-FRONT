"use client"

import { Analytics } from "@vercel/analytics/next"
import { usePathname } from "next/navigation"

/**
 * Rutas donde NO se carga ningún script de terceros.
 *
 * Son aquellas en las que se teclea una tarjeta. El número no llega a Barion
 * —se tokeniza en el navegador contra el dominio de la pasarela— pero eso solo
 * vale mientras la página que lo captura no ejecute código de nadie más: un
 * script de terceros en esa pantalla puede leer el campo antes de que el
 * formulario lo mande a ningún sitio.
 *
 * Y no es solo un riesgo teórico: es lo que separa el cuestionario PCI **SAQ A**
 * del **A-EP**. La página que sirve el formulario de la tarjeta entra en el
 * alcance, así que cada script que corre ahí hay que poder nombrarlo, justificar
 * por qué está y detectar cuándo cambia. Cero scripts es la única respuesta que
 * no exige mantener nada.
 *
 * Se comparan por prefijo porque de estas rutas cuelgan pantallas hijas.
 */
const RUTAS_SIN_TERCEROS = ["/pago", "/dashboard/configuracion/plan"]

/**
 * La analítica de uso, con una excepción.
 *
 * En producción se carga en todo el panel y en el escaparate: saber qué se usa
 * y qué no es lo que evita construir sobre suposiciones. Fuera de producción no
 * se carga nada, porque medir el desarrollo de uno mismo no mide nada.
 *
 * **Va en un componente propio y no suelta en el layout** justo por la
 * excepción: el layout es Server Component y no conoce la ruta, así que la
 * decisión necesita `usePathname()`. Meter el `'use client'` en el layout para
 * esto habría convertido el árbol entero en cliente.
 */
export function Analitica() {
  const ruta = usePathname()

  if (process.env.NODE_ENV !== "production") return null
  if (RUTAS_SIN_TERCEROS.some((prefijo) => ruta.startsWith(prefijo))) return null

  return <Analytics />
}
