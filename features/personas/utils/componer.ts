import type { Barbero } from "@features/barberos/types/barberos.types"
import type { Miembro } from "@features/equipo/types/equipo.types"
import type { Persona } from "@features/personas/types/personas.types"

/**
 * Las dos listas de la API, cruzadas en UNA de personas.
 *
 * Se emparejan por `membresiaId`: es lo único que las liga. El contacto no
 * serviría —la ficha de quien tiene cuenta deja `email` y `telefonoE164` vacíos
 * a propósito y los lee de `usuarios`— y el nombre menos, porque el de la
 * membresía y el público de la vitrina no tienen por qué coincidir.
 *
 * Los dos listados se piden **sin paginar**: cruzar dos páginas independientes
 * daría filas partidas —la ficha en la página 1 y su membresía en la 2— y una
 * barbería tiene decenas de personas, no miles.
 *
 * Quien tiene ficha SIN membresía es una fila propia, no un error: es quien
 * atendía y ya no entra, y es justo el caso que justifica que sean dos tablas —
 * su historial y sus liquidaciones no se borran nunca.
 */
export function componerPersonas(miembros: Miembro[], barberos: Barbero[]): Persona[] {
  const fichaPorMembresia = new Map(
    barberos
      .filter(
        (barbero): barbero is Barbero & { membresiaId: string } => barbero.membresiaId !== null
      )
      .map((barbero) => [barbero.membresiaId, barbero])
  )

  const personas: Persona[] = miembros.map((miembro) => {
    const ficha = fichaPorMembresia.get(miembro.id) ?? null
    return {
      id: miembro.id,
      nombre: miembro.nombre,
      contacto: miembro.usuario?.email ?? miembro.usuario?.telefonoE164 ?? null,
      acceso: {
        membresiaId: miembro.id,
        rol: miembro.rol,
        estado: miembro.estado,
        sedeId: miembro.sedeId,
      },
      agenda: ficha ? aAgenda(ficha) : null,
    }
  })

  // Una ficha cuya membresía no está en la lista se trata como si no la tuviera:
  // el listado del equipo puede venir filtrado por sede, y perder a esa persona
  // sería peor que enseñarla sin su rol.
  const membresiasVistas = new Set(miembros.map((miembro) => miembro.id))

  for (const barbero of barberos) {
    if (barbero.membresiaId !== null && membresiasVistas.has(barbero.membresiaId)) continue
    personas.push({
      id: barbero.id,
      nombre: barbero.nombrePublico,
      contacto: barbero.email ?? barbero.telefonoE164 ?? null,
      acceso: null,
      agenda: aAgenda(barbero),
    })
  }

  return personas.sort(comparar)
}

function aAgenda(barbero: Barbero): Persona["agenda"] {
  return {
    barberoId: barbero.id,
    activo: barbero.activo,
    enVacaciones: barbero.enVacaciones,
    titulo: barbero.titulo,
    indiceColor: barbero.indiceColor,
    sedeId: barbero.sedeId,
  }
}

/**
 * Quien sigue en la barbería primero; dentro de cada grupo, por nombre.
 *
 * Un retirado no se esconde —su historial y sus citas siguen siendo suyos— pero
 * tampoco compite por la atención con quien trabaja hoy.
 */
function comparar(uno: Persona, otro: Persona): number {
  const activos = Number(estaVigente(otro)) - Number(estaVigente(uno))
  return activos !== 0 ? activos : uno.nombre.localeCompare(otro.nombre, "es")
}

/** Vigente = entra, atiende, o las dos. Ninguna de las dos es alguien que se fue. */
function estaVigente(persona: Persona): boolean {
  return persona.acceso?.estado === "activa" || persona.agenda?.activo === true
}
