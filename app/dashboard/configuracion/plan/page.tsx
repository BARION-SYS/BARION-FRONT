"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useConfiguracion } from "@features/configuracion/hooks/useConfiguracion"
import { rutaDeSeccion } from "@features/configuracion/utils/secciones"
import { PagosEnlacesList } from "@features/pagos/components/PagosEnlacesList"
import { PagosMedioPagoList } from "@features/pagos/components/PagosMedioPagoList"
import { PagosRetornoPago } from "@features/pagos/components/PagosRetornoPago"
import { PagosTarjetaForm } from "@features/pagos/components/PagosTarjetaForm"
import { usePagos } from "@features/pagos/hooks/usePagos"
import { SuscripcionDatosFiscalesCard } from "@features/suscripcion/components/SuscripcionDatosFiscalesCard"
import {
  ID_FORM_DATOS_FISCALES,
  SuscripcionDatosFiscalesForm,
} from "@features/suscripcion/components/SuscripcionDatosFiscalesForm"
import { SuscripcionFacturaDetail } from "@features/suscripcion/components/SuscripcionFacturaDetail"
import { SuscripcionFacturasList } from "@features/suscripcion/components/SuscripcionFacturasList"
import { SuscripcionPlanesList } from "@features/suscripcion/components/SuscripcionPlanesList"
import { SuscripcionResumen } from "@features/suscripcion/components/SuscripcionResumen"
import { useSuscripcion } from "@features/suscripcion/hooks/useSuscripcion"
import { reglasFiscalesDe } from "@features/suscripcion/utils/fiscal"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Modal } from "@shared/components/modals/Modal"
import { SidePanel } from "@shared/components/modals/SidePanel"
import { Button } from "@shared/components/ui/button"
import { notify } from "@shared/services/notify"
import { useAuthStore } from "@store/auth.store"
import { puede } from "@features/auth/utils/permisos"
import { getErrorMessage } from "@shared/utils/error"
import type { DatosTarjeta } from "@features/pagos/schemas/pagos.schema"
import type { EnlacePago, MedioPago } from "@features/pagos/types/pagos.types"
import type {
  DatosDatosFiscales,
  DatosElegirPlan,
} from "@features/suscripcion/schemas/suscripcion.schema"
import type { Factura } from "@features/suscripcion/types/suscripcion.types"

/** Estados en los que el cobro ya no va a moverse: no hay nada que esperar. */
const RESUELTOS = new Set(["aprobado", "rechazado", "anulado", "error"])

/** Cuántas veces se vuelve a preguntar tras volver del checkout, y cada cuánto. */
const INTENTOS_TRAS_PAGO = 5
const MS_ENTRE_INTENTOS = 5_000

/**
 * La cuenta: qué plan hay contratado, con qué se paga y qué se ha cobrado.
 *
 * Es el apartado que más pide, y por eso es una ruta propia: todo lo de aquí se
 * pide **al abrirlo**, no al entrar a Configuración. La mayoría de las visitas a
 * Configuración no viene a mirar la factura.
 */
