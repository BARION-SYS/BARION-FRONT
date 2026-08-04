import { z } from "zod"

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Alta de una barbería. Lo rellena el staff de Barion al vender.
 *
 * Es un formulario largo a propósito: la barbería se entrega FUNCIONANDO, con
 * su sede y su propietario dentro. Repartirlo en varios pasos dejaría barberías
 * a medias, que es un estado del que nadie sabe salir.
 */
export const esquemaAltaBarberia = z.object({
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .regex(SLUG, "Solo minúsculas, números y guiones simples"),
  nombreComercial: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  codigoPais: z.string().length(2, "Código de dos letras (CO, US, ES)"),
  planCodigo: z.string().min(2, "Elige un plan"),
  // Sin `coerce`: el resolver exige que el schema entre y salga con la misma
  // forma, y el formulario ya entrega número gracias a `valueAsNumber`.
  diasPrueba: z.number().int().min(0).max(365).optional(),

  sedeNombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  // Vacío es válido: sin valor, la API usa el huso del país. El service lo
  // limpia antes de enviar, que es donde vive la traducción al contrato.
  sedeZonaHoraria: z.string().optional(),

  propietarioNombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  propietarioEmail: z.email("Ingresa un correo válido"),
  propietarioTelefonoE164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Formato internacional: +573001112233"),
  // Temporal: se la comunica al cliente y él la cambia al entrar. Larga porque
  // va a viajar por WhatsApp o por correo antes de que alguien la cambie.
  propietarioContrasena: z.string().min(12, "Mínimo 12 caracteres"),
})

export type DatosAltaBarberia = z.infer<typeof esquemaAltaBarberia>

export const esquemaCambioEstado = z.object({
  estado: z.enum(["activa", "suspendida", "solo_lectura"]),
})

export type DatosCambioEstado = z.infer<typeof esquemaCambioEstado>

// ── Catálogo comercial ──────────────────────────────────────────────────────

/**
 * Una tarifa tal y como la acepta la API.
 *
 * `montoCentavos` es una CADENA de dígitos en unidad menor: en la base es
 * `bigint` y en COP un entero de 32 bits se desborda a los ~21 millones de
 * pesos. La conversión desde lo que se teclea (pesos) vive en
 * `utils/planes.ts`, que es el único sitio que multiplica.
 */
export const esquemaTarifaPlan = z.object({
  codigoPais: z.string().length(2, "Código de dos letras (CO, US, ES)"),
  montoCentavos: z.string().regex(/^\d{1,18}$/, "Solo dígitos, en unidad menor"),
  moneda: z.string().length(3, "Código ISO 4217 de tres letras"),
  periodo: z.enum(["mensual", "semestral", "anual"]),
  activo: z.boolean(),
})

export type DatosTarifaPlan = z.infer<typeof esquemaTarifaPlan>

/**
 * Alta de un plan.
 *
 * `precios` va DENTRO y con al menos una tarifa: el plan y sus tarifas se
 * crean en la misma transacción porque uno publicado sin precio es un plan que
 * el sitio de venta pinta y que rechaza a quien lo elige.
 */
export const esquemaPlanNuevo = z.object({
  codigo: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG, "Solo minúsculas, números y guiones simples"),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  funciones: z.record(z.string(), z.boolean()),
  limites: z.record(z.string(), z.number().int().min(0).nullable()),
  orden: z.number().int().min(0, "Un entero de 0 en adelante"),
  activo: z.boolean(),
  precios: z.array(esquemaTarifaPlan).min(1, "Un plan necesita al menos una tarifa"),
})

export type DatosPlanNuevo = z.infer<typeof esquemaPlanNuevo>

