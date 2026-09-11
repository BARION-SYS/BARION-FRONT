import { describe, expect, it } from "vitest"
import { candidatosJornada, sedeCompleta, sedesActivas } from "@features/primeros-pasos/utils/pasos"
import type { Sede } from "@features/sedes/types/sedes.types"

function sede(parcial: Partial<Sede> = {}): Sede {
  return {
    id: parcial.id ?? "1",
    nombre: "Centro",
    zonaHoraria: "America/Bogota",
    moneda: null,
    slugQr: "qr",
    telefono: null,
    direccion: parcial.direccion ?? null,
    inicioSemana: 1,
    activa: parcial.activa ?? true,
  }
}

describe("la sede de los primeros pasos", () => {
  it("está completa con calle o ciudad, no con espacios", () => {
    expect(sedeCompleta(sede({ direccion: { ciudad: "Pereira" } }))).toBe(true)
    expect(sedeCompleta(sede({ direccion: { calle: "   " } }))).toBe(false)
    expect(sedeCompleta(sede())).toBe(false)
  })

  it("una sede desactivada no cuenta", () => {
    const sedes = [sede({ id: "a", activa: false }), sede({ id: "b" })]
    expect(sedesActivas(sedes).map((s) => s.id)).toEqual(["b"])
  })
})

describe("a quién preguntarle la jornada", () => {
  it("prioriza a quien ya tiene oferta y respeta el tope", () => {
    const barberos = [
      { id: "sin", oferta: [] },
      { id: "dos", oferta: [1, 2] },
      { id: "una", oferta: [1] },
    ]
    expect(candidatosJornada(barberos, 2).map((b) => b.id)).toEqual(["dos", "una"])
  })
})
