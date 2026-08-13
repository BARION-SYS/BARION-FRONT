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
  /** En qué fecha CAE. Vacío = hoy. */
  ganadoEn: z
    .string()
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export type DatosAjuste = z.infer<typeof esquemaAjuste>
