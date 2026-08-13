import { describe, expect, it } from "vitest"
import { appDeSesion, puede, puedeAlguna } from "@features/auth/utils/permisos"
import type { Sesion } from "@features/auth/types/auth.types"

/**
 * Quién ve qué.
 *
 * Ocultar un botón NO es seguridad —la api vuelve a comprobar el permiso en cada
 * petición—, así que lo que se prueba aquí no es el aislamiento: es que no se
 * ofrezcan acciones que van a terminar en 403, y sobre todo que no se ESCONDAN
 * las que sí se pueden. Un botón que no está es una función que no existe para
 * quien la necesita.
 *
 * Los dos errores que estas pruebas fijan:
 * - clasificar el actor por qué campos vienen vacíos en vez de por su `tipo`,
 * - preguntar por el rol en lugar de por la capacidad.
 */
const sesionBase: Sesion = {
  usuario: { id: "u1", nombre: "Quien sea", email: "quien@sea.co", proveedores: [] },
  barberia: { id: "b1", slug: "la-barberia", nombreComercial: "La Barbería" },
  membresiaId: "m1",
  rol: { codigo: "administrador", nombre: "Administrador" },
  sedeId: "s1",
  permisos: ["agenda.gestionar", "ganancias.ver"],
  tipo: "staff",
  esStaffPlataforma: false,
  debeCambiarContrasena: false,
}

const con = (parcial: Partial<Sesion>): Sesion => ({ ...sesionBase, ...parcial })

describe("una capacidad concreta", () => {
  it("la tiene quien la trae en la lista", () => {
    expect(puede(sesionBase, "agenda.gestionar")).toBe(true)
  })

  it("no la tiene quien no, aunque sea administrador", () => {
    // El caso que obliga a preguntar por la capacidad y nunca por el rol: a
    // este administrador le revocaron la nómina persona a persona.
    expect(puede(sesionBase, "ganancias.ajustar")).toBe(false)
  })

  it("sin sesión no se puede nada, y no revienta", () => {
    // Ocurre en cada primer render, antes de que `/auth/me` conteste.
    expect(puede(null, "agenda.gestionar")).toBe(false)
  })

  it("no acepta un prefijo por bueno", () => {
    // `includes` sobre el ARRAY, no sobre una cadena concatenada: si algún día
    // se comparara texto, «ganancias.ver» abriría «ganancias.ver_propias».
    expect(puede(con({ permisos: ["ganancias.ver_propias"] }), "ganancias.ver")).toBe(false)
  })
})

describe("al menos una de varias", () => {
  it("basta con una para enseñar la sección", () => {
    expect(puedeAlguna(sesionBase, ["clientes.gestionar", "agenda.gestionar"])).toBe(true)
  })

  it("con ninguna, la sección no se pinta", () => {
    expect(puedeAlguna(sesionBase, ["clientes.gestionar", "planes.gestionar"])).toBe(false)
  })

  it("una lista vacía no habilita nada", () => {
    expect(puedeAlguna(sesionBase, [])).toBe(false)
  })
})

describe("qué app corresponde a la sesión", () => {
  it("el staff de una barbería va al panel", () => {
    expect(appDeSesion(sesionBase)).toBe("panel")
  })

  it("el staff de plataforma va a admin", () => {
    expect(
      appDeSesion(con({ tipo: "plataforma", barberia: null, rol: null, esStaffPlataforma: true }))
    ).toBe("admin")
  })

  it("el cliente final va al portal AUNQUE tenga barbería", () => {
    // Este es el que se clasificaba mal: tiene barbería y no tiene membresía,
    // así que deducirlo de la ausencia de barbería —como cuando solo existían
    // dos actores— lo mandaba al panel.
    expect(appDeSesion(con({ tipo: "cliente", membresiaId: null, rol: null, permisos: [] }))).toBe(
      "portal"
    )
  })

  it("sin sesión no hay app que pintar", () => {
    expect(appDeSesion(null)).toBeNull()
  })
})
