import esCO from "@/messages/es-CO.json"
import enUS from "@/messages/en-US.json"
import esESDiferencias from "@/messages/es-ES.json"
import { fusionar, type ParcialProfundo } from "@shared/textos/fusionar"

/**
 * **El inglés no compila si le falta una clave del español.**
 *
 * Es una línea, y sustituye a lo que antes hacía un diccionario escrito en
 * TypeScript. La asignación ES la comprobación: para que `enUS` valga como
 * `typeof esCO`, tiene que traer todas sus claves con la misma forma.
 *
 * Es el único fallo de idioma que no se ve al probar — la pantalla no revienta,
 * le habla en español a quien no lo entiende— y es justo por lo que se pasó de
 * JSON a TypeScript en su día. Resulta que no hacía falta: el chequeo se
 * recupera aquí y el contenido se queda en un formato que puede abrir alguien
 * que no programa.
 */
export const mensajesEsCO = esCO
export const mensajesEnUS: typeof esCO = enUS

/**
 * España se declara como DIFERENCIAS y se fusiona contra el base.
 *
 * `ParcialProfundo` obliga a que cada clave que aparezca aquí exista en el base:
 * una diferencia sobre una clave que ya no existe deja de compilar en vez de
 * quedarse ahí para siempre sin que nadie la lea.
 */
export const mensajesEsES: typeof esCO = fusionar(
  esCO,
  esESDiferencias as ParcialProfundo<typeof esCO>
)

/** La forma que comparten los tres. Es la del base, por definición. */
export type Mensajes = typeof esCO
