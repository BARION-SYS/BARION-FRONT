"use client"

import { useEffect, useMemo, useState } from "react"
import { Apariencia } from "@features/configuracion/components/Apariencia"
import { FichaPublica } from "@features/configuracion/components/FichaPublica"
import { General } from "@features/configuracion/components/General"
import { ConfiguracionNav } from "@features/configuracion/components/ConfiguracionNav"
import { Notificaciones } from "@features/configuracion/components/Notificaciones"
import { Seguridad } from "@features/configuracion/components/Seguridad"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { PagosMedioPagoList } from "@features/pagos/components/PagosMedioPagoList"
import { PagosTarjetaForm } from "@features/pagos/components/PagosTarjetaForm"
import { usePagos } from "@features/pagos/hooks/usePagos"
import { SuscripcionFacturasList } from "@features/suscripcion/components/SuscripcionFacturasList"
import { SuscripcionPlanesList } from "@features/suscripcion/components/SuscripcionPlanesList"
import { SuscripcionResumen } from "@features/suscripcion/components/SuscripcionResumen"
import { useSuscripcion } from "@features/suscripcion/hooks/useSuscripcion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Modal } from "@shared/components/modals/Modal"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import type {
  DatosFicha,
  DatosGeneral,
  DatosSeguridad,
} from "@features/configuracion/schemas/configuracion.schema"
import type { DatosTarjeta } from "@features/pagos/schemas/pagos.schema"
import type { MedioPago } from "@features/pagos/types/pagos.types"
import type { DatosElegirPlan } from "@features/suscripcion/schemas/suscripcion.schema"
import type {
  CanalNotificacion,
  CanalesNotificacion,
  IdSeccionConfiguracion,
} from "@features/configuracion/types/configuracion.types"

