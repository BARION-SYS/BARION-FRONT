import { regiones } from "@config/regiones"
import {
  ETIQUETA_FUNCION,
  ETIQUETA_LIMITE,
  PERIODOS_TARIFA,
} from "@features/plataforma/constants/planes.copy"
import { toMajorUnits, toMinorUnits } from "@shared/utils/currency"
import type {
  DatosFormularioPlan,
  DatosPlanNuevo,
  DatosTarifaPlan,
} from "@features/plataforma/schemas/plataforma.schema"
import type {
  PeriodoTarifa,
  PlanAdmin,
  PlanPlataforma,
  PrecioPlan,
  PrecioPlanAdmin,
} from "@features/plataforma/types/plataforma.types"

/**
 * El texto de una bandera o de un tope.
 *
 * `funciones` y `limites` son jsonb libres: una clave nueva aparece sin que
 * nadie toque el front. Se enseña con su nombre crudo en vez de esconderse —
 * fea, pero visible: un plan que cuenta media verdad es peor.
 */
export function etiquetaFuncion(clave: string): string {
  return ETIQUETA_FUNCION[clave] ?? clave
}

export function etiquetaLimite(clave: string): string {
  return ETIQUETA_LIMITE[clave] ?? clave
}

/**
 * El precio de un plan en un país concreto.
 *
 * Sin precio activo ahí no se inventa una conversión: se devuelve `undefined` y
 * quien lo pinta dice que hay que consultarlo. Un precio inventado en un alta se
 * convierte en una promesa comercial que nadie hizo.
 */
export function precioDelPais(
  plan: PlanPlataforma,
  codigoPais: string,
  periodo = "mensual"
): PrecioPlan | undefined {
  return plan.precios.find((p) => p.codigoPais === codigoPais && p.periodo === periodo)
}

// ── El editor del catálogo ──────────────────────────────────────────────────

/**
 * Un importe aceptable: dígitos y, como mucho, dos decimales tras coma o punto.
 * El mismo que valida el schema — sin separador de miles, porque `89.000` es
 * ambiguo y adivinarlo del locale es como un precio se multiplica por mil.
 */
const IMPORTE = /^\d+(?:[.,]\d{1,2})?$/

/** Un mercado del editor: el país y la moneda con la que se cotiza en él. */
export interface PaisTarifa {
  codigoPais: string
  moneda: string
}

/** La clave con la que el formulario indexa una celda de la rejilla de tarifas. */
export function claveTarifa(codigoPais: string, periodo: PeriodoTarifa): string {
  return `${codigoPais}:${periodo}`
}

/**
 * Los mercados que el editor enseña: los que Barion opera hoy, más cualquier
 * otro que el plan ya tenga cotizado.
 *
 * Lo segundo no es rebuscado: la API valida el país contra los que están
 * habilitados en la plataforma, que es una lista suya y puede ir por delante de
 * `config/regiones.ts`. Un precio que existe y que la pantalla no enseña es un
 * precio que nadie puede corregir.
 *
 * La moneda sale del país y no se elige: la API exige que sea la oficial de ese
 * mercado, así que ofrecerla como campo solo serviría para provocar un 422.
 */
export function paisesDelEditor(plan?: PlanAdmin | null): PaisTarifa[] {
  const mercados = new Map<string, string>(
    Object.entries(regiones).map(([codigo, config]) => [codigo, config.moneda])
  )
  for (const precio of plan?.precios ?? []) {
    if (!mercados.has(precio.codigoPais)) mercados.set(precio.codigoPais, precio.moneda)
  }
  return [...mercados.entries()].map(([codigoPais, moneda]) => ({ codigoPais, moneda }))
}

/**
 * Todas las claves que el editor tiene que ofrecer: las que este front sabe
 * redactar, más las que el plan ya trae.
 *
 * Lo segundo importa porque `funciones` y `limites` se REEMPLAZAN enteros: una
 * clave que el formulario no conociera y por eso no pintara desaparecería del
 * plan en el primer guardado, sin que nadie la hubiera tocado.
 */
export function clavesDeFunciones(plan?: PlanAdmin | null): string[] {
  return unir(Object.keys(ETIQUETA_FUNCION), Object.keys(plan?.funciones ?? {}))
}

export function clavesDeLimites(plan?: PlanAdmin | null): string[] {
  return unir(Object.keys(ETIQUETA_LIMITE), Object.keys(plan?.limites ?? {}))
}

function unir(conocidas: string[], delPlan: string[]): string[] {
  return [...new Set([...conocidas, ...delPlan])]
}

/**
 * El plan como lo entiende el formulario. Con `plan` en `null` son los valores
 * de un alta: todas las banderas apagadas, todos los topes sin límite y ninguna
 * tarifa escrita.
 *
 * El importe se precarga en unidad MAYOR —lo que la gente lee— y con los
 * decimales que la moneda tenga de verdad: `8900000` en COP vuelve como
 * `89000`, no como `8900000`.
 */
