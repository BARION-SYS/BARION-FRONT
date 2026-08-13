import { describe, expect, it } from "vitest"
import {
  clavesDeFunciones,
  clavesDeLimites,
  paisesDelEditor,
  planDelFormulario,
  precioDelPais,
  tarifasAEnviar,
  tarifasIntactas,
  valoresDelPlan,
} from "@features/plataforma/utils/planes"
import type { PlanAdmin } from "@features/plataforma/types/plataforma.types"

/**
 * El editor del catálogo, que es donde se escribe lo que Barion cobra.
 *
 * Aquí un fallo no se ve: se cobra. Las tres formas de equivocarse que estas
 * pruebas fijan son las tres que dejan un precio mal escrito en la base y nadie
 * lo nota hasta que llega un cargo:
 *
 * 1. **La escala.** Lo tecleado está en pesos y la api guarda centavos.
 * 2. **La clave que el formulario no conoce.** `funciones` y `limites` se
 *    REEMPLAZAN enteros: una que no se pinte desaparece en el primer guardado.
 * 3. **Vacío no es cero.** Un tope sin escribir es «sin límite»; un cero es un
 *    plan que no se puede usar.
 */
const COP = { codigoPais: "CO", moneda: "COP" }

const plan: PlanAdmin = {
  id: "p1",
  codigo: "pro",
  nombre: "Pro",
  activo: true,
  orden: 2,
  funciones: { agenda: true, campanas: false, listaDeReserva: true },
  limites: { sedes: 3, barberos: null },
  precios: [
    { codigoPais: "CO", moneda: "COP", periodo: "mensual", montoCentavos: "8900000", activo: true },
    { codigoPais: "MX", moneda: "MXN", periodo: "mensual", montoCentavos: "50000", activo: true },
  ],
  creadoEn: "2026-01-01T00:00:00.000Z",
  actualizadoEn: "2026-01-01T00:00:00.000Z",
}

describe("el precio de un país", () => {
  it("no inventa una conversión cuando no se vende ahí", () => {
    // Un precio inventado en un alta es una promesa comercial que nadie hizo.
    expect(precioDelPais({ ...plan, funciones: [] }, "ES")).toBeUndefined()
  })

  it("distingue el período: el mensual no vale por el anual", () => {
    const publico = {
      codigo: "pro",
      nombre: "Pro",
      limites: {},
      funciones: [],
      precios: plan.precios,
    }
    expect(precioDelPais(publico, "CO", "mensual")?.montoCentavos).toBe("8900000")
    expect(precioDelPais(publico, "CO", "anual")).toBeUndefined()
  })
})

describe("los mercados que el editor enseña", () => {
  it("añade los que el plan ya tiene cotizados aunque este front no los opere", () => {
    // La api valida el país contra SU lista de habilitados, que puede ir por
    // delante de `config/regiones.ts`. Un precio que existe y no se pinta es un
    // precio que nadie puede corregir.
    const paises = paisesDelEditor(plan)
    expect(paises).toContainEqual({ codigoPais: "MX", moneda: "MXN" })
    expect(paises).toContainEqual(COP)
  })

  it("sin plan son los mercados de casa", () => {
    expect(
      paisesDelEditor(null)
        .map((p) => p.codigoPais)
        .sort()
    ).toEqual(["CO", "ES", "US"])
  })
})

describe("las claves que el formulario tiene que pintar", () => {
  it("incluye las del plan que este front no conoce, y sin repetir", () => {
    // Si no se pintara, `listaDeReserva` desaparecería del plan en el primer
    // guardado sin que nadie la hubiera tocado.
    const claves = clavesDeFunciones(plan)
    expect(claves).toContain("listaDeReserva")
    expect(claves).toContain("agenda")
    expect(new Set(claves).size).toBe(claves.length)
  })

  it("hace lo mismo con los topes", () => {
    expect(clavesDeLimites(plan)).toContain("sedes")
  })
})

