import type { EstadoMembresia } from "@features/equipo/types/equipo.types"

/**
 * Una PERSONA de la barbería: una fila, una sola vez.
 *
 * No es una tabla de la API — es lo que resulta de cruzar las dos que sí lo son.
 * `membresias` responde «¿entra al sistema?» y `barberos` «¿atiende clientes?»,
 * y son dos porque hay gente que solo hace una de las dos cosas: el dueño que no
 * corta no tiene ficha, y a quien se le quitó el acceso le queda la suya, con su
 * historial y sus citas pasadas.
 *
 * Enseñar esas dos tablas como dos pestañas era enseñar el modelo de datos: la
 * misma persona salía dos veces y había que adivinar en cuál de las dos estaba
 * alguien. Aquí cada persona es una fila con dos atributos, y los cuatro casos
 * —entra y atiende, solo entra, solo atiende, y el que ya no hace ninguna de las
 * dos— se leen de un vistazo. Los dos últimos ya no se dan de alta: se llega a
 * ellos, porque quien atiende, entra.
 */
export interface Persona {
  /**
   * Estable entre recargas: la membresía manda cuando existe, porque una persona
   * puede recibir ficha más tarde y no debería cambiarle la clave de la fila.
   */
  id: string
  nombre: string
  /** Correo o teléfono, lo que se sepa. `null` cuando no hay ninguno. */
  contacto: string | null
  /** Su acceso al sistema, o `null` si nunca ha entrado. */
  acceso: PersonaAcceso | null
  /** Su ficha en la agenda, o `null` si no atiende ni atendió. */
  agenda: PersonaAgenda | null
}

export interface PersonaAcceso {
  membresiaId: string
  /** Código del rol; el nombre se pinta desde el catálogo de `/equipo/roles`. */
  rol: string
  estado: EstadoMembresia
  sedeId: string | null
}

export interface PersonaAgenda {
  barberoId: string
  /** `false` = retirado: fuera del escaparate, de los cupos y de los selectores. */
  activo: boolean
  /** Derivado de una ausencia vigente ahora. Un activo de vacaciones es normal. */
  enVacaciones: boolean
  /** De vitrina ("Barbero Senior"). NO es el rol de autorización. */
  titulo: string | null
  /** Índice del token de color, no un hex: la paleta se re-tiñe con la marca. */
  indiceColor: number
  sedeId: string | null
}
