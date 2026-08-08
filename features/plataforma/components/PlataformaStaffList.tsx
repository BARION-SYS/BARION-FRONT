"use client"

import { KeyRound, MoreHorizontal, ShieldCheck, UserX, Users } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import { Loadable } from "@shared/components/feedback/Loadable"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { useFormato } from "@shared/hooks/useFormato"
import { inicialesDe } from "@shared/utils/iniciales"
import type { StaffPlataforma } from "@features/plataforma/types/plataforma.types"

interface PlataformaStaffListProps {
  staff: StaffPlataforma[]
  loading: boolean
  cargandoAccion: boolean
  /** Quién está operando: su propia fila no ofrece desactivarse. */
  usuarioEnSesion: string | null
  onCambiarEstado: (staff: StaffPlataforma, estado: "activo" | "inactivo") => void
  onRegenerarContrasena: (staff: StaffPlataforma) => void
}

/**
 * El equipo de Barion.
 *
 * **Cada fila se identifica por el correo**, y no es una carencia: el staff de
 * plataforma no tiene nombre en ningún sitio. El nombre de una persona vive en
 * su membresía —con el que la conoce SU barbería— y este actor no tiene ninguna.
 *
 * Lo que se enseña por cada cuenta es lo que decide qué hacer con ella: si sigue
 * activa, con qué entra y cuándo entró por última vez. De la contraseña solo se
 * dice si existe; ninguna ruta la devuelve.
 */
export function PlataformaStaffList({
  staff,
  loading,
  cargandoAccion,
  usuarioEnSesion,
  onCambiarEstado,
  onRegenerarContrasena,
}: PlataformaStaffListProps) {
  const { relativo, fechaCorta } = useFormato()

  return (
    <Loadable
      loading={loading}
      isEmpty={staff.length === 0}
      variant="list"
      count={4}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Users className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No hay nadie más en el equipo</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Da de alta a quien tenga que entrar a la plataforma.
          </p>
        </div>
      }
    >
      <ul className="flex flex-col gap-2">
        {staff.map((persona) => {
          const activa = persona.estado === "activo"
          const esYo = persona.id === usuarioEnSesion

          return (
            <li
              key={persona.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <InitialsAvatar iniciales={inicialesDe(persona.email ?? "?")} />

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {persona.email ?? "Sin correo"}
                  {esYo && (
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Tú
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {persona.ultimoAccesoEn
                    ? `Último acceso ${relativo(persona.ultimoAccesoEn)}`
                    : "No ha entrado nunca"}
                  {" · "}
                  {/* Sin proveedor vinculado se entra con contraseña. Se dice
                      para no mandar a nadie a restablecer una clave que no
                      tiene */}
                  {persona.proveedores.length > 0
                    ? `Entra con ${persona.proveedores.join(", ")}`
                    : "Entra con contraseña"}
                  {" · "}
                  {`Alta ${fechaCorta(persona.creadoEn)}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* La contraseña pendiente de cambio se avisa: es una cuenta a
                    la que todavía no ha entrado su dueño */}
                {persona.debeCambiarContrasena && activa && (
                  <span className="hidden text-xs text-(--advertencia) sm:inline">
                    Contraseña sin estrenar
                  </span>
                )}
                <StatusBadge
                  tono={activa ? "exito" : "neutro"}
                  etiqueta={activa ? "Activa" : "Inactiva"}
                  compacta
                />

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={cargandoAccion}
                        aria-label={`Acciones de ${persona.email ?? "esta cuenta"}`}
                      >
                        <MoreHorizontal aria-hidden />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Acceso</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onRegenerarContrasena(persona)}
                        className="flex-col items-start gap-0.5"
                      >
                        <span className="flex items-center gap-2">
                          <KeyRound className="size-3.5" aria-hidden />
                          Regenerar contraseña
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Se enseña una vez y hay que dictársela
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    {/* Nadie se desactiva a sí mismo: con una sola cuenta viva
                        eso dejaría la administración de Barion sin nadie dentro
                        y sin puerta desde fuera para volver a entrar */}
                    {!esYo && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Estado</DropdownMenuLabel>
                          <DropdownMenuItem
                            variant={activa ? "destructive" : "default"}
                            onClick={() => onCambiarEstado(persona, activa ? "inactivo" : "activo")}
                            className="flex-col items-start gap-0.5"
                          >
                            <span className="flex items-center gap-2">
                              {activa ? (
                                <UserX className="size-3.5" aria-hidden />
                              ) : (
                                <ShieldCheck className="size-3.5" aria-hidden />
                              )}
                              {activa ? "Desactivar" : "Reactivar"}
                            </span>
                            <span className="text-[11px] opacity-80">
                              {activa
                                ? "Deja de poder entrar. No se borra nada"
                                : "Vuelve a poder entrar con su contraseña"}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          )
        })}
      </ul>
    </Loadable>
  )
}
