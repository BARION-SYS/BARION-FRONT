"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useEquipo } from "@features/equipo/hooks/useEquipo"
import { useRoles } from "@features/roles/hooks/useRoles"
import { EquipoForm } from "@features/equipo/components/EquipoForm"
import { EquipoList } from "@features/equipo/components/EquipoList"
import { RolesExcepcionesForm } from "@features/roles/components/RolesExcepcionesForm"
import { RolesForm } from "@features/roles/components/RolesForm"
import { RolesList } from "@features/roles/components/RolesList"
import type { DatosInvitacion } from "@features/equipo/schemas/equipo.schema"
import type { Miembro } from "@features/equipo/types/equipo.types"
import type { ExcepcionPermiso, Rol } from "@features/roles/types/roles.types"

/**
 * Quién entra al sistema y con qué capacidades.
 *
 * Dos pestañas porque son dos preguntas distintas sobre lo mismo: a quién dejo
 * entrar, y qué puede hacer cada tipo de persona. Separarlas en dos secciones
 * del menú obligaría a saltar entre ellas para una sola tarea.
 *
 * No confundir con Barberos: aquí está quien ENTRA, allí quien ATIENDE — y el
 * segundo puede no tener cuenta.
 */
export default function EquipoPage() {
  const {
    miembros,
    loadingLista: cargandoMiembros,
    loadingAction: guardandoMiembro,
    fetchMiembros,
    handleInviteMiembro,
    handleChangeRolMiembro,
    handleRevokeMiembro,
  } = useEquipo()

  const {
    roles,
    permisos,
    excepciones,
    loadingLista: cargandoRoles,
    loadingAction: guardandoRol,
    fetchRoles,
    fetchExcepciones,
    handleCreateRol,
    handleUpdateRol,
    handleDeleteRol,
    handleReplaceExcepciones,
  } = useRoles()

  // Estado de UI: vive en el contenedor.
  const [invitando, setInvitando] = useState(false)
  const [rolEnEdicion, setRolEnEdicion] = useState<Rol | null>(null)
  const [creandoRol, setCreandoRol] = useState(false)
  const [miembroConPermisos, setMiembroConPermisos] = useState<Miembro | null>(null)

  const cargar = useCallback(() => {
    void fetchMiembros()
    void fetchRoles()
  }, [fetchMiembros, fetchRoles])

  useEffect(() => {
    cargar()
  }, [cargar])

  const conAviso = async (accion: () => Promise<string>) => {
    try {
      notify.success(await accion())
      cargar()
      return true
    } catch (err) {
      notify.error(getErrorMessage(err))
      return false
    }
  }

  const onInvitar = useCallback(
    async (datos: DatosInvitacion) => {
      if (await conAviso(() => handleInviteMiembro(datos))) setInvitando(false)
    },
    [handleInviteMiembro] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const onGuardarRol = useCallback(
    async (datos: { codigo: string; nombre: string; permisos: string[] }) => {
      const guardado = rolEnEdicion
        ? await conAviso(() =>
            handleUpdateRol(rolEnEdicion.id, {
              nombre: datos.nombre,
              permisos: datos.permisos,
            })
          )
        : await conAviso(() => handleCreateRol(datos))

      if (guardado) {
        setRolEnEdicion(null)
        setCreandoRol(false)
      }
    },
    [rolEnEdicion, handleUpdateRol, handleCreateRol] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const onGuardarExcepciones = useCallback(
    async (nuevas: ExcepcionPermiso[]) => {
      if (!miembroConPermisos) return
      const guardado = await conAviso(() =>
        handleReplaceExcepciones(miembroConPermisos.id, { excepciones: nuevas })
      )
      if (guardado) setMiembroConPermisos(null)
    },
    [miembroConPermisos, handleReplaceExcepciones] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const abrirPermisos = useCallback(
    (miembro: Miembro) => {
      setMiembroConPermisos(miembro)
      void fetchExcepciones(miembro.id)
    },
    [fetchExcepciones]
  )

  return (
    <main className="scroll-fino flex-1 overflow-y-auto p-4 sm:p-6">
      <Tabs defaultValue="personas">
        <TabsList>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="mt-4">
          <SectionCard
            titulo="Personas con acceso"
            subtitulo="Quién entra al sistema y con qué rol"
            accion={
              <Button type="button" size="sm" onClick={() => setInvitando(true)}>
                <Plus className="size-4" aria-hidden />
                Invitar
              </Button>
            }
          >
            <EquipoList
              miembros={miembros}
              roles={roles}
              loading={cargandoMiembros}
              onCambiarRol={(m, codigoRol) =>
                void conAviso(() => handleChangeRolMiembro(m.id, { rol: codigoRol }))
              }
              onPermisos={abrirPermisos}
              onRevocar={(m) => void conAviso(() => handleRevokeMiembro(m.id))}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <SectionCard
            titulo="Roles"
            subtitulo="Paquetes de capacidades. Los de Barion se muestran pero no se editan"
            accion={
              <Button type="button" size="sm" onClick={() => setCreandoRol(true)}>
                <Plus className="size-4" aria-hidden />
                Nuevo rol
              </Button>
            }
          >
            <RolesList
              roles={roles}
              loading={cargandoRoles}
              onEditar={setRolEnEdicion}
              onEliminar={(rol) => void conAviso(() => handleDeleteRol(rol.id))}
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Modal
        open={invitando}
        onOpenChange={setInvitando}
        titulo="Invitar al equipo"
        descripcion="No se crea una cuenta: la persona entra por su cuenta cuando acepta."
      >
        <EquipoForm roles={roles} cargando={guardandoMiembro} onSubmit={onInvitar} />
      </Modal>

      <Modal
        open={creandoRol || rolEnEdicion !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCreandoRol(false)
            setRolEnEdicion(null)
          }
        }}
        titulo={rolEnEdicion ? rolEnEdicion.nombre : "Nuevo rol"}
        size="lg"
      >
        <RolesForm
          key={rolEnEdicion?.id ?? "nuevo"}
          rol={rolEnEdicion}
          permisos={permisos}
          cargando={guardandoRol}
          onSubmit={onGuardarRol}
        />
      </Modal>

      <Modal
        open={miembroConPermisos !== null}
        onOpenChange={(abierto) => !abierto && setMiembroConPermisos(null)}
        titulo={`Permisos de ${miembroConPermisos?.nombre ?? ""}`}
        descripcion="Ajustes sobre lo que le da su rol. Una revocación gana siempre."
        size="lg"
      >
        <RolesExcepcionesForm
          key={miembroConPermisos?.id ?? "ninguno"}
          rol={roles.find((r) => r.codigo === miembroConPermisos?.rol)}
          permisos={permisos}
          excepciones={excepciones}
          cargando={guardandoRol}
          onSubmit={onGuardarExcepciones}
        />
      </Modal>
    </main>
  )
}
