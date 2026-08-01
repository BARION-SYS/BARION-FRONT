"use client"

import { useEffect, useState } from "react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { Modal } from "@shared/components/modals/Modal"
import { useRoles } from "@features/roles/hooks/useRoles"
import { RolesDetail } from "@features/roles/components/RolesDetail"
import { RolesList } from "@features/roles/components/RolesList"
import type { Rol } from "@features/roles/types/roles.types"

/**
 * Qué trae cada rol, y nada más.
 *
 * Los roles los define Barion y son los mismos en todas las barberías: no hay
 * formulario porque no hay endpoint que los cree. Lo que esta barbería sí decide
 * —dar o quitar capacidades a UNA persona— se ajusta en Acceso, en el modal de
 * permisos de cada miembro.
 */
export default function PersonasRolesPage() {
  const { roles, permisos, loadingLista, fetchRoles } = useRoles()

  const [rolEnDetalle, setRolEnDetalle] = useState<Rol | null>(null)

  useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  return (
    <>
      <SectionCard
        titulo="Roles"
        subtitulo="Los define Barion y son iguales en todas las barberías. Para ajustar a una persona, ve a Acceso"
      >
        <RolesList roles={roles} loading={loadingLista} onVer={setRolEnDetalle} />
      </SectionCard>

      <Modal
        open={rolEnDetalle !== null}
        onOpenChange={(abierto) => !abierto && setRolEnDetalle(null)}
        titulo={rolEnDetalle?.nombre ?? ""}
        descripcion="Qué puede hacer quien tiene este rol."
        size="lg"
      >
        {rolEnDetalle && <RolesDetail rol={rolEnDetalle} permisos={permisos} />}
      </Modal>
    </>
  )
}
