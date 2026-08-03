import type { PasoReserva } from "@features/portal/types/portal.types"

interface CopiaPaso {
  titulo: string
  subtitulo: string
  /** Texto del botón que lleva al siguiente paso (vacío = lo dispara un formulario) */
  cta: string
}

// Copia de cada paso del flujo público — un solo lugar para ajustar el tono del portal.
export const copiaPorPaso: Record<PasoReserva, CopiaPaso> = {
  servicio: {
    titulo: "¿Qué te vas a hacer?",
    subtitulo: "Elige un servicio; el precio y la duración son los de la barbería.",
    cta: "Elegir barbero",
  },
  barbero: {
    titulo: "¿Con quién?",
    subtitulo: "Elige tu barbero de confianza o deja que te asignemos el primero libre.",
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

/** Pasos que ve el cliente ("datos" y "codigo" cuentan como uno solo). */
export const TOTAL_PASOS = 4

export const numeroDePaso: Record<PasoReserva, number> = {
  servicio: 1,
  barbero: 2,
  agenda: 3,
  datos: 4,
  codigo: 4,
  listo: 4,
}
