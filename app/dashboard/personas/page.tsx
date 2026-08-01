"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { useEquipo } from "@features/equipo/hooks/useEquipo"
import { useRoles } from "@features/roles/hooks/useRoles"
import { useSedeActual } from "@store/sede.store"
import { EquipoCredencial } from "@features/equipo/components/EquipoCredencial"
import { EquipoList } from "@features/equipo/components/EquipoList"
import { PersonasAltaForm } from "@features/personas/components/PersonasAltaForm"
import { PersonasAtiendoCard } from "@features/personas/components/PersonasAtiendoCard"
import { RolesExcepcionesForm } from "@features/roles/components/RolesExcepcionesForm"
import type { DatosAtiendoYo, DatosBarbero } from "@features/barberos/schemas/barberos.schema"
import type { DatosAltaMiembro } from "@features/equipo/schemas/equipo.schema"
import type { Miembro } from "@features/equipo/types/equipo.types"
import type { ExcepcionPermiso } from "@features/roles/types/roles.types"

/**
 * Quién entra al sistema y con qué capacidades.
 *
 * Primera vista de Personas, y la que da de alta: el alta pregunta si entra a la
 * aplicación y si atiende clientes, y con eso queda resuelto todo —cuenta,
 * membresía y ficha— sin pasar por dos pantallas.
 *
 * **Los roles no se crean ni se editan**: los define Barion y valen igual en
 * todas las barberías, así que su pestaña es de consulta. Lo que esta barbería
 * decide —dar o quitar capacidades a una persona— vive aquí, en el modal de
 * permisos de cada miembro.
 */
