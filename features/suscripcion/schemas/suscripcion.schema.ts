import { z } from "zod"

/**
 * Lo único que esta pantalla envía: qué plan y cada cuánto se cobra.
 *
 * El país no viaja — lo pone el servidor a partir de la barbería—, y mandarlo
 * dejaría comprar la tarifa de otro país desde aquí.
 */
export const esquemaElegirPlan = z.object({
  planCodigo: z.string().min(1, "Elige un plan"),
  periodo: z.enum(["mensual", "anual"]),
})

export type DatosElegirPlan = z.infer<typeof esquemaElegirPlan>
