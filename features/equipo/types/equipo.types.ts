// Tipos ESPEJO del contrato de la API (`/equipo`).

/**
 * Dos estados y ninguno intermedio: no existe la invitación. Si alguien de
 * dentro está creando la cuenta es porque esa persona va a entrar.
 */
export type EstadoMembresia = "activa" | "revocada"

export interface UsuarioResumen {
  id: string
  email: string | null
  telefonoE164: string | null
}

/**
 * Una persona con acceso al sistema — no es lo mismo que un barbero.
 *
 * Equipo es QUIÉN ENTRA; barberos es quién atiende, y puede no tener cuenta.
 * Confundirlos obligaría a dar acceso al sistema solo para poder agendarle a
 * alguien.
 */
export interface Miembro {
  id: string
  /** El de la membresía: cómo llama ESTA barbería a la persona. */
  nombre: string
  usuario: UsuarioResumen | null
  /**
   * Código del rol. La lista es cerrada —la define Barion— pero se maneja como
   * texto y sale de `GET /equipo/roles`: hardcodear los cuatro códigos aquí
   * duplicaría el catálogo y lo dejaría desincronizado el día que cambie.
   */
  rol: string
  sedeId: string | null
  estado: EstadoMembresia
  /** Instantes UTC ISO-8601: desde cuándo tiene acceso y cuándo se le quitó. */
  creadaEn: string
  revocadaEn: string | null
}

/**
 * Lo que devuelve el alta.
 *
 * `contrasenaInicial` llega UNA sola vez y solo cuando el sistema la puso: se
 * guarda hasheada y no hay endpoint que la consulte después. Si esa persona ya
 * tenía cuenta en Barion viene nula y `cuentaExistente` explica por qué — entra
 * con la suya, que nadie de esta barbería puede cambiar.
 */
export interface AltaMiembro {
  miembro: Miembro
  /** La ficha que se abrió si atiende; `null` si solo administra. */
  barberoId: string | null
  contrasenaInicial: string | null
  cuentaExistente: boolean
}

export interface FiltrosEquipo {
  estado?: EstadoMembresia
  rol?: string
  sedeId?: string
  page?: number
  limit?: number
}
