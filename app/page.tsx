import { redirect } from "next/navigation"
import { rutasPublicas } from "@routes/rutasPublicas"

/**
 * La raíz de la APLICACIÓN no tiene contenido propio: quien vende es el sitio
 * público (repo BARION-WEB, otro dominio). Quien escribe el dominio del panel a
 * secas quiere entrar, así que se le lleva a la puerta en vez de enseñarle un
 * 404 o rebotarlo fuera.
 */
export default function RaizPage() {
  redirect(rutasPublicas.entrar)
}