export default function ConfiguracionPlanPage() {
  const { barberia, fetchBarberia } = useConfiguracion()

  const {
    suscripcion,
    planes,
    facturas,
    facturaDetalle,
    datosFiscales,
    paisFiscal,
    loadingSuscripcion,
    loadingFacturas,
    loadingFacturaDetalle,
    loadingDatosFiscales,
    loadingAction: loadingSuscripcionAction,
    fetchSuscripcion,
    fetchFacturas,
    fetchFactura,
    fetchDatosFiscales,
    handleGuardarDatosFiscales,
    handleElegirPlanSuscripcion,
    handleCancelarSuscripcion,
    handleReanudarSuscripcion,
  } = useSuscripcion()

  const {
    mediosPago,
    enlaces,
    configuracion: configuracionPasarela,
    aceptaciones,
    errorConfiguracion,
    loadingMediosPago,
    loadingEnlaces,
    loadingConfiguracion: loadingPasarela,
    loadingAction: loadingPagosAction,
    fetchMediosPago,
    fetchEnlacesPago,
    fetchConfiguracionPagos,
    handleGuardarMedioPago,
    handleRetirarMedioPago,
    handleGenerarEnlacePago,
  } = usePagos()

  /**
   * Ocultar el botón no es seguridad —la api revalida el permiso en cada
   * petición—, pero evita ofrecer un guardado que va a terminar en 403.
   */
  const sesion = useAuthStore((estado) => estado.sesion)
  const gestiona = puede(sesion, "barberias.gestionar")
  /** `null` = Barion todavía no factura en el país de esta barbería. */
  const reglasFiscales = reglasFiscalesDe(paisFiscal)

  /**
   * De qué cobro se vuelve, cuando se vuelve de la pasarela. Sale de la
   * dirección y NO se copia a estado: la URL ya es la verdad, y duplicarla
   * obligaba a sincronizar las dos con un efecto que además encadena renders.
   *
   * Consecuencia buscada: cerrar el aviso **es** limpiar la dirección —volver a
   * esta misma ruta sin query—, así que el gesto de descartarlo se lleva por
   * delante también los parámetros que el proveedor añade al redirigir (Wompi
   * manda `id` y `env`). Y recargar con el parámetro todavía puesto vuelve a
   * enseñarlo, que es lo correcto: si sigue en la dirección es porque nadie ha
   * dado el pago por visto.
   *
   * `replace` y no `push`: descartar el aviso no es navegar a otra pantalla, así
   * que el botón de atrás sigue saliendo de aquí en vez de volver a enseñarlo.
   */
  const router = useRouter()
  const parametros = useSearchParams()
  const pagoDeRetorno = parametros.get("pago")

  const [agregandoTarjeta, setAgregandoTarjeta] = useState(false)
  const [medioARetirar, setMedioARetirar] = useState<MedioPago | null>(null)
  /** Cuál se acaba de copiar: confirma en el botón sin un toast por cada clic. */
  const [enlaceCopiadoId, setEnlaceCopiadoId] = useState<string | null>(null)
  /**
   * La factura abierta en el panel. Se guarda la fila entera, no el id: el
   * encabezado tiene que decir cuál se está mirando desde el primer fotograma,
   * mientras el desglose todavía viaja.
   */
  const [facturaAbierta, setFacturaAbierta] = useState<Factura | null>(null)
  const [editandoDatosFiscales, setEditandoDatosFiscales] = useState(false)

  useEffect(() => {
    void fetchBarberia()
    void fetchSuscripcion()
    void fetchFacturas()
    void fetchMediosPago()
    void fetchEnlacesPago()
    void fetchDatosFiscales()
    // La configuración de la pasarela se pide junto a los medios y no al abrir
    // el formulario: es la que decide si ese formulario existe siquiera.
    void fetchConfiguracionPagos()
  }, [
    fetchBarberia,
    fetchSuscripcion,
    fetchFacturas,
    fetchMediosPago,
    fetchEnlacesPago,
    fetchDatosFiscales,
    fetchConfiguracionPagos,
  ])

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

  /**
   * Generar y copiar en el mismo gesto: un enlace recién creado no sirve de nada
   * hasta que sale de la pantalla, así que se deja en el portapapeles sin pedir
   * un segundo clic. Si el navegador no lo permite —contexto no seguro, permiso
   * denegado— se avisa y el enlace sigue en la lista para copiarlo a mano.
   */
  const onGenerarEnlace = async () => {
    try {
      const enlace = await handleGenerarEnlacePago()
      void fetchEnlacesPago()
      await copiarAlPortapapeles(enlace)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  const copiarAlPortapapeles = async (enlace: EnlacePago) => {
    try {
      await navigator.clipboard.writeText(enlace.url)
      setEnlaceCopiadoId(enlace.id)
      notify.success("Enlace copiado. Ya puedes mandárselo a quien vaya a pagar")
    } catch {
      notify.info("Copia el enlace desde la lista: tu navegador no permitió hacerlo solo")
    }
  }

  /**
   * Los 422 de esta ruta son instrucciones, no averías: dicen cuál es el dígito
   * de verificación correcto o qué campo sobra en este país. Se enseñan tal
   * como los escribe la api.
   */
  const onGuardarDatosFiscales = async (datos: DatosDatosFiscales) => {
    try {
      const mensaje = await handleGuardarDatosFiscales(datos)
      setEditandoDatosFiscales(false)
      notify.success(mensaje)
    } catch (err) {
      notify.error(getErrorMessage(err))
    }
  }

  /**
   * Volver a pedir lo que el pago pudo haber movido, y solo eso: el estado de la
   * cuenta, sus facturas y los enlaces. El resultado no lo trae la redirección
   * —lo aplica el worker cuando el proveedor notifica—, así que esto es lo único
   * honesto que puede hacer un botón aquí: preguntar otra vez.
   */
  const onActualizarTrasPago = () => {
    void fetchSuscripcion()
    void fetchFacturas()
    void fetchEnlacesPago()
  }

  const enlaceDeRetorno = pagoDeRetorno
    ? enlaces.find((enlace) => enlace.referencia === pagoDeRetorno)
    : undefined
  const esperandoConfirmacion =
    !!pagoDeRetorno &&
    enlaceDeRetorno?.estado !== "aprobado" &&
    !RESUELTOS.has(enlaceDeRetorno?.estado ?? "")

  /**
   * Mientras el pago siga sin resolverse, se vuelve a preguntar solo.
   *
   * La notificación del proveedor tarda segundos, no minutos, y en ese hueco lo
   * único que había era un botón: quien vuelve del checkout se quedaba mirando
   * un aviso que no cambiaba salvo que se le ocurriera pulsarlo. Se reintenta
   * un número ACOTADO de veces —no es un poller— porque pasado ese rato lo que
   * hay es un problema, y repreguntar cada cinco segundos para siempre solo
   * carga la api con una pantalla abierta que nadie mira.
   */
  useEffect(() => {
    if (!esperandoConfirmacion) return

    let intentos = 0
    const temporizador = setInterval(() => {
      intentos += 1
      void fetchSuscripcion()
      void fetchEnlacesPago()
      if (intentos >= INTENTOS_TRAS_PAGO) clearInterval(temporizador)
    }, MS_ENTRE_INTENTOS)

    return () => clearInterval(temporizador)
  }, [esperandoConfirmacion, fetchSuscripcion, fetchEnlacesPago])

  const onVerFactura = (factura: Factura) => {
    setFacturaAbierta(factura)
    void fetchFactura(factura.id)
  }

  if (loadingSuscripcion || !suscripcion || !barberia)
    return <DataSkeleton variant="card" count={2} />

  return (
    <>
      {/*
        Va PRIMERO y no al lado del historial de enlaces: quien acaba de volver
        del checkout busca aquí qué pasó, y enterrar el aviso bajo cuatro
        tarjetas es no darle respuesta.
      */}
      {pagoDeRetorno && (
        <PagosRetornoPago
          referencia={pagoDeRetorno}
          // El estado sale de la lista que esta misma pantalla ya cargó: sin
          // esto el aviso seguía diciendo «esperando» con el mismo enlace
          // marcado «Pagado» justo debajo.
          estado={enlaceDeRetorno?.estado}
          cargando={loadingSuscripcion || loadingEnlaces}
          onActualizar={onActualizarTrasPago}
          onCerrar={() => router.replace(rutaDeSeccion("plan"), { scroll: false })}
        />
      )}
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
        // La fecha de corte sale del período vigente; en prueba todavía no hay
        // período y lo que manda es hasta cuándo llega la prueba.
        proximoCobroEn={suscripcion.periodoActualHasta ?? suscripcion.vigenteHasta}
        renovacionActiva={!suscripcion.cancelaAlFinPeriodo && !suscripcion.canceladaEn}
        onAgregar={() => setAgregandoTarjeta(true)}
        onRetirar={setMedioARetirar}
      />
      <PagosEnlacesList
        enlaces={enlaces}
        cargando={loadingEnlaces}
        cargandoAction={loadingPagosAction}
        soloLectura={!gestiona}
        copiadoId={enlaceCopiadoId}
        onGenerar={() => void onGenerarEnlace()}
        onCopiar={(enlace) => void copiarAlPortapapeles(enlace)}
      />
      <SuscripcionDatosFiscalesCard
        datos={datosFiscales}
        reglas={reglasFiscales}
        codigoPais={paisFiscal}
        cargando={loadingDatosFiscales}
        soloLectura={!gestiona}
        onEditar={() => setEditandoDatosFiscales(true)}
      />
      <SuscripcionFacturasList
        facturas={facturas}
        cargando={loadingFacturas}
        onVer={onVerFactura}
      />

      {/*
        Formulario largo → panel lateral, con el envío en el pie fijo. El país
        NO es un campo: llega del servidor y decide qué se pide.
      */}
      {reglasFiscales && paisFiscal && (
        <SidePanel
          open={editandoDatosFiscales}
          onOpenChange={setEditandoDatosFiscales}
          titulo="Datos de facturación"
          descripcion="Solo si necesitas la factura a nombre de una empresa. Si eres tú quien factura, con tu nombre y tu documento basta."
          size="lg"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditandoDatosFiscales(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form={ID_FORM_DATOS_FISCALES}
                disabled={loadingSuscripcionAction}
              >
                Guardar
              </Button>
            </>
          }
        >
          <SuscripcionDatosFiscalesForm
            // La clave lo remonta al cambiar lo guardado: un formulario con
            // `defaultValues` viejos seguiría enseñando el dato anterior.
            key={datosFiscales?.numeroDocumento ?? "sin-datos"}
            datos={datosFiscales}
            codigoPais={paisFiscal}
            reglas={reglasFiscales}
            onSubmit={onGuardarDatosFiscales}
          />
        </SidePanel>
      )}

      {/*
        El documento se lee en un panel y no en un cuadro centrado: el desglose
        crece con las líneas y una factura larga no puede quedar apretada.
      */}
      <SidePanel
        open={facturaAbierta !== null}
        onOpenChange={(abierto) => !abierto && setFacturaAbierta(null)}
        titulo={facturaAbierta ? `Factura ${facturaAbierta.numero}` : "Factura"}
        descripcion="Lo que Barion te cobró por tu suscripción"
      >
        <SuscripcionFacturaDetail
          // Hasta que llegue LA factura pedida se enseña el esqueleto: el
          // desglose de la anterior con este encabezado sería una cifra ajena.
          factura={facturaDetalle?.id === facturaAbierta?.id ? facturaDetalle : null}
          cargando={loadingFacturaDetalle}
        />
      </SidePanel>

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
    </>
  )
}
