import { describe, expect, it } from "vitest"
import {
  adopcion,
  pulsoDe,
  requierenAtencion,
  saludDeCartera,
  variacion,
} from "@features/plataforma/utils/salud"
import type { BarberiaInventario } from "@features/plataforma/types/plataforma.types"

const AHORA = new Date("2026-09-10T12:00:00.000Z")

type BarberiaParcial = Partial<Omit<BarberiaInventario, "uso">> & {
  uso?: Partial<BarberiaInventario["uso"]>
}

function barberia(parcial: BarberiaParcial = {}): BarberiaInventario {
  return {
    id: parcial.id ?? "1",
    slug: "el-corte",
    nombreComercial: "El Corte",
    codigoPais: "CO",
    estado: parcial.estado ?? "activa",
    // Vieja por defecto: el pulso de una recién nacida es otro caso.
    creadoEn: parcial.creadoEn ?? "2026-01-01T00:00:00.000Z",
    sedesActivas: 1,
    barberosActivos: 2,
    suscripcion:
      parcial.suscripcion === undefined
        ? { estado: "activa", planCodigo: "pro" }
        : parcial.suscripcion,
    uso: {
      clientesTotal: 0,
      clientesNuevos30d: 0,
      citasTotal: 0,
      citas30d: 20,
      citas30dPrevios: 20,
      ultimaCitaCreadaEn: null,
      ...parcial.uso,
    },
    propietario:
      parcial.propietario === undefined ? { nombre: "Ana", email: null } : parcial.propietario,
  }
}

describe("el pulso de una barbería", () => {
  it("no juzga a una de menos de 30 días, aunque no tenga citas", () => {
    const nueva = barberia({ creadoEn: "2026-08-25T00:00:00.000Z", uso: { citas30d: 0 } })
    expect(pulsoDe(nueva, AHORA)).toBe("nueva")
  })

  it("sin citas en 30 días está dormida", () => {
    expect(pulsoDe(barberia({ uso: { citas30d: 0, citas30dPrevios: 50 } }), AHORA)).toBe("dormida")
  })

  it("una caída del 40 % con base suficiente es caída", () => {
    expect(pulsoDe(barberia({ uso: { citas30d: 59, citas30dPrevios: 100 } }), AHORA)).toBe(
      "en_caida"
    )
  })

  it("con una base diminuta, bajar no es caer: es ruido", () => {
    expect(pulsoDe(barberia({ uso: { citas30d: 2, citas30dPrevios: 6 } }), AHORA)).toBe("estable")
  })

  it("crecer exige un 25 % y al menos cinco citas más", () => {
    expect(pulsoDe(barberia({ uso: { citas30d: 25, citas30dPrevios: 20 } }), AHORA)).toBe(
      "creciendo"
    )
    // De 2 a 3 es un 50 %, pero no es crecer.
    expect(pulsoDe(barberia({ uso: { citas30d: 3, citas30dPrevios: 2 } }), AHORA)).toBe("estable")
  })
})

describe("la variación", () => {
  it("sin base no inventa un porcentaje", () => {
    expect(variacion(12, 0)).toBeNull()
  })

  it("mide el cambio sobre el período anterior", () => {
    expect(variacion(150, 100)).toBe(50)
    expect(variacion(50, 100)).toBe(-50)
  })
})

describe("la salud de la cartera", () => {
  it("mide el pulso solo en las activas", () => {
    const segmentos = saludDeCartera(
      [
        barberia({ id: "1" }),
        barberia({ id: "2", uso: { citas30d: 0 } }),
        // Suspendida y sin citas: no es abandono, es que no puede.
        barberia({ id: "3", estado: "suspendida", uso: { citas30d: 0 } }),
        barberia({ id: "4", creadoEn: "2026-09-01T00:00:00.000Z" }),
      ],
      AHORA
    )
    const total = Object.fromEntries(segmentos.map((s) => [s.grupo, s.total]))
    expect(total).toEqual({ sanas: 1, nuevas: 1, en_riesgo: 1, sin_servicio: 1 })
  })

  it("el desglose omite las partes vacías", () => {
    const [sanas] = saludDeCartera([barberia()], AHORA)
    expect(sanas.desglose).toEqual([{ etiqueta: "estables", total: 1 }])
  })
})

describe("a quién llamar", () => {
  it("ordena por gravedad y, a igual gravedad, por clientela", () => {
    const lista = requierenAtencion(
      [
        barberia({ id: "caida", uso: { citas30d: 10, citas30dPrevios: 100, clientesTotal: 900 } }),
        barberia({ id: "mora-chica", suscripcion: { estado: "mora", planCodigo: "pro" } }),
        barberia({
          id: "mora-grande",
          suscripcion: { estado: "mora", planCodigo: "pro" },
          uso: { clientesTotal: 500 },
        }),
        barberia({ id: "sin-duenio", propietario: null }),
        barberia({ id: "sana" }),
      ],
      AHORA
    )
    expect(lista.map((item) => item.barberia.id)).toEqual([
      "sin-duenio",
      "mora-grande",
      "mora-chica",
      "caida",
    ])
  })

  it("deja fuera a las suspendidas: sobre ellas ya se decidió", () => {
    const lista = requierenAtencion(
      [barberia({ estado: "suspendida", suscripcion: { estado: "mora", planCodigo: "pro" } })],
      AHORA
    )
    expect(lista).toEqual([])
  })
})

describe("la adopción", () => {
  it("cuenta las activas que crearon al menos una cita", () => {
    expect(
      adopcion([
        barberia({ id: "1" }),
        barberia({ id: "2", uso: { citas30d: 0 } }),
        barberia({ id: "3", estado: "solo_lectura" }),
      ])
    ).toEqual({ activas: 2, usando: 1 })
  })
})
