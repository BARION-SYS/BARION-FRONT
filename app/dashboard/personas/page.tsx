"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { SidePanel } from "@shared/components/modals/SidePanel"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import { useBarberos } from "@features/barberos/hooks/useBarberos"
import { useEquipo } from "@features/equipo/hooks/useEquipo"
import { useRoles } from "@features/roles/hooks/useRoles"
import { useSedeActual, useSedeStore } from "@store/sede.store"
import { EquipoCredencial } from "@features/equipo/components/EquipoCredencial"
import {
  ID_FORM_ALTA_PERSONA,
  PersonasAltaForm,
} from "@features/personas/components/PersonasAltaForm"
import { PersonasAtiendoCard } from "@features/personas/components/PersonasAtiendoCard"
import { PersonasList } from "@features/personas/components/PersonasList"
import { PersonasRetiroDetail } from "@features/personas/components/PersonasRetiroDetail"
import { RolesExcepcionesForm } from "@features/roles/components/RolesExcepcionesForm"
import { componerPersonas } from "@features/personas/utils/componer"
import type { DatosAltaPersona } from "@features/personas/schemas/personas.schema"
import type { DatosAtiendoYo } from "@features/barberos/schemas/barberos.schema"
import type { CitaComprometida } from "@features/barberos/types/barberos.types"
import type { Persona } from "@features/personas/types/personas.types"
import type { ExcepcionPermiso } from "@features/roles/types/roles.types"

/**
 * Quién trabaja en la barbería. **Una fila por persona**, no una por tabla.
 *
 * Esta pantalla era dos —«Acceso» y «Atienden»— y eran las dos tablas del modelo
 * expuestas como interfaz: quien entraba Y atendía salía en ambas, y darlo de
 * alta eran dos formularios en dos sitios sin que nada lo dijera. La lista se
 * compone cruzando los dos listados de la api por `membresiaId`, que es lo único
 * que liga las dos mitades de una misma persona.
 *
 * Se piden **sin paginar**: unir dos listas paginadas parte filas —la ficha en
 * una página y su membresía en otra— y una barbería tiene decenas de personas,
 * no miles.
 *
 * **Los roles no se crean ni se editan**: los define Barion y valen igual en
 * todas las barberías, así que su pestaña es de consulta. Lo que esta barbería
 * decide —dar o quitar capacidades a una persona— vive aquí, en el modal de
 * permisos de cada fila.
 */
