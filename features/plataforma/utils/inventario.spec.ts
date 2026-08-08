import { describe, expect, it } from "vitest"
import {
  distribucionPorEstado,
  resumirInventario,
  topClientela,
  ultimasAltas,
  usoPorPais,
} from "@features/plataforma/utils/inventario"
import type { BarberiaInventario } from "@features/plataforma/types/plataforma.types"

/**
 * La aritmética del tablero de la plataforma.
 *
 * Se prueba aquí y no en la pantalla porque **es la única verdad de esos
 * números**: el tablero no pide agregados a la api, los cuenta sobre el
 * inventario completo. Un error aquí no rompe nada — pinta una cifra creíble y
 * equivocada, que es la peor forma de fallar en un panel del que se toman
 * decisiones de negocio.
 */
function barberia(parcial: Partial<BarberiaInventario> = {}): BarberiaInventario {
  return {
    id: parcial.id ?? "1",
    slug: parcial.slug ?? "el-corte",
    nombreComercial: parcial.nombreComercial ?? "El Corte",
    codigoPais: parcial.codigoPais ?? "CO",
    estado: parcial.estado ?? "activa",
    creadoEn: parcial.creadoEn ?? "2026-08-01T00:00:00.000Z",
    sedesActivas: parcial.sedesActivas ?? 1,
    barberosActivos: parcial.barberosActivos ?? 2,
    suscripcion: parcial.suscripcion ?? { estado: "activa", planCodigo: "pro" },
    uso: {
      clientesTotal: 0,
      clientesNuevos30d: 0,
      citasTotal: 0,
      citas30d: 0,
      ultimaCitaCreadaEn: null,
      ...parcial.uso,
    },
    propietario: parcial.propietario ?? { nombre: "Ana", email: "ana@ejemplo.com" },
  }
}

describe("el resumen del área", () => {
  it("suma la clientela y la actividad de todas", () => {
    const resumen = resumirInventario([
      barberia({
        id: "1",
        uso: {
          clientesTotal: 400,
          clientesNuevos30d: 18,
          citasTotal: 3_000,
          citas30d: 200,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "2",
        uso: {
          clientesTotal: 100,
          clientesNuevos30d: 2,
          citasTotal: 500,
          citas30d: 40,
          ultimaCitaCreadaEn: null,
        },
      }),
    ])
    expect(resumen.clientesTotal).toBe(500)
    expect(resumen.clientesNuevos30d).toBe(20)
    expect(resumen.citasTotal).toBe(3_500)
    expect(resumen.citas30d).toBe(240)
  })

  it("cuenta como inactiva la que no creó NINGUNA cita en 30 días", () => {
    // «Cero este mes» y «nunca tuvo ninguna» cuentan igual: las dos son una
    // barbería que no está usando lo que contrató. Es la señal que se adelanta
    // al impago.
    const resumen = resumirInventario([
      barberia({
        id: "1",
        uso: {
          clientesTotal: 400,
          clientesNuevos30d: 0,
          citasTotal: 3_000,
          citas30d: 0,
          ultimaCitaCreadaEn: "2026-01-02T00:00:00.000Z",
        },
      }),
      barberia({
        id: "2",
        uso: {
          clientesTotal: 0,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 0,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "3",
        uso: {
          clientesTotal: 10,
          clientesNuevos30d: 1,
          citasTotal: 10,
          citas30d: 5,
          ultimaCitaCreadaEn: null,
        },
      }),
    ])
    expect(resumen.inactivas30d).toBe(2)
  })

  it("sin barberías no inventa nada", () => {
    const resumen = resumirInventario([])
    expect(resumen.total).toBe(0)
    expect(resumen.clientesTotal).toBe(0)
    expect(resumen.inactivas30d).toBe(0)
  })

  it("enseña los tres estados aunque alguno esté en cero", () => {
    // La ausencia es el dato: que no haya ninguna suspendida hay que poder verlo.
    const segmentos = distribucionPorEstado([barberia()])
    expect(segmentos).toHaveLength(3)
    expect(segmentos.find((s) => s.clave === "suspendida")?.total).toBe(0)
  })
})

describe("el uso por país", () => {
  it("agrupa las tres cifras y ordena por CLIENTELA, no por número de barberías", () => {
    // Es la razón de que esto dejara de ser una gráfica de barras: cuatro
    // barberías con más clientela que dieciocho dormidas es el caso que una
    // sola barra tapa.
    const paises = usoPorPais([
      barberia({
        id: "1",
        codigoPais: "CO",
        uso: {
          clientesTotal: 10,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 1,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "2",
        codigoPais: "CO",
        uso: {
          clientesTotal: 10,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 1,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "3",
        codigoPais: "ES",
        uso: {
          clientesTotal: 500,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 90,
          ultimaCitaCreadaEn: null,
        },
      }),
    ])
    expect(paises[0].codigo).toBe("ES")
    expect(paises[0].clientes).toBe(500)
    expect(paises[1]).toMatchObject({ codigo: "CO", barberias: 2, clientes: 20, citas30d: 2 })
  })

  it("traduce el código de los países que Barion opera y respeta el resto", () => {
    const paises = usoPorPais([
      barberia({ codigoPais: "CO" }),
      barberia({ id: "2", codigoPais: "MX" }),
    ])
    expect(paises.map((p) => p.nombre)).toContain("Colombia")
    expect(paises.map((p) => p.nombre)).toContain("MX")
  })
})

describe("el ranking de clientela", () => {
  it("ordena por clientela y desempata por actividad", () => {
    const orden = topClientela([
      barberia({
        id: "poca",
        uso: {
          clientesTotal: 5,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 99,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "empate-dormida",
        uso: {
          clientesTotal: 100,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 0,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "empate-viva",
        uso: {
          clientesTotal: 100,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 30,
          ultimaCitaCreadaEn: null,
        },
      }),
    ])
    expect(orden.map((b) => b.id)).toEqual(["empate-viva", "empate-dormida", "poca"])
  })

  it("deja fuera a las que no tienen clientela en vez de rellenar con ceros", () => {
    // Una tabla de «top» completada con ceros sugiere un orden donde no hay
    // nada que ordenar.
    const orden = topClientela([
      barberia({
        id: "con",
        uso: {
          clientesTotal: 3,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 0,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({ id: "sin" }),
    ])
    expect(orden.map((b) => b.id)).toEqual(["con"])
  })

  it("no reordena la lista que recibe", () => {
    // El tablero deriva varias vistas del MISMO array con `useMemo`: ordenar en
    // sitio cambiaría el resultado de las otras según cuál se calculara antes.
    const lista = [
      barberia({
        id: "a",
        uso: {
          clientesTotal: 1,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 0,
          ultimaCitaCreadaEn: null,
        },
      }),
      barberia({
        id: "b",
        uso: {
          clientesTotal: 9,
          clientesNuevos30d: 0,
          citasTotal: 0,
          citas30d: 0,
          ultimaCitaCreadaEn: null,
        },
      }),
    ]
    topClientela(lista)
    expect(lista.map((b) => b.id)).toEqual(["a", "b"])
  })
})

describe("las últimas altas", () => {
  it("van de la más reciente a la más antigua y no tocan el original", () => {
    const lista = [
      barberia({ id: "vieja", creadoEn: "2026-01-01T00:00:00.000Z" }),
      barberia({ id: "nueva", creadoEn: "2026-08-01T00:00:00.000Z" }),
    ]
    expect(ultimasAltas(lista).map((b) => b.id)).toEqual(["nueva", "vieja"])
    expect(lista.map((b) => b.id)).toEqual(["vieja", "nueva"])
  })
})
