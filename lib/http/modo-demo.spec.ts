import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { rechazoDemo, setModoDemo } from "@lib/http/modo-demo"

const { info } = vi.hoisted(() => ({ info: vi.fn() }))
vi.mock("@shared/services/notify", () => ({ notify: { demo: info } }))

/**
 * La demo corta las escrituras en el cliente. Lo que se fija aquí es lo que, si
 * se rompe, se nota mal: que una sesión normal NO quede bloqueada, y que desde
 * la demo SIEMPRE se pueda salir.
 */
describe("rechazoDemo", () => {
  // Cada prueba en su propio minuto: la pausa entre avisos no se arrastra.
  let reloj = 0
  beforeEach(() => {
    vi.useFakeTimers()
    reloj += 60_000
    vi.setSystemTime(reloj)
  })

  afterEach(() => {
    vi.useRealTimers()
    setModoDemo({ activo: false })
    info.mockClear()
  })

  it("deja pasar todo fuera de la demo", () => {
    expect(rechazoDemo("/citas")).toBeNull()
    expect(info).not.toHaveBeenCalled()
  })

  it("en la demo rechaza la escritura con el aviso traducido", () => {
    setModoDemo({ activo: true, mensaje: "Es la demo" })
    expect(rechazoDemo("/citas")).toEqual({ status: 403, message: "Es la demo", codigo: "demo" })
    expect(info).toHaveBeenCalledWith("Es la demo")
  })

  it("en la demo deja salir y volver a entrar", () => {
    setModoDemo({ activo: true, mensaje: "Es la demo" })
    expect(rechazoDemo("/auth/logout")).toBeNull()
    expect(rechazoDemo("/auth/demo")).toBeNull()
  })

  it("no apila avisos en una ráfaga de guardados", () => {
    setModoDemo({ activo: true, mensaje: "Es la demo" })
    rechazoDemo("/citas")
    rechazoDemo("/clientes")
    rechazoDemo("/servicios")
    expect(info).toHaveBeenCalledTimes(1)
  })
})
