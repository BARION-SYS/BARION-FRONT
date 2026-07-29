"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import { useEquipo } from "@features/equipo/hooks/useEquipo"
import { useRoles } from "@features/roles/hooks/useRoles"
import { EquipoForm } from "@features/equipo/components/EquipoForm"
import { EquipoList } from "@features/equipo/components/EquipoList"
import { RolesDetail } from "@features/roles/components/RolesDetail"
import { RolesExcepcionesForm } from "@features/roles/components/RolesExcepcionesForm"
import { RolesList } from "@features/roles/components/RolesList"
import type { DatosInvitacion } from "@features/equipo/schemas/equipo.schema"
import type { Miembro } from "@features/equipo/types/equipo.types"
import type { ExcepcionPermiso, Rol } from "@features/roles/types/roles.types"

/**
 * Quién entra al sistema y con qué capacidades.
 *
 * Dos pestañas porque son dos preguntas distintas sobre lo mismo: a quién dejo
 * entrar, y qué trae cada rol. Separarlas en dos secciones del menú obligaría a
 * saltar entre ellas para una sola tarea.
 *
 * **Los roles no se crean ni se editan**: los define Barion y valen igual en
 * todas las barberías, así que esa pestaña es de consulta. Lo que esta barbería
 * decide —dar o quitar capacidades a una persona— vive en Personas, en el modal
 * de permisos de cada miembro.
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
    loadingAction: guardandoPermisos,
    fetchRoles,
    fetchExcepciones,
    handleReplaceExcepciones,
  } = useRoles()

  /**
   * Dos capacidades distintas, y la diferencia es real: `equipo.gestionar` mueve
   * a la gente —invitar, cambiar de rol, revocar—, `roles.gestionar` reparte lo
   * que cada persona puede hacer. Alguien puede tener una sin la otra.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestionaEquipo = puede(sesion, "equipo.gestionar")
  const gestionaPermisos = puede(sesion, "roles.gestionar")

  // Estado de UI: vive en el contenedor.
  const [invitando, setInvitando] = useState(false)
  const [rolEnDetalle, setRolEnDetalle] = useState<Rol | null>(null)
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
            subtitulo="Quién entra al sistema, con qué rol y con qué permisos"
            accion={
              gestionaEquipo ? (
                <Button type="button" size="sm" onClick={() => setInvitando(true)}>
                  <Plus className="size-4" aria-hidden />
                  Invitar
                </Button>
              ) : undefined
            }
          >
            <EquipoList
              miembros={miembros}
              roles={roles}
              loading={cargandoMiembros}
              gestionaEquipo={gestionaEquipo}
              gestionaPermisos={gestionaPermisos}
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
            subtitulo="Los define Barion y son iguales en todas las barberías. Para ajustar a una persona, ve a Personas"
          >
            <RolesList roles={roles} loading={cargandoRoles} onVer={setRolEnDetalle} />
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
        open={rolEnDetalle !== null}
        onOpenChange={(abierto) => !abierto && setRolEnDetalle(null)}
        titulo={rolEnDetalle?.nombre ?? ""}
        descripcion="Qué puede hacer quien tiene este rol."
        size="lg"
      >
        {rolEnDetalle && <RolesDetail rol={rolEnDetalle} permisos={permisos} />}
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
          cargando={guardandoPermisos}
          onSubmit={onGuardarExcepciones}
        />
      </Modal>
    </main>
  )
}
