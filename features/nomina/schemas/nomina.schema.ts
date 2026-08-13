import { z } from "zod"

/**
 * Un ajuste de nómina: el único asiento que se escribe a mano.
 *
 * **No corrige, suma.** El ledger es inmutable por trigger, así que arreglar una
 * propina mal tecleada o pagar un festivo pactado aparte es añadir una fila, y
 * el error de un ajuste se arregla con otro ajuste.
 *
 * El monto lleva SIGNO —negativo descuenta— y va en unidad mayor: quien lo
 * teclea piensa en pesos. El service lo convierte a centavos antes de enviar.
 */
export const esquemaAjuste = z.object({
  barberoId: z.uuid("Elige a quién se le ajusta"),
  monto: z
    .string()
    .trim()
    .min(1, "Escribe cuánto")
    .refine((valor) => Number(valor) !== 0 && !Number.isNaN(Number(valor)), {
      message: "Un ajuste de cero no corrige nada",
    }),
  motivo: z
    .string()
    .trim()
    .min(3, "Di por qué: es lo que se lee meses después")
    .max(500, "Máximo 500 caracteres"),
  /**
   * En qué fecha CAE. Vacío = hoy, y por eso se convierte en ausencia AQUÍ: un
   * `""` viajaría como fecha y la api lo rechazaría por un campo que nadie
   * rellenó a propósito. `.or(z.literal(""))` no sirve —`.optional()` acepta la
   * cadena vacía primero y la rama nunca se ejecuta—, así que se transforma.
   */
  ganadoEn: z
    .string()
    .trim()
    .optional()
    .transform((valor) => valor || undefined),
})

/** Lo que se TECLEA: la fecha sigue siendo cadena vacía mientras no se toque. */
export type EntradaAjuste = z.input<typeof esquemaAjuste>

/** Lo que sale validado, que es lo que se envía. */
export type DatosAjuste = z.output<typeof esquemaAjuste>