describe("precargar el plan en el formulario", () => {
  it("enseña el importe en lo que la gente lee, no en centavos", () => {
    // El fallo del factor cien, visto desde el editor: $89.000 precargado como
    // 8900000 se vuelve a guardar multiplicado otra vez.
    const valores = valoresDelPlan(plan, [COP])
    expect(valores.tarifas?.["CO:mensual"].monto).toBe("89000")
  })

  it("deja vacía la celda de un período que el plan no cotiza", () => {
    expect(valoresDelPlan(plan, [COP]).tarifas?.["CO:anual"].monto).toBe("")
  })

  it("un tope sin techo se precarga vacío, no como cero", () => {
    const valores = valoresDelPlan(plan, [COP])
    expect(valores.limites?.barberos).toBe("")
    expect(valores.limites?.sedes).toBe("3")
  })

  it("una bandera ausente arranca apagada", () => {
    expect(valoresDelPlan(plan, [COP]).funciones?.fidelidad).toBe(false)
  })

  it("sin plan son los valores de un alta", () => {
    const valores = valoresDelPlan(null, [COP])
    expect(valores.codigo).toBe("")
    expect(valores.activo).toBe(true)
    expect(valores.tarifas?.["CO:mensual"]).toEqual({ monto: "", activo: true })
  })
})

describe("lo que se manda", () => {
  const valores = valoresDelPlan(plan, [COP])

  it("multiplica lo tecleado a la unidad menor", () => {
    const tarifas = tarifasAEnviar(
      { ...valores, tarifas: { "CO:mensual": { monto: "89000", activo: true } } },
      [COP]
    )
    expect(tarifas).toEqual([
      {
        codigoPais: "CO",
        moneda: "COP",
        periodo: "mensual",
        montoCentavos: "8900000",
        activo: true,
      },
    ])
  })

  it("la coma y el punto decimales valen igual", () => {
    const conComa = tarifasAEnviar(
      { ...valores, tarifas: { "CO:mensual": { monto: "89,50", activo: true } } },
      [COP]
    )
    const conPunto = tarifasAEnviar(
      { ...valores, tarifas: { "CO:mensual": { monto: "89.50", activo: true } } },
      [COP]
    )
    expect(conComa[0].montoCentavos).toBe("8950")
    expect(conPunto[0].montoCentavos).toBe("8950")
  })

  it("un separador de miles NO viaja", () => {
    // `89.000` es ambiguo y adivinarlo por locale es como un precio se
    // multiplica por mil. Se queda fuera y el schema lo señala junto al campo.
    expect(
      tarifasAEnviar({ ...valores, tarifas: { "CO:mensual": { monto: "89.000", activo: true } } }, [
        COP,
      ])
    ).toEqual([])
  })

  it("una celda vacía no viaja: lo que no se manda se queda como está", () => {
    expect(
      tarifasAEnviar({ ...valores, tarifas: { "CO:mensual": { monto: "  ", activo: true } } }, [
        COP,
      ])
    ).toEqual([])
  })

  it("retirar un mercado es apagar la tarifa, no borrar el importe", () => {
    const tarifas = tarifasAEnviar(
      { ...valores, tarifas: { "CO:mensual": { monto: "89000", activo: false } } },
      [COP]
    )
    expect(tarifas[0].activo).toBe(false)
  })

  it("un tope vacío viaja como null y NO como cero", () => {
    // Un plan con cero sedes no se puede usar; uno sin techo se usa sin
    // contarlas. Es la diferencia entre vender y bloquear la cuenta.
    const cuerpo = planDelFormulario({ ...valores, limites: { sedes: "", barberos: "5" } }, [COP])
    expect(cuerpo.limites.sedes).toBeNull()
    expect(cuerpo.limites.barberos).toBe(5)
  })
})

describe("lo que sobrevive al guardado", () => {
  it("las tarifas cuya celda se dejó vacía se listan para poder decirlo", () => {
    // Con un upsert parcial lo que no se manda sobrevive, y quien guarda tiene
    // derecho a saber qué sobrevive.
    const intactas = tarifasIntactas(plan, {
      ...valoresDelPlan(plan, [COP]),
      tarifas: { "CO:mensual": { monto: "", activo: true } },
    })
    expect(intactas.map((t) => t.codigoPais)).toContain("CO")
  })

  it("en un alta no sobrevive nada porque no había nada", () => {
    expect(tarifasIntactas(null, valoresDelPlan(null, [COP]))).toEqual([])
  })
})
