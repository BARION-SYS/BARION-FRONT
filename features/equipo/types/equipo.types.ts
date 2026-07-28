// Tipos ESPEJO del contrato de la API (`/equipo`).

export type EstadoMembresia = "invitada" | "activa" | "revocada"

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
  /** Código del rol. No es lista cerrada: la barbería puede crear los suyos. */
  rol: string
  sedeId: string | null
  estado: EstadoMembresia
  /** Instantes UTC ISO-8601. */
  invitadaEn: string
  aceptadaEn: string | null
}

export interface FiltrosEquipo {
  estado?: EstadoMembresia
  rol?: string
  page?: number
  limit?: number
}
