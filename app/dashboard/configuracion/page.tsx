import { redirect } from "next/navigation"
import { SECCION_POR_DEFECTO } from "@features/configuracion/constants/secciones"
import { rutaDeSeccion } from "@features/configuracion/utils/secciones"

/**
 * Configuración no tiene pantalla propia: es un conjunto de apartados y hay que
 * estar en uno.
 *
 * La raíz redirige al primero en vez de duplicar aquí su contenido, así la
 * dirección siempre dice qué se está mirando —se puede compartir y recargar— y no
 * existen dos caminos que pinten lo mismo. La entrada del sidebar sigue apuntando
 * a la raíz a propósito: es lo que la deja marcada estando en cualquier apartado.
 */
export default function ConfiguracionPage() {
  redirect(rutaDeSeccion(SECCION_POR_DEFECTO))
}
