"use client"

import { useCallback, useEffect, useState } from "react"
import { UserPlus } from "lucide-react"
import {
  PlataformaStaffForm,
  ID_FORM_ALTA_STAFF,
} from "@features/plataforma/components/PlataformaStaffForm"
import { PlataformaStaffList } from "@features/plataforma/components/PlataformaStaffList"
import { usePlataforma } from "@features/plataforma/hooks/usePlataforma"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { EnlaceCopiable } from "@shared/components/enlaces/EnlaceCopiable"
import { Modal } from "@shared/components/modals/Modal"
import { SidePanel } from "@shared/components/modals/SidePanel"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { getErrorMessage } from "@shared/utils/error"
import { useAuthStore } from "@store/auth.store"
import type { DatosAltaStaff } from "@features/plataforma/schemas/plataforma.schema"
import type { StaffPlataforma } from "@features/plataforma/types/plataforma.types"

/**
 * Quién trabaja en Barion.
 *
 * **Existe porque no había ninguna forma de sumar a alguien al equipo.** La
 * bandera `es_staff_plataforma` solo la ponía el seed, así que dar acceso a una
 * persona nueva exigía tocar la base a mano — y en producción, sencillamente, no
 * se podía.
 *
 * Es la página padre: consume el hook, guarda el estado de interfaz y compone.
 */
export default function AdminStaffPage() {
  const {
    staff,
    staffCreado,
    loadingStaff,
    loadingAction,
    error,
    fetchStaff,
    handleCreateStaff,
    handleChangeEstadoStaff,
    handleRegenerarContrasenaStaff,
    limpiarStaffCreado,
  } = usePlataforma()

  const sesion = useAuthStore((estado) => estado.sesion)
  const [abriendoAlta, setAbriendoAlta] = useState(false)

  useEffect(() => {
    void fetchStaff()
  }, [fetchStaff])

  const alCrear = useCallback(
    async (datos: DatosAltaStaff) => {
      try {
        const mensaje = await handleCreateStaff(datos)
        setAbriendoAlta(false)
        notify.success(mensaje)
        void fetchStaff()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleCreateStaff, fetchStaff]
  )

  const alCambiarEstado = useCallback(
    async (persona: StaffPlataforma, estado: "activo" | "inactivo") => {
      try {
        notify.success(await handleChangeEstadoStaff(persona.id, estado))
        void fetchStaff()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleChangeEstadoStaff, fetchStaff]
  )

  const alRegenerar = useCallback(
    async (persona: StaffPlataforma) => {
      try {
        notify.success(await handleRegenerarContrasenaStaff(persona.id))
        void fetchStaff()
      } catch (err) {
        notify.error(getErrorMessage(err))
      }
    },
    [handleRegenerarContrasenaStaff, fetchStaff]
  )

  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <SectionCard
        titulo="Equipo de Barion"
        subtitulo="Quién puede entrar a la plataforma. No pertenecen a ninguna barbería"
        accion={
          <Button size="sm" onClick={() => setAbriendoAlta(true)}>
            <UserPlus className="size-4" aria-hidden />
            Dar de alta
          </Button>
        }
      >
        <PlataformaStaffList
          staff={staff}
          loading={loadingStaff}
          cargandoAccion={loadingAction}
          usuarioEnSesion={sesion?.usuario.id ?? null}
          onCambiarEstado={(persona, estado) => void alCambiarEstado(persona, estado)}
          onRegenerarContrasena={(persona) => void alRegenerar(persona)}
        />
      </SectionCard>

      <SidePanel
        open={abriendoAlta}
        onOpenChange={setAbriendoAlta}
        titulo="Dar de alta en el equipo"
        descripcion="Un correo, y la contraseña la genera el sistema"
        footer={
          <Button type="submit" form={ID_FORM_ALTA_STAFF} disabled={loadingAction}>
            Crear cuenta
          </Button>
        }
      >
        <PlataformaStaffForm onSubmit={alCrear} cargando={loadingAction} />
      </SidePanel>

      {/* La contraseña se enseña UNA vez y en un cuadro que hay que cerrar a
          mano: es el único momento en que existe fuera del hash, y dejarla
          desaparecer sola con un toast obligaría a regenerarla. Cerrarlo la
          borra del estado */}
      <Modal
        open={staffCreado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) limpiarStaffCreado()
        }}
        titulo="Contraseña temporal"
        descripcion="Dictásela ahora: no se guarda y no se puede volver a consultar"
      >
        {staffCreado && (
          <div className="flex flex-col gap-4">
            <EnlaceCopiable
              etiqueta="Correo"
              descripcion="Con este correo entra a la plataforma"
              valor={staffCreado.staff.email ?? ""}
            />
            <EnlaceCopiable
              etiqueta="Contraseña temporal"
              descripcion="La tendrá que cambiar en cuanto entre"
              valor={staffCreado.contrasenaTemporal}
            />
            <p className="rounded-lg border border-(--advertencia)/40 bg-[color-mix(in_srgb,var(--advertencia)_8%,transparent)] px-3 py-2.5 text-xs text-foreground">
              Si se pierde no hay forma de consultarla: habrá que generar otra desde el menú de esa
              cuenta.
            </p>
          </div>
        )}
      </Modal>
    </main>
  )
}