/**
 * Edición de un plan. **`codigo` no está**: es la clave con la que se contrata
 * y con la que el sitio de venta identifica cada columna de su tabla de
 * precios, así que renombrarlo los rompería a todos a la vez sin cambiar una
 * sola fila de datos. Tampoco hay borrado: se retira con `activo: false`.
 *
 * `funciones` y `limites` se REEMPLAZAN enteros —lo que no venga queda
 * apagado—, y por eso el formulario manda siempre las claves completas.
 * `precios` es upsert por (país, período): lo que no venga se queda como
 * estaba, nunca se retira por omisión.
 */
export const esquemaPlanEdicion = esquemaPlanNuevo.omit({ codigo: true })

export type DatosPlanEdicion = z.infer<typeof esquemaPlanEdicion>

/**
 * Lo que el FORMULARIO captura, que no es lo que se envía.
 *
 * Quien pone un precio piensa en pesos y la API solo acepta unidad menor; quien
 * pone un tope escribe un número o lo deja vacío, y la API espera un entero o
 * `null`. La traducción entre las dos formas vive en `utils/planes.ts` — el
 * único sitio que multiplica por la escala de la moneda.
 *
 * El importe se pide **sin separador de miles**: `89.000` es ambiguo (¿ochenta
 * y nueve mil, u ochenta y nueve con tres decimales?) y adivinarlo del locale
 * es como se equivoca un precio por mil.
 */
export const esquemaFormularioPlan = z.object({
  codigo: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(SLUG, "Solo minúsculas, números y guiones simples"),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120"),
  orden: z.number().int().min(0, "Un entero de 0 en adelante"),
  activo: z.boolean(),
  funciones: z.record(z.string(), z.boolean()),
  /** Vacío es «sin límite», que NO es lo mismo que cero. */
  limites: z.record(z.string(), z.string().regex(/^\d*$/, "Un entero, o vacío para «sin límite»")),
  /** Clave `PAIS:periodo`. Importe vacío = esa tarifa no se manda. */
  tarifas: z.record(
    z.string(),
    z.object({
      monto: z
        .string()
        .regex(/^(?:\d+(?:[.,]\d{1,2})?)?$/, "Sin separador de miles: 89000 o 29,99"),
      activo: z.boolean(),
    })
  ),
})

export type DatosFormularioPlan = z.infer<typeof esquemaFormularioPlan>

// ── Suscripciones: la corrección de soporte ─────────────────────────────────

/**
 * Los CUATRO campos que soporte puede corregir, y ni uno más.
 *
 * `estado`, `canceladaEn`, `suspendidaEn`, `periodoActualDesde`, `graciaHasta`
 * y los identificadores de la pasarela los escribe el worker al consumir los
 * webhooks del cobro: son el registro de algo que ya ocurrió, y reescribirlos a
 * mano sería contarle a la base una historia que el banco no confirmó.
 */
export const esquemaCorreccionSuscripcion = z.object({
  planCodigo: z.string().min(2, "Elige un plan"),
  /** Instante UTC ISO-8601. Se admite una fecha pasada: soporte corrige vencimientos. */
  vigenteHasta: z.iso.datetime().optional(),
  graciaDias: z.number().int().min(0, "Entre 0 y 90 días").max(90, "Entre 0 y 90 días"),
  cancelaAlFinPeriodo: z.boolean(),
})

export type DatosCorreccionSuscripcion = z.infer<typeof esquemaCorreccionSuscripcion>

/**
 * Lo que el formulario captura: el vencimiento como DÍA (`YYYY-MM-DD`), porque
 * nadie corrige un vencimiento al segundo. La traducción al instante UTC que la
 * API espera vive en `utils/suscripciones.ts`.
 */
export const esquemaFormularioSuscripcion = z.object({
  planCodigo: z.string().min(2, "Elige un plan"),
  vigenteHasta: z.string(),
  graciaDias: z.number().int().min(0, "Entre 0 y 90 días").max(90, "Entre 0 y 90 días"),
  cancelaAlFinPeriodo: z.boolean(),
})

export type DatosFormularioSuscripcion = z.infer<typeof esquemaFormularioSuscripcion>
