import { redirect } from "next/navigation"

/**
 * Aquí vivía la lista de «Atienden», que se fusionó con la de «Acceso» en una
 * sola de personas. Lo que queda bajo esta ruta es el detalle de UNA persona
 * (`barberos/[barberoId]`), así que la ruta a secas ya no enseña nada.
 *
 * Se conserva como redirección y no se borra: es una dirección que la gente
 * tenía guardada, y un 404 no explica a dónde se fue la pantalla.
 */
export default function PersonasBarberosPage() {
  redirect("/dashboard/personas")
}