export default function PersonasPage() {
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

  const {
    barberos,
    miPerfil,
    loadingLista: cargandoBarberos,
    loadingMiPerfil,
    loadingAction: guardandoBarbero,
    fetchBarberos,
    fetchMiPerfil,
    handleToggleBarbero,
    handleAtenderYo,
    handleDejarDeAtender,
  } = useBarberos()

  /**
   * Tres capacidades distintas, y la diferencia es real: `equipo.gestionar` mueve
   * el acceso —dar de alta, cambiar de rol, revocar—, `barberos.gestionar` mueve
   * la agenda, y `roles.gestionar` reparte lo que cada persona puede hacer.
   * Alguien puede tener una sin las otras.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const veEquipo = puede(sesion, "equipo.ver")
  const veBarberos = puede(sesion, "barberos.ver")
  const gestionaEquipo = puede(sesion, "equipo.gestionar")
  const gestionaBarberos = puede(sesion, "barberos.gestionar")
  const gestionaPermisos = puede(sesion, "roles.gestionar")

  const sedeActual = useSedeActual()
  const sedes = useSedeStore((estado) => estado.sedes)

  // Estado de UI: vive en el contenedor.
  const [agregandoPersona, setAgregandoPersona] = useState(false)
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
  const [personaConPermisos, setPersonaConPermisos] = useState<Persona | null>(null)
  /**
   * Lo que quedó colgando al sacar a alguien de la agenda, venga de retirarlo,
   * de dejar de atender uno mismo o de quitarle el acceso. Sus citas futuras NO
   * se cancelan —hay que avisar a cada cliente—, así que enseñarlas es la otra
   * mitad de la acción, no un aviso decorativo.
   */
  const [retiro, setRetiro] = useState<{
    nombre: string
    citasComprometidas: number
    citasPendientes: CitaComprometida[]
  } | null>(null)

  const cargar = useCallback(() => {
    if (veEquipo) void fetchMiembros({ sedeId: sedeActual?.id, paginar: false })
    if (veBarberos) void fetchBarberos({ sedeId: sedeActual?.id })
    void fetchRoles()
    // La ficha propia solo importa a quien puede ponerse en la agenda; para los
    // demás el interruptor no se pinta y la llamada sería un 403.
    if (gestionaBarberos) void fetchMiPerfil()
  }, [
    veEquipo,
    veBarberos,
    gestionaBarberos,
    fetchMiembros,
    fetchBarberos,
    fetchRoles,
    fetchMiPerfil,
    sedeActual?.id,
  ])

  useEffect(() => {
    cargar()
  }, [cargar])

  const personas = useMemo(
    () => componerPersonas(veEquipo ? miembros : [], veBarberos ? barberos : []),
    [veEquipo, veBarberos, miembros, barberos]
  )

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

  /**
   * Un solo camino: **quien atiende, entra**.
   *
   * Agregar a alguien resuelve cuenta, membresía y —si atiende— ficha de
   * barbero en una sola transacción, y devuelve la contraseña inicial una vez.
   * Agregar a alguien con agenda y sin cuenta se retiró: un barbero que no
   * entra no gestiona su agenda, la gestiona otro por él.
   *
   * Qué interruptores se pueden marcar lo decide el rol, y de eso se encarga el
   * formulario: aquí llega un estado que la api ya no puede rechazar.
   */
  const onAlta = useCallback(
    async (datos: DatosAltaPersona) => {
      try {
        const alta = await handleCreateMiembro({
          nombre: datos.nombre,
          email: datos.email,
          telefonoE164: datos.telefonoE164,
          rol: datos.rol,
          contrasenaInicial: datos.contrasenaInicial,
          atiende: datos.atiende,
          sedeId: datos.sedeId,
          comisionBps: datos.comisionBps,
        })
        setAgregandoPersona(false)
        // Primero se enseña la contraseña y después se refresca la lista: al
        // revés, el re-render podría cerrar el panel antes de que nadie la lea.
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

  /**
   * «Esta persona ya no trabaja aquí»: quitar el acceso la retira también de la
   * agenda, y es UNA sola operación. Si atendía, se abre el detalle de lo que
   * quedó comprometido — sus citas futuras siguen en pie y hay que llamar a cada
   * cliente. Si solo administraba no hay nada que enseñar.
   */
  const onRevocar = useCallback(
    async (persona: Persona) => {
      if (!persona.acceso) return
      try {
        const { mensaje, revocacion } = await handleRevokeMiembro(persona.acceso.membresiaId)
        notify.success(mensaje)
        if (revocacion.retiradaDeAgenda) {
          setRetiro({
            nombre: persona.nombre,
            citasComprometidas: revocacion.citasComprometidas,
            citasPendientes: revocacion.citasPendientes,
          })
        }
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleRevokeMiembro, cargar]
  )

  const onRegenerarContrasena = useCallback(
    async (persona: Persona) => {
      if (!persona.acceso) return
      try {
        const contrasena = await handleRegenerateContrasenaMiembro(persona.acceso.membresiaId)
        setCredencial({ nombre: persona.nombre, contrasena, cuentaExistente: false })
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleRegenerateContrasenaMiembro]
  )

  /**
   * Retirar de la agenda o devolver a ella. Al retirar se abre el detalle de lo
   * que quedó comprometido: las citas futuras siguen en pie y hay que llamar a
   * cada cliente.
   */
  const onAlternarAgenda = useCallback(
    async (persona: Persona) => {
      if (!persona.agenda) return
      try {
        const { mensaje, retiro: resultado } = await handleToggleBarbero({
          id: persona.agenda.barberoId,
          activo: persona.agenda.activo,
        })
        notify.success(mensaje)
        if (resultado) {
          setRetiro({
            nombre: resultado.nombrePublico,
            citasComprometidas: resultado.citasComprometidas,
            citasPendientes: resultado.citasPendientes,
          })
        }
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleToggleBarbero, cargar]
  )

  const onGuardarExcepciones = useCallback(
    async (nuevas: ExcepcionPermiso[]) => {
      if (!personaConPermisos?.acceso) return
      const guardado = await conAviso(() =>
        handleReplaceExcepciones(personaConPermisos.acceso!.membresiaId, { excepciones: nuevas })
      )
      if (guardado) setPersonaConPermisos(null)
    },
    [personaConPermisos, handleReplaceExcepciones] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const abrirPermisos = useCallback(
    (persona: Persona) => {
      if (!persona.acceso) return
      setPersonaConPermisos(persona)
      void fetchExcepciones(persona.acceso.membresiaId)
    },
    [fetchExcepciones]
  )

  const onAtenderYo = useCallback(
    async (datos: DatosAtiendoYo) => {
      try {
        notify.success(await handleAtenderYo(datos))
        cargar()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleAtenderYo, cargar]
  )

  const onDejarDeAtender = useCallback(async () => {
    try {
      const { mensaje, retiro: resultado } = await handleDejarDeAtender()
      notify.success(mensaje)
      setRetiro({
        nombre: resultado.nombrePublico,
        citasComprometidas: resultado.citasComprometidas,
        citasPendientes: resultado.citasPendientes,
      })
      cargar()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }, [handleDejarDeAtender, cargar])

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
        titulo="Personas"
        subtitulo="Quién trabaja aquí. Todos entran al sistema; su rol decide qué ven y quién además atiende"
        accion={
          gestionaEquipo || gestionaBarberos ? (
            <Button type="button" size="sm" onClick={() => setAgregandoPersona(true)}>
              <Plus className="size-4" aria-hidden />
              Agregar persona
            </Button>
          ) : undefined
        }
      >
        <PersonasList
          personas={personas}
          roles={roles}
          loading={cargandoMiembros || cargandoBarberos}
          gestionaEquipo={gestionaEquipo}
          gestionaPermisos={gestionaPermisos}
          gestionaAgenda={gestionaBarberos}
          onCambiarRol={(persona, codigoRol) => {
            if (!persona.acceso) return
            void conAviso(() =>
              handleChangeRolMiembro(persona.acceso!.membresiaId, { rol: codigoRol })
            )
          }}
          onPermisos={abrirPermisos}
          onRegenerarContrasena={(persona) => void onRegenerarContrasena(persona)}
          onRevocar={(persona) => void onRevocar(persona)}
          onAlternarAgenda={(persona) => void onAlternarAgenda(persona)}
        />
      </SectionCard>

      {/*
        Panel lateral y no modal: el formulario es largo y en un cuadro centrado
        se apretaba. El botón que envía vive en el pie fijo, atado al `<form>`
        por su id — así no se va fuera de alcance al scrollear.
      */}
      <SidePanel
        open={agregandoPersona}
        onOpenChange={setAgregandoPersona}
        titulo="Agregar persona"
        descripcion="Se crea su cuenta en Barion. El rol decide qué puede hacer y si además atiende."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setAgregandoPersona(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form={ID_FORM_ALTA_PERSONA}
              disabled={guardandoMiembro || guardandoBarbero}
            >
              {(guardandoMiembro || guardandoBarbero) && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              Crear persona y su acceso
            </Button>
          </>
        }
      >
        <PersonasAltaForm
          roles={roles}
          sedes={sedes}
          sedeActualId={sedeActual?.id}
          onSubmit={onAlta}
        />
      </SidePanel>

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
        open={retiro !== null}
        onOpenChange={(abierto) => !abierto && setRetiro(null)}
        titulo="Fuera de la agenda"
        descripcion="Ya no recibe reservas. Sus citas futuras siguen en pie: hay que avisar a cada cliente."
        size="lg"
      >
        {retiro && (
          <PersonasRetiroDetail
            nombre={retiro.nombre}
            citasComprometidas={retiro.citasComprometidas}
            citasPendientes={retiro.citasPendientes}
            onCerrar={() => setRetiro(null)}
          />
        )}
      </Modal>

      <Modal
        open={personaConPermisos !== null}
        onOpenChange={(abierto) => !abierto && setPersonaConPermisos(null)}
        titulo={`Permisos de ${personaConPermisos?.nombre ?? ""}`}
        descripcion="Ajustes sobre lo que le da su rol. Una revocación gana siempre."
        size="lg"
      >
        <RolesExcepcionesForm
          key={personaConPermisos?.acceso?.membresiaId ?? "ninguno"}
          rol={roles.find((r) => r.codigo === personaConPermisos?.acceso?.rol)}
          permisos={permisos}
          excepciones={excepciones}
          cargando={guardandoPermisos}
          onSubmit={onGuardarExcepciones}
        />
      </Modal>
    </>
  )
}