export function valoresDelPlan(plan: PlanAdmin | null, paises: PaisTarifa[]): DatosFormularioPlan {
  const funciones: Record<string, boolean> = {}
  for (const clave of clavesDeFunciones(plan)) funciones[clave] = plan?.funciones[clave] === true

  const limites: Record<string, string> = {}
  for (const clave of clavesDeLimites(plan)) {
    const valor = plan?.limites[clave]
    limites[clave] = typeof valor === "number" ? String(valor) : ""
  }

  const tarifas: DatosFormularioPlan["tarifas"] = {}
  for (const { codigoPais, moneda } of paises) {
    for (const periodo of PERIODOS_TARIFA) {
      const precio = plan?.precios.find((p) => p.codigoPais === codigoPais && p.periodo === periodo)
      tarifas[claveTarifa(codigoPais, periodo)] = {
        monto: precio ? textoDeCentavos(precio.montoCentavos, moneda) : "",
        activo: precio ? precio.activo : true,
      }
    }
  }

  return {
    codigo: plan?.codigo ?? "",
    nombre: plan?.nombre ?? "",
    orden: plan?.orden ?? 0,
    activo: plan?.activo ?? true,
    funciones,
    limites,
    tarifas,
  }
}

/**
 * Las tarifas que el envío va a llevar: las celdas CON importe escrito.
 *
 * Una celda vacía no viaja, y eso es exactamente lo que el contrato hace con lo
 * que no se manda —lo deja como está—. Para dejar de vender en un mercado no se
 * borra el importe: se apaga la tarifa, que viaja con `activo: false`.
 */
export function tarifasAEnviar(
  valores: DatosFormularioPlan,
  paises: PaisTarifa[]
): DatosTarifaPlan[] {
  const tarifas: DatosTarifaPlan[] = []
  for (const { codigoPais, moneda } of paises) {
    for (const periodo of PERIODOS_TARIFA) {
      const celda = valores.tarifas?.[claveTarifa(codigoPais, periodo)]
      // Lo que todavía no es un importe no viaja Y no se resume: la validación
      // del schema lo señala junto al campo, y mientras tanto el resumen no
      // puede enseñar una cifra que salió de interpretar a medias lo tecleado.
      if (!celda || !IMPORTE.test(celda.monto.trim())) continue
      tarifas.push({
        codigoPais,
        moneda,
        periodo,
        montoCentavos: aCentavosDeTexto(celda.monto, moneda),
        activo: celda.activo,
      })
    }
  }
  return tarifas
}

/**
 * Las tarifas que YA existen y que este envío no toca — las que se quedan como
 * están porque su celda se dejó vacía.
 *
 * Existe para poder decirlo en pantalla: con un upsert parcial, lo que no se
 * manda sobrevive, y quien guarda tiene derecho a saber qué sobrevive.
 */
export function tarifasIntactas(
  plan: PlanAdmin | null,
  valores: DatosFormularioPlan
): PrecioPlanAdmin[] {
  if (!plan) return []
  return plan.precios.filter((precio) => {
    const celda = valores.tarifas?.[claveTarifa(precio.codigoPais, precio.periodo as PeriodoTarifa)]
    return !celda || celda.monto.trim() === ""
  })
}

/** El formulario entero como lo espera la API. El alta usa todo; la edición omite `codigo`. */
export function planDelFormulario(
  valores: DatosFormularioPlan,
  paises: PaisTarifa[]
): DatosPlanNuevo {
  const limites: Record<string, number | null> = {}
  for (const [clave, valor] of Object.entries(valores.limites ?? {})) {
    // Vacío es «sin límite» (`null`), que no es cero: un plan con cero sedes no
    // se puede usar y uno sin techo se usa sin contarlas.
    limites[clave] = valor.trim() === "" ? null : Number(valor)
  }

  return {
    codigo: valores.codigo,
    nombre: valores.nombre,
    funciones: valores.funciones,
    limites,
    orden: valores.orden,
    activo: valores.activo,
    precios: tarifasAEnviar(valores, paises),
  }
}

/**
 * Lo tecleado → unidad menor, como CADENA de dígitos.
 *
 * Es el único sitio que multiplica, y el único que decide qué separador es
 * decimal: la coma y el punto valen igual, y el de miles no se admite (lo
 * rechaza el schema) porque distinguirlos por locale es como un precio se
 * multiplica por mil.
 */
function aCentavosDeTexto(monto: string, moneda: string): string {
  return String(toMinorUnits(Number(monto.trim().replace(",", ".")), moneda))
}

/** Unidad menor → el texto que se precarga en el campo, sin separadores de miles. */
function textoDeCentavos(montoCentavos: string, moneda: string): string {
  return String(toMajorUnits(Number(montoCentavos), moneda))
}
