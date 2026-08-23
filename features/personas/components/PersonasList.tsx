"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { tokenDeColor } from "@shared/utils/color"
import { inicialesDe } from "@shared/utils/iniciales"
import type { Persona } from "@features/personas/types/personas.types"
import type { Rol } from "@features/roles/types/roles.types"
import type { TonoEstado } from "@shared/types/ui.types"
import { useTextos } from "@shared/textos/useTextos"

interface PersonasListProps {
  personas: Persona[]
  roles: Rol[]
  loading: boolean
  /** `equipo.gestionar`: agregar personas, cambiar de rol, revocar el acceso. */
  gestionaEquipo: boolean
  /** `roles.gestionar`: repartir capacidades a una persona concreta. */
  gestionaPermisos: boolean
  /** `barberos.gestionar`: retirar de la agenda y reincorporar. */
  gestionaAgenda: boolean
  onCambiarRol: (persona: Persona, codigoRol: string) => void
  onPermisos: (persona: Persona) => void
  onRegenerarContrasena: (persona: Persona) => void
  onRevocar: (persona: Persona) => void
  onAlternarAgenda: (persona: Persona) => void
}

/**
 * UNA fila por persona, con los dos hechos que definen su sitio en la barbería:
 * si entra al sistema y si atiende clientes.
 *
 * Los cuatro casos que tiene que dejar leer sin pensar: la dueña que no corta
 * (entra, no atiende), el barbero (las dos), el mostrador (entra, no atiende) y
 * quien ya no trabaja aquí — que conserva su ficha con su historial y no entra.
 * Ninguno es excepcional y ninguno se descubre cambiando de pestaña.
 *
 * Ni el acceso ni la agenda se distinguen solo por color: cada uno lleva su
 * etiqueta, y quien no tiene ese hecho lleva un guion — un hueco se lee como un
 * dato que no cargó.
 */
