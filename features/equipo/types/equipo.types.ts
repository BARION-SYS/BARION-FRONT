// Tipos ESPEJO del contrato de la API (`/equipo`).

// La cita comprometida es del dominio de `barberos`, que es su dueño: aquí se
// importa en vez de duplicarla — quitar el acceso y retirar de la agenda
// devuelven exactamente la misma lista.
import type { CitaComprometida } from "@features/barberos/types/barberos.types"

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
 * Equipo es QUIÉN ENTRA; barberos es quién atiende. Toda alta crea las dos cosas
 * cuando la persona atiende —quien atiende, entra—, pero siguen siendo dos filas:
 * el administrador que no corta no tiene ficha, y a quien se le quita el acceso
 * la conserva con su historial.
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

/**
 * Lo que responde quitarle el acceso a alguien: «esta persona ya no trabaja
 * aquí», que es UNA sola acción.
 *
 * Revocar retira además de la agenda —quien no entra no gestiona lo suyo, y
 * seguir mandándole clientes prometería algo que no se sostiene—, así que la
 * respuesta cuenta las dos mitades. Sus citas futuras **no se cancelan**: son
 * clientes ya citados a los que hay que avisar uno por uno, y por eso se
 * enumeran.
 */
export interface RevocacionMiembro {
  miembro: Miembro
  /** `false` cuando esa persona no atendía: no había agenda de la que salir. */
  retiradaDeAgenda: boolean
  citasComprometidas: number
  /** Las 50 primeras por hora de inicio. Con el total mayor, hay más. */
  citasPendientes: CitaComprometida[]
}

export interface FiltrosEquipo {
  estado?: EstadoMembresia
  rol?: string
  sedeId?: string
  /**
   * `false` trae el conjunto completo. Es lo que necesita la lista de Personas:
   * se cruza con la de barberos, y unir dos listas paginadas parte filas — la
   * ficha en una página y su membresía en otra.
   */
  paginar?: boolean
  page?: number
  limit?: number
}
