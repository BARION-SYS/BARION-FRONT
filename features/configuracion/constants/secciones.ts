/**
 * Los apartados de Configuración, en el orden en que se enseñan.
 *
 * Es una lista de VALORES y no solo un tipo porque el apartado activo viaja en el
 * camino de la dirección (`/dashboard/configuracion/plan`), y lo que llega por la
 * barra de direcciones hay que comprobarlo en ejecución: un tipo no valida nada
 * en tiempo de ejecución. De aquí sale también el tipo, para que no haya dos
 * verdades sobre cuántos apartados existen.
 *
 * **Cada identificador es una carpeta de `app/dashboard/configuracion/`**, no un
 * segmento dinámico: el conjunto es cerrado, cada apartado usa hooks distintos y
 * así abrir «General» no descarga el código de los pagos. Que el apartado sea una
 * ruta es lo que permite enlazar uno concreto —el retorno de la pasarela vuelve a
 * `plan`— y que recargar no devuelva a quien estaba en «Seguridad» al principio.
 */
export const IDS_SECCION_CONFIGURACION = [
  "general",
  "apariencia",
  "plan",
  "notificaciones",
  "seguridad",
] as const

/** El apartado con el que se entra cuando la dirección no dice ninguno. */
export const SECCION_POR_DEFECTO = "general"
