import { Building2, CalendarClock, Clock, Scissors, Tags, UsersRound } from "lucide-react"
import type { PasoInicial } from "@features/primeros-pasos/types/primeros-pasos.types"

/**
 * Lo que hay que hacer para que una barbería recién registrada sirva para algo,
 * en el orden en que conviene hacerlo: cada paso se apoya en el anterior —no hay
 * oferta sin catálogo ni jornada sin quien atienda—, y el último es el que más
 * duele omitir, porque sin jornada el motor de disponibilidad devuelve CERO
 * cupos y la agenda parece rota.
 *
 * El alta abierta (`/registro`) deja la barbería con UNA sede a medias: nombre,
 * zona horaria y `slugQr`, y nada más. Ni dirección, ni horario, ni personas, ni
 * catálogo. De ahí que el primer paso sea completar y no crear.
 *
 * `permisos` es la capacidad de ESCRIBIR: un barbero no crea sedes ni da de alta
 * compañeros, así que esos pasos no se le enseñan (ver `pasosDeSesion`).
 */
export const PASOS_INICIALES: PasoInicial[] = [
  {
    clave: "sede",
    titulo: "Completa los datos de tu sede",
    descripcion: "La dirección con la que tus clientes te encuentran.",
    accion: "Ir a Sedes",
    href: "/dashboard/sedes",
    icono: Building2,
    permisos: ["sedes.gestionar"],
  },
  {
    clave: "horario",
    titulo: "Publica el horario de apertura",
    descripcion: "A qué hora abre y cierra la sede cada día de la semana.",
    accion: "Definir horario",
    href: "/dashboard/sedes",
    icono: Clock,
    permisos: ["sedes.gestionar"],
  },
  {
    clave: "personas",
    titulo: "Da de alta a quien atiende",
    descripcion: "Sin barberos no hay agenda a la que llevar clientes.",
    accion: "Ir a Personas",
    href: "/dashboard/personas/barberos",
    icono: UsersRound,
    permisos: ["barberos.gestionar"],
  },
  {
    clave: "catalogo",
    titulo: "Crea el catálogo de servicios",
    descripcion: "Qué se hace en tu barbería: corte, barba, color…",
    accion: "Ir a Servicios",
    href: "/dashboard/servicios",
    icono: Scissors,
    permisos: ["catalogo.gestionar"],
  },
  {
    clave: "oferta",
    titulo: "Reparte la oferta de cada barbero",
    descripcion: "El precio y la duración que se reservan salen de aquí, no del catálogo.",
    accion: "Repartir oferta",
    href: "/dashboard/personas/barberos",
    icono: Tags,
    permisos: ["barberos.gestionar"],
  },
  {
    clave: "jornada",
    titulo: "Declara cuándo trabaja tu equipo",
    descripcion: "Sin jornada la agenda no ofrece ni un solo cupo libre.",
    accion: "Definir jornada",
    href: "/dashboard/personas/barberos",
    icono: CalendarClock,
    permisos: ["barberos.gestionar"],
  },
]