// Contenedor: instancia el hook UNA vez; UI state y mutaciones viven aquí, los hijos reciben props.
export default function ConfiguracionPage() {
  const {
    secciones,
    barberia,
    canales,
    loadingConfiguracion,
    loadingAction,
    fetchConfiguracion,
    handleGuardarGeneral,
    handleGuardarFicha,
    handleActualizarContrasena,
  } = useConfiguracion()

  const {
    suscripcion,
    planes,
    facturas,
    loadingSuscripcion,
    loadingFacturas,
    loadingAction: loadingSuscripcionAction,
    fetchSuscripcion,
    fetchFacturas,
    handleElegirPlanSuscripcion,
    handleCancelarSuscripcion,
    handleReanudarSuscripcion,
  } = useSuscripcion()

  const {
    mediosPago,
    configuracion: configuracionPasarela,
    aceptaciones,
    errorConfiguracion,
    loadingMediosPago,
    loadingConfiguracion: loadingPasarela,
    loadingAction: loadingPagosAction,
    fetchMediosPago,
    fetchConfiguracionPagos,
    handleGuardarMedioPago,
    handleRetirarMedioPago,
  } = usePagos()

  /**
   * Ocultar el botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer un guardado que va a terminar en 403.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "barberias.gestionar")

  const [seccionActiva, setSeccionActiva] = useState<IdSeccionConfiguracion>("general")
  const [agregandoTarjeta, setAgregandoTarjeta] = useState(false)
  const [medioARetirar, setMedioARetirar] = useState<MedioPago | null>(null)
  /** Solo los canales que se tocaron aquí; el resto se lee de la api. */
  const [canalesTocados, setCanalesTocados] = useState<Partial<CanalesNotificacion>>({})

  useEffect(() => {
    void fetchConfiguracion()
  }, [fetchConfiguracion])

  // La cuenta se pide al abrir su sección, no al entrar a Configuración: son
  // tres llamadas que la mayoría de las visitas no necesita.
  useEffect(() => {
    if (seccionActiva !== "plan") return
    void fetchSuscripcion()
    void fetchFacturas()
    void fetchMediosPago()
    // La configuración de la pasarela se pide junto a los medios y no al abrir
    // el formulario: es la que decide si ese formulario existe siquiera.
    void fetchConfiguracionPagos()
  }, [seccionActiva, fetchSuscripcion, fetchFacturas, fetchMediosPago, fetchConfiguracionPagos])

  /**
   * Los interruptores SALEN de lo que reporta la api, con encima lo que se haya
   * tocado en pantalla. Copiarlos a estado en un efecto dejaba todo en `false`
   * hasta que llegaba la respuesta, y volvía a pisarlos en cada recarga.
   */
  const canalesActivos = useMemo<CanalesNotificacion>(() => {
    const base: CanalesNotificacion = { whatsapp: false, sms: false, correo: false, interno: false }
    for (const canal of canales) base[canal.canal] = canal.activo
    return { ...base, ...canalesTocados }
  }, [canales, canalesTocados])

  const alternarCanal = (canal: CanalNotificacion) =>
    setCanalesTocados((tocados) => ({ ...tocados, [canal]: !canalesActivos[canal] }))

  const onSubmitGeneral = async (datos: DatosGeneral) => {
    try {
      notify.success(await handleGuardarGeneral(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onSubmitFicha = async (datos: DatosFicha) => {
    try {
      notify.success(await handleGuardarFicha(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onElegirPlan = async (datos: DatosElegirPlan) => {
    try {
      // El mensaje viene de la api porque es el que distingue el cambio limpio
      // del que deja la cuenta por encima de sus topes.
      notify.success(await handleElegirPlanSuscripcion(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onCancelarSuscripcion = async () => {
    try {
      notify.info(await handleCancelarSuscripcion())
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onReanudarSuscripcion = async () => {
    try {
      notify.success(await handleReanudarSuscripcion())
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  /**
   * El token de la pasarela se pide dentro del guardado, así que un rechazo
   * deja el formulario abierto y con lo escrito: volver a enviarlo canjea la
   * tarjeta otra vez en vez de reintentar con un token ya gastado.
   */
  const onGuardarTarjeta = async (datos: DatosTarjeta) => {
    try {
      const mensaje = await handleGuardarMedioPago(datos)
      setAgregandoTarjeta(false)
      notify.success(mensaje)
      void fetchMediosPago()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onRetirarMedioPago = async () => {
    if (!medioARetirar) return
    try {
      // El mensaje de la api es el que avisa de que ya no queda ninguno con el
      // que cobrar: se muestra tal cual, no se reescribe aquí.
      const mensaje = await handleRetirarMedioPago(medioARetirar.id)
      setMedioARetirar(null)
      notify.info(mensaje)
      void fetchMediosPago()
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const onSubmitSeguridad = async (datos: DatosSeguridad) => {
    try {
      notify.success(await handleActualizarContrasena(datos))
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  if (loadingConfiguracion) {
    return (
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:items-start md:p-6">
        <DataSkeleton variant="list" count={6} className="shrink-0 md:w-56" />
        <DataSkeleton variant="form" count={4} className="w-full flex-1" />
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:items-start md:p-6">
      <ConfiguracionNav
        secciones={secciones}
        activa={seccionActiva}
        alSeleccionar={setSeccionActiva}
      />

      <div className="w-full min-w-0 flex-1 space-y-4">
        {seccionActiva === "general" && barberia && (
          <>
            <General
              barberia={barberia}
              soloLectura={!gestiona}
              cargando={loadingAction}
              onSubmit={onSubmitGeneral}
            />
            <FichaPublica
              barberia={barberia}
              soloLectura={!gestiona}
              cargando={loadingAction}
              onSubmit={onSubmitFicha}
            />
          </>
        )}
        {seccionActiva === "apariencia" && barberia && (
          <Apariencia nombreBarberia={barberia.nombreComercial} />
        )}
        {seccionActiva === "plan" &&
          (loadingSuscripcion || !suscripcion || !barberia ? (
            <DataSkeleton variant="card" count={2} />
          ) : (
            <>
              <SuscripcionResumen
                suscripcion={suscripcion}
                soloLectura={!gestiona}
                cargando={loadingSuscripcionAction}
                onCancelar={onCancelarSuscripcion}
                onReanudar={onReanudarSuscripcion}
              />
              <SuscripcionPlanesList
                planes={planes}
                suscripcion={suscripcion}
                pais={barberia.pais}
                soloLectura={!gestiona}
                cargando={loadingSuscripcionAction}
                onElegir={onElegirPlan}
              />
              <PagosMedioPagoList
                mediosPago={mediosPago}
                cargando={loadingMediosPago || loadingPasarela}
                cargandoAction={loadingPagosAction}
                soloLectura={!gestiona}
                configuracion={configuracionPasarela}
                errorConfiguracion={errorConfiguracion}
                // La fecha de corte sale del período vigente; en prueba todavía
                // no hay período y lo que manda es hasta cuándo llega la prueba.
                proximoCobroEn={suscripcion.periodoActualHasta ?? suscripcion.vigenteHasta}
                renovacionActiva={!suscripcion.cancelaAlFinPeriodo && !suscripcion.canceladaEn}
                onAgregar={() => setAgregandoTarjeta(true)}
                onRetirar={setMedioARetirar}
              />
              <SuscripcionFacturasList facturas={facturas} cargando={loadingFacturas} />
            </>
          ))}
        {seccionActiva === "notificaciones" && (
          <Notificaciones canales={canales} activos={canalesActivos} alAlternar={alternarCanal} />
        )}
        {seccionActiva === "seguridad" && <Seguridad onSubmit={onSubmitSeguridad} />}
      </div>

      {/* Sin aceptaciones no hay formulario: el proveedor no guarda una tarjeta sin ellas. */}
      <Modal
        open={agregandoTarjeta && aceptaciones !== null}
        onOpenChange={(abierto) => !abierto && setAgregandoTarjeta(false)}
        titulo="Agregar tarjeta"
        descripcion="Será la tarjeta con la que se cobre tu suscripción. La anterior deja de cobrar."
        className="max-h-[85dvh] overflow-y-auto"
      >
        {aceptaciones && (
          <PagosTarjetaForm
            aceptaciones={aceptaciones}
            cargando={loadingPagosAction}
            onSubmit={onGuardarTarjeta}
          />
        )}
      </Modal>

      <Modal
        open={medioARetirar !== null}
        onOpenChange={(abierto) => !abierto && setMedioARetirar(null)}
        titulo="Retirar el medio de pago"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setMedioARetirar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loadingPagosAction}
              onClick={() => void onRetirarMedioPago()}
            >
              Retirar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {medioARetirar?.predeterminado
            ? "Es la tarjeta con la que se cobra. Al retirarla te quedas sin forma de pagar la próxima renovación: ninguna otra ocupa su lugar, hay que guardar una nueva."
            : "Dejará de aparecer aquí. Los cobros que ya se hicieron con ella se conservan."}
        </p>
      </Modal>
    </main>
  )
}
