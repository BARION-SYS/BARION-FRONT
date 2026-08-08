import { describe, expect, it } from "vitest"
import {
  fechaClave,
  formatDuration,
  formatTime,
  inicioDiaLocal,
  minutosLocales,
} from "@shared/utils/datetime"

/**
 * El tiempo, que es la otra fuente de fallos que ninguna comprobación de tipos
 * puede ver: la api entrega instantes en UTC y **la zona horaria es de la SEDE**,
 * no del navegador de quien mira. Confundir las dos cosas mueve una cita de día
 * sin que nada falle.
 *
 * Todas las pruebas usan una hora que cruza el límite del día en Bogotá
 * (UTC-5) a propósito: es donde la diferencia entre «lo que dice el instante» y
 * «lo que ve la sede» se hace visible.
 */
const MEDIANOCHE_UTC = "2026-08-09T03:30:00.000Z" // 22:30 del día 8 en Bogotá
const MEDIODIA_UTC = "2026-08-08T15:00:00.000Z" // 10:00 en Bogotá

describe("la hora se lee en la zona de la sede", () => {
  it("no usa la del navegador", () => {
    expect(formatTime(MEDIODIA_UTC, "America/Bogota", "es-CO")).toBe("10:00")
    expect(formatTime(MEDIODIA_UTC, "Europe/Madrid", "es-ES")).toBe("17:00")
  })

  it("el panel manda en reloj de 24 h", () => {
    // Una agenda es una columna densa de horas: `14:30` ocupa menos y no se
    // confunde. Es el valor por defecto a propósito.
    expect(formatTime("2026-08-08T19:30:00.000Z", "America/Bogota", "es-CO")).toBe("14:30")
  })

  it("el portal pide el de 12 h, que es el que usa quien lee", () => {
    // Al cliente hay que hablarle en su reloj: un «10:00» suelto en un correo no
    // se lee como las diez de la mañana, se lee como una duda.
    const leido = formatTime(MEDIODIA_UTC, "America/Bogota", "es-CO", true)
    expect(leido).toMatch(/10:00/)
    expect(leido.toLowerCase()).toMatch(/a\.?\s?m\.?/)
  })
})

describe("qué DÍA es para la sede", () => {
  it("un instante de la madrugada UTC sigue siendo el día anterior en Bogotá", () => {
    // Es el caso que rompe una agenda: la cita de las 22:30 del sábado no puede
    // aparecer en la columna del domingo.
    expect(fechaClave(MEDIANOCHE_UTC, "America/Bogota")).toBe("2026-08-08")
    expect(fechaClave(MEDIANOCHE_UTC, "Europe/Madrid")).toBe("2026-08-09")
  })

  it("el inicio del día local es un instante UTC, no una fecha suelta", () => {
    // Bogotá va a UTC-5, así que su medianoche son las 05:00 UTC.
    expect(inicioDiaLocal("2026-08-08", "America/Bogota")).toBe("2026-08-08T05:00:00.000Z")
  })

  it("ese instante vuelve a caer en el mismo día para la sede", () => {
    const inicio = inicioDiaLocal("2026-08-08", "America/Bogota")
    expect(fechaClave(inicio, "America/Bogota")).toBe("2026-08-08")
  })
})

describe("minutos desde la medianoche de la sede", () => {
  it("los cuenta en local y no en UTC", () => {
    expect(minutosLocales(MEDIODIA_UTC, "America/Bogota")).toBe(10 * 60)
    expect(minutosLocales(MEDIODIA_UTC, "Europe/Madrid")).toBe(17 * 60)
  })

  it("la medianoche local es cero", () => {
    expect(minutosLocales(inicioDiaLocal("2026-08-08", "America/Bogota"), "America/Bogota")).toBe(0)
  })
})

describe("la duración de un servicio", () => {
  it("por debajo de una hora se lee en minutos", () => {
    expect(formatDuration(45)).toBe("45 min")
  })

  it("una hora en punto no arrastra los minutos", () => {
    expect(formatDuration(60)).toBe("1 h")
  })

  it("con resto se leen las dos partes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min")
  })
})