export function PersonasList({
  personas,
  roles,
  loading,
  gestionaEquipo,
  gestionaPermisos,
  gestionaAgenda,
  onCambiarRol,
  onPermisos,
  onRegenerarContrasena,
  onRevocar,
  onAlternarAgenda,
}: PersonasListProps) {
  const t = useTextos("personas.lista")
  const tEstados = useTextos("personas.estados")
  // El rol viaja como código; el nombre se pinta desde el catálogo de roles.
  const nombreDeRol = (codigo: string) => roles.find((r) => r.codigo === codigo)?.nombre ?? codigo

  return (
    <Loadable
      loading={loading}
      isEmpty={personas.length === 0}
      variant="list"
      emptyState={
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no hay nadie. Agrega a la primera persona de tu barbería.
        </p>
      }
    >
      <ul className="flex flex-col gap-2">
        {personas.map((persona) => {
          const acceso = estadoDeAcceso(persona, nombreDeRol, tEstados)
          const agenda = estadoDeAgenda(persona, tEstados)
          const puedeAlgo =
            (gestionaEquipo && persona.acceso !== null) ||
            (gestionaPermisos && persona.acceso !== null) ||
            (gestionaAgenda && persona.agenda !== null)

          return (
            <li
              key={persona.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <InitialsAvatar
                iniciales={inicialesDe(persona.nombre)}
                color={persona.agenda ? tokenDeColor(persona.agenda.indiceColor) : undefined}
              />

              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate text-sm font-medium">
                  {persona.agenda ? (
                    <Link
                      href={`/dashboard/personas/barberos/${persona.agenda.barberoId}`}
                      className="rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {persona.nombre}
                    </Link>
                  ) : (
                    persona.nombre
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{persona.contacto ?? "—"}</p>
              </div>

              <dl className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Entra
                  </dt>
                  <dd>
                    {acceso ? (
                      <StatusBadge tono={acceso.tono} etiqueta={acceso.etiqueta} compacta />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Atiende
                  </dt>
                  <dd>
                    {agenda ? (
                      <StatusBadge tono={agenda.tono} etiqueta={agenda.etiqueta} compacta />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              {puedeAlgo && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:size-8">
                    <MoreHorizontal className="size-4" aria-hidden />
                    <span className="sr-only">Acciones de {persona.nombre}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {persona.agenda && (
                      <DropdownMenuItem
                        render={
                          <Link href={`/dashboard/personas/barberos/${persona.agenda.barberoId}`} />
                        }
                      >
                        Agenda y ficha
                      </DropdownMenuItem>
                    )}

                    {gestionaEquipo && persona.acceso && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>{t("cambiarRol")}</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {roles
                            .filter((rol) => rol.codigo !== persona.acceso?.rol)
                            .map((rol) => (
                              <DropdownMenuItem
                                key={rol.id}
                                onClick={() => onCambiarRol(persona, rol.codigo)}
                              >
                                {rol.nombre}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}

                    {gestionaPermisos && persona.acceso && (
                      <DropdownMenuItem onClick={() => onPermisos(persona)}>
                        Permisos a medida
                      </DropdownMenuItem>
                    )}

                    {/*
                      Retirar de la agenda a quien sigue entrando es válido: es el
                      propietario que deja de cortar. Devolverla, en cambio, solo
                      se ofrece a quien tiene acceso vigente — reincorporar a
                      alguien sin cuenta sería crear otra vez «atiende y no
                      entra», y la vuelta de esa persona es agregarla de nuevo.
                    */}
                    {gestionaAgenda && persona.agenda && puedeMoverAgenda(persona) && (
                      <DropdownMenuItem onClick={() => onAlternarAgenda(persona)}>
                        {persona.agenda.activo ? t("retirarDeLaAgenda") : t("devolverALaAgenda")}
                      </DropdownMenuItem>
                    )}

                    {gestionaEquipo && persona.acceso?.estado === "activa" && (
                      <>
                        <DropdownMenuSeparator />
                        {/* La contraseña no se consulta: si se perdió, se da otra. */}
                        <DropdownMenuItem onClick={() => onRegenerarContrasena(persona)}>
                          Regenerar contraseña
                        </DropdownMenuItem>
                        {/*
                          Una sola acción, y el nombre lo dice: quitar el acceso
                          retira además de la agenda. Quien no entra no gestiona
                          lo suyo, y seguir mandándole clientes prometería algo
                          que no se sostiene.
                        */}
                        <DropdownMenuItem onClick={() => onRevocar(persona)}>
                          {persona.agenda?.activo ? t("yaNoTrabajaAqui") : t("quitarAcceso")}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}

/**
 * Si la agenda de esta persona se puede mover desde el menú.
 *
 * Retirar siempre se puede —el propietario que deja de cortar sigue entrando—.
 * Devolver a la agenda, solo con acceso vigente: reincorporar a quien ya no
 * entra sería crear otra vez «atiende y no entra», que es justo lo que se
 * retiró. A esa persona se la recupera agregándola de nuevo, que le devuelve
 * el acceso y la ficha en la misma operación.
 */
function puedeMoverAgenda(persona: Persona): boolean {
  if (!persona.agenda) return false
  return persona.agenda.activo || persona.acceso?.estado === "activa"
}

/**
 * Qué papel tiene en el sistema. Revocada NO se pinta como un error: es la
 * persona que ya no trabaja aquí, y su historial se queda.
 */
function estadoDeAcceso(
  persona: Persona,
  nombreDeRol: (codigo: string) => string,
  textoEstado: (clave: ClaveEstado) => string
): { etiqueta: string; tono: TonoEstado } | null {
  if (!persona.acceso) return null
  // El nombre del rol viene de la api y NO se traduce; lo de al lado sí. Por eso
  // el traductor entra por parámetro igual que `nombreDeRol`: la función resuelve
  // texto y no puede llamar a un hook desde fuera del componente.
  return persona.acceso.estado === "activa"
    ? { etiqueta: nombreDeRol(persona.acceso.rol), tono: "info" }
    : { etiqueta: textoEstado("yaNoTrabaja"), tono: "neutro" }
}

/** Y si atiende. El de vacaciones sigue siendo alguien que atiende. */
function estadoDeAgenda(
  persona: Persona,
  textoEstado: (clave: ClaveEstado) => string
): { etiqueta: string; tono: TonoEstado } | null {
  if (!persona.agenda) return null
  if (!persona.agenda.activo) return { etiqueta: textoEstado("retirado"), tono: "neutro" }
  return persona.agenda.enVacaciones
    ? { etiqueta: textoEstado("ausenteHoy"), tono: "advertencia" }
    : { etiqueta: textoEstado("atiende"), tono: "exito" }
}

type ClaveEstado = "yaNoTrabaja" | "retirado" | "ausenteHoy" | "atiende"
