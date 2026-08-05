import type { PasoReserva } from "@features/portal/types/portal.types"

export interface CopiaPaso {
  titulo: string
  subtitulo: string
  /** Texto del botón que lleva al siguiente paso (vacío = lo dispara un formulario) */
  cta: string
}

// Copia de cada paso del flujo público — un solo lugar para ajustar el tono del portal.
export const copiaPorPaso: Record<PasoReserva, CopiaPaso> = {
  barbero: {
    titulo: "¿Con quién te quieres cortar?",
    subtitulo: "Elige tu barbero y te mostramos solo lo que él hace, con su precio real.",
    cta: "Ver sus servicios",
  },
  servicio: {
    titulo: "¿Qué te vas a hacer?",
    subtitulo: "Esta es su carta: el precio y la duración son los suyos, no un aproximado.",
    cta: "Ver horarios",
  },
  agenda: {
    titulo: "¿Cuándo te viene bien?",
    subtitulo: "Solo mostramos cupos reales disponibles para lo que elegiste.",
    cta: "Continuar",
  },
  datos: {
    titulo: "Tus datos",
    subtitulo: "Sin registro: tu nombre, tu correo y un celular donde llamarte.",
    cta: "",
  },
  codigo: {
    titulo: "Confirma tu correo",
    subtitulo: "Así evitamos reservas falsas y te llegan los recordatorios.",
    cta: "",
  },
  listo: { titulo: "Listo", subtitulo: "", cta: "" },
}

/**
 * El paso 1 cuando se eligió «cualquiera disponible»: la carta ya no es la de una
 * persona, sino la unión de lo que hace el equipo. Prometer «su precio real»
 * sería mentira — ahí el precio vuelve a ser un «desde».
 */
export const copiaServicioCualquiera: CopiaPaso = {
  titulo: "¿Qué te vas a hacer?",
  subtitulo: "Todo lo que hace el equipo. Al elegir, dejamos solo a quien pueda atenderte.",
  cta: "Ver horarios",
}

/**
 * El mismo paso 4, pero para quien ya entró: no es un alta, es una confirmación.
 * La copia de `datos` promete «sin registro» y pide tres campos que aquí no se
 * piden, así que sería mentira dejarla.
 */
export const copiaDatosConSesion: CopiaPaso = {
  titulo: "Confirma tu reserva",
  subtitulo: "Ya te conocemos: solo falta lo que es de esta cita.",
  cta: "",
}

/** Pasos que ve el cliente ("datos" y "codigo" cuentan como uno solo). */
export const TOTAL_PASOS = 4

export const numeroDePaso: Record<PasoReserva, number> = {
  barbero: 1,
  servicio: 2,
  agenda: 3,
  datos: 4,
  codigo: 4,
  listo: 4,
}
