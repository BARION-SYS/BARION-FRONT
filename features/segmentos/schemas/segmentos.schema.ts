import { z } from "zod"

/**
 * Lo que se envía al crear o editar una etiqueta.
 *
 * ── El criterio se declara en piezas y se arma en el service ────────────────
 * En el contrato es un objeto cuya forma depende del tipo (`dias`,
 * `visitas_min`, `centavos`…). En el formulario son dos campos: cuál y cuánto.
 * Traducir de lo uno a lo otro es trabajo del service, que es quien conoce la
 * tabla de criterios; el schema solo se asegura de que lo tecleado sea usable.
 *
 * ── Por qué `tipo` no se valida contra el estado del formulario ─────────────
 * Un dinámico exige criterio y un estático lo prohíbe, pero esa regla la impone
 * la api con un 422 y la pantalla la impone antes escondiendo el campo. Repetirla
 * aquí como un `refine` cruzado añadiría una tercera copia de la misma regla,
 * que es una más de las que se pueden desincronizar.
 */
export const esquemaSegmento = z.object({
  nombre: z.string().trim().min(2, "Ponle un nombre de al menos dos letras").max(120),
  /**
   * Vacío se queda como cadena vacía y lo descarta `omitEmpty` en el service.
   * Sin `transform`: convertirlo aquí separaría el tipo de lo que se teclea del
   * de lo que sale, y el formulario y el schema dejarían de hablar del mismo
   * objeto.
   */
  descripcion: z.string().trim().max(500, "Demasiado largo para una descripción").optional(),
  tipo: z.enum(["dinamico", "estatico"]),
  criterioTipo: z.string().optional(),
  /**
   * Se teclea, así que llega como texto. Vacío es ausencia —la api pone su valor
   * por defecto— y no cero, que en «gasto mínimo» significaría otra cosa.
   */
  criterioValor: z
    .string()
    .trim()
    .optional()
    .refine((valor) => !valor || !Number.isNaN(Number(valor)), {
      message: "Tiene que ser un número",
    })
    .refine((valor) => !valor || Number(valor) >= 0, {
      message: "No puede ser negativo",
    }),
  esEtiqueta: z.boolean(),
  /**
   * El desempate cuando alguien cae en varias etiquetas: gana la mayor. Es lo
   * que hace que la insignia del cliente sea UNA y no dependa del orden en que
   * la base devuelva las filas.
   */
  prioridad: z
    .string()
    .trim()
    .refine((valor) => !valor || (Number(valor) >= 0 && Number(valor) <= 32767), {
      message: "Entre 0 y 32767",
    }),
})

export type DatosSegmento = z.infer<typeof esquemaSegmento>