export default function PersonasPage() {
  const router = useRouter()

  const {
    miembros,
    loadingLista: cargandoMiembros,
    loadingAction: guardandoMiembro,
    fetchMiembros,
    handleCreateMiembro,
    handleRegenerateContrasenaMiembro,
    handleChangeRolMiembro,
    handleRevokeMiembro,
  } = useEquipo()

  const {
    roles,
    permisos,
    excepciones,
    loadingAction: guardandoPermisos,
    fetchRoles,
    fetchExcepciones,
    handleReplaceExcepciones,
  } = useRoles()

  // Para el alta de quien NO entra a la aplicación —su ficha se crea contra la
  // superficie de barberos, que es la otra mitad de esta misma pregunta— y para
  // el interruptor «yo también atiendo» de quien está en sesión.
  const {
    miPerfil,
    loadingMiPerfil,
    loadingAction: guardandoBarbero,
    fetchMiPerfil,
    handleCreateBarbero,
    handleAtenderYo,
    handleDejarDeAtender,
  } = useBarberos()

  /**
   * Dos capacidades distintas, y la diferencia es real: `equipo.gestionar` mueve
   * a la gente —dar de alta, cambiar de rol, revocar—, `roles.gestionar` reparte
   * lo que cada persona puede hacer. Alguien puede tener una sin la otra.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const veEquipo = puede(sesion, "equipo.ver")
  const gestionaEquipo = puede(sesion, "equipo.gestionar")
  const gestionaPermisos = puede(sesion, "roles.gestionar")
  const gestionaBarberos = puede(sesion, "barberos.gestionar")
  const sedeActual = useSedeActual()

  // Estado de UI: vive en el contenedor.
  const [dandoDeAlta, setDandoDeAlta] = useState(false)
  /**
   * La credencial recién entregada. Vive aquí porque la api la devuelve UNA vez
   * y no hay forma de volver a pedirla: si se pierde entre renders, la única
   * salida es regenerarla.
   */
  const [credencial, setCredencial] = useState<{
    nombre: string
    contrasena: string | null
    cuentaExistente: boolean
  } | null>(null)
  const [miembroConPermisos, setMiembroConPermisos] = useState<Miembro | null>(null)

  const cargar = useCallback(() => {
    if (!veEquipo) return
    void fetchMiembros({ sedeId: sedeActual?.id })
    void fetchRoles()
    // La ficha propia solo importa a quien puede ponerse en la agenda; para los
    // demás el interruptor no se pinta y la llamada sería un 403.
    if (gestionaBarberos) void fetchMiPerfil()
  }, [veEquipo, gestionaBarberos, fetchMiembros, fetchRoles, fetchMiPerfil, sedeActual?.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  /**
   * El barbero llega a Personas por el menú y no ve el acceso de nadie: esta
   * pantalla le daría un 403 en cada llamada. Se le manda a la vista que sí es
   * suya en vez de dejarlo en una sección vacía.
   */
  useEffect(() => {
    if (sesion && !veEquipo && puede(sesion, "barberos.ver")) {
      router.replace("/dashboard/personas/barberos")
    }
  }, [sesion, veEquipo, router])

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

  const onAltaConAcceso = useCallback(
    async (datos: DatosAltaMiembro) => {
      try {
        const alta = await handleCreateMiembro(datos)
        setDandoDeAlta(false)
        // Primero se enseña la contraseña y después se refresca la lista: al
        // revés, el re-render podría cerrar el modal antes de que nadie la lea.
        setCredencial({
          nombre: alta.miembro.nombre,
          contrasena: alta.contrasenaInicial,
          cuentaExistente: alta.cuentaExistente,
        })
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleCreateMiembro, cargar]
  )

  const onAltaSinAcceso = useCallback(
    async (datos: DatosBarbero) => {
      try {
        notify.success(await handleCreateBarbero(datos))
        setDandoDeAlta(false)
        // Esa persona no aparece en esta lista —no tiene acceso—, así que se
        // lleva a quien la creó adonde sí está: si no, parece que no se guardó.
        router.push("/dashboard/personas/barberos")
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleCreateBarbero, router]
  )

  const onRegenerarContrasena = useCallback(
    async (miembro: Miembro) => {
      try {
        const contrasena = await handleRegenerateContrasenaMiembro(miembro.id)
        setCredencial({ nombre: miembro.nombre, contrasena, cuentaExistente: false })
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleRegenerateContrasenaMiembro]
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

  const onAtenderYo = useCallback(
    async (datos: DatosAtiendoYo) => {
      try {
        notify.success(await handleAtenderYo(datos))
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleAtenderYo]
  )

  const onDejarDeAtender = useCallback(async () => {
    try {
      notify.success(await handleDejarDeAtender())
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [handleDejarDeAtender])

  return (
    <>
      {gestionaBarberos && (
        <PersonasAtiendoCard
          miPerfil={miPerfil}
          loading={loadingMiPerfil}
          nombreSugerido={sesion?.usuario.nombre ?? ""}
          sedeId={sedeActual?.id}
          cargando={guardandoBarbero}
          onActivar={onAtenderYo}
          onDesactivar={onDejarDeAtender}
        />
      )}

      <SectionCard
        titulo="Personas con acceso"
        subtitulo="Quién entra al sistema, con qué rol y con qué permisos"
        accion={
          gestionaEquipo ? (
            <Button type="button" size="sm" onClick={() => setDandoDeAlta(true)}>
              <Plus className="size-4" aria-hidden />
              Dar de alta
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
          onRegenerarContrasena={(m) => void onRegenerarContrasena(m)}
          onRevocar={(m) => void conAviso(() => handleRevokeMiembro(m.id))}
        />
      </SectionCard>

      <Modal
        open={dandoDeAlta}
        onOpenChange={setDandoDeAlta}
        titulo="Dar de alta a una persona"
        descripcion="Dos preguntas: si entra a la aplicación y si atiende clientes."
        size="lg"
      >
        <PersonasAltaForm
          roles={roles}
          cargando={guardandoMiembro || guardandoBarbero}
          onAltaConAcceso={onAltaConAcceso}
          onAltaSinAcceso={onAltaSinAcceso}
        />
      </Modal>

      <Modal
        open={credencial !== null}
        onOpenChange={(abierto) => !abierto && setCredencial(null)}
        titulo="Listo, ya puede entrar"
        descripcion="Dicta estos datos a la persona: entrará con su correo y esta contraseña."
      >
        {credencial && (
          <EquipoCredencial
            nombre={credencial.nombre}
            contrasena={credencial.contrasena}
            cuentaExistente={credencial.cuentaExistente}
            onCerrar={() => setCredencial(null)}
          />
        )}
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
    </>
  )
}
