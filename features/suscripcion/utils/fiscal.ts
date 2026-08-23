import type {
  TipoDocumentoFiscal,
  TipoPersonaFiscal,
} from "@features/suscripcion/types/suscripcion.types"

/**
 * Qué pide cada país, que es lo que decide el formulario.
 *
 * Un formulario único para los tres pediría campos que en dos de ellos no
 * significan nada: el código DANE no existe en España y las responsabilidades
 * de la DIAN no existen en Estados Unidos. La api rechaza esos campos fuera de
 * Colombia, así que ofrecerlos sería ofrecer un 422.
 *
 * Esto es un **espejo** de lo que valida el servidor, no la verdad: manda la
 * api, y aquí solo se evita pedir lo que se va a rechazar.
 */
export interface ReglasFiscales {
  /** Qué documento se acepta, según la clase de persona. */
  documentos: Record<TipoPersonaFiscal, TipoDocumentoFiscal[]>
  pideMunicipio: boolean
  pideResponsabilidades: boolean
  /** Ejemplo del número, que es la mitad de la instrucción. */
  ejemplos: Partial<Record<TipoDocumentoFiscal, string>>
}

const REGLAS: Record<string, ReglasFiscales> = {
  CO: {
    documentos: { juridica: ["nit"], natural: ["cc", "ce", "pasaporte"] },
    pideMunicipio: true,
    pideResponsabilidades: true,
    ejemplos: { nit: "900123456-8", cc: "1017254896", ce: "1234567", pasaporte: "AB123456" },
  },
  ES: {
    documentos: { juridica: ["cif"], natural: ["nif"] },
    pideMunicipio: false,
    pideResponsabilidades: false,
    ejemplos: { cif: "B12345674", nif: "12345678Z" },
  },
  US: {
    documentos: { juridica: ["ein"], natural: ["ein"] },
    pideMunicipio: false,
    pideResponsabilidades: false,
    ejemplos: { ein: "12-3456789" },
  },
}

/** `null` = Barion todavía no factura en ese país, y la api responde 422. */
export function reglasFiscalesDe(codigoPais: string | null): ReglasFiscales | null {
  return codigoPais ? (REGLAS[codigoPais] ?? null) : null
}

/**
 * **Esto NO se traduce, y es una decisión y no un olvido.**
 *
 * Son los nombres oficiales de documentos de identidad de cada país: la «cédula
 * de ciudadanía» es un documento colombiano concreto, igual que el NIF español o
 * el EIN estadounidense. Traducirlos inventaría un documento que no existe, y
 * quien lo busca en su cartera necesita leer el nombre que lleva impreso.
 *
 * Es la misma regla que ya rige para lo que llega de la api: traducir un dato es
 * inventárselo. Aquí el dato no viene de la api, viene de una autoridad fiscal.
 */
export const ETIQUETA_TIPO_DOCUMENTO: Record<TipoDocumentoFiscal, string> = {
  nit: "NIT",
  cc: "Cédula de ciudadanía",
  ce: "Cédula de extranjería",
  pasaporte: "Pasaporte",
  nif: "NIF",
  cif: "CIF",
  ein: "EIN",
}

/**
 * Las responsabilidades fiscales de la DIAN que usa una barbería. Son códigos
 * opacos —Barion los transporta y no los interpreta—, así que se eligen de una
 * lista con su nombre al lado en vez de teclearse: `O-15` no se adivina.
 *
 * **Tampoco se traducen**, por lo mismo que los documentos de arriba: son los
 * nombres oficiales que publica la DIAN, y «Autorretenedor» traducido no lo
 * reconocería ni el contador que tiene que confirmarlo.
 */
export const RESPONSABILIDADES_DIAN: { codigo: string; nombre: string }[] = [
  { codigo: "O-13", nombre: "Gran contribuyente" },
  { codigo: "O-15", nombre: "Autorretenedor" },
  { codigo: "O-23", nombre: "Agente de retención de IVA" },
  { codigo: "O-47", nombre: "Régimen simple de tributación" },
  { codigo: "R-99-PN", nombre: "No responsable / sin responsabilidades especiales" },
]
