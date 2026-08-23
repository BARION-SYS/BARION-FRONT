"use client"

import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import { ETIQUETA_TIPO_DOCUMENTO, type ReglasFiscales } from "@features/suscripcion/utils/fiscal"
import type { DatosFiscales } from "@features/suscripcion/types/suscripcion.types"
import { useTextos } from "@shared/textos/useTextos"

interface SuscripcionDatosFiscalesCardProps {
  datos: DatosFiscales | null
  /** `null` = Barion todavía no factura en el país de esta barbería. */
  reglas: ReglasFiscales | null
  codigoPais: string | null
  cargando: boolean
  soloLectura: boolean
  onEditar: () => void
}

/**
 * A quién le emitimos la factura, en tres líneas y con el botón que abre el
 * formulario.
 *
 * Va encima de las facturas y debajo de la tarjeta porque ese es el orden real:
 * primero con qué se paga, después a nombre de quién, y al final lo cobrado.
 *
 * **Es opcional, y así se dice.** Sin nada capturado se factura como consumidor
 * final, que es lo que necesita un barbero solo con su estudio; esto existe
 * para quien va a exigir la factura a nombre de su empresa —normalmente para
 * deducir el gasto—, y esa es la única frase que hace falta para decidir.
 */
export function SuscripcionDatosFiscalesCard({
  datos,
  reglas,
  codigoPais,
  cargando,
  soloLectura,
  onEditar,
}: SuscripcionDatosFiscalesCardProps) {
  const t = useTextos("suscripcion.fiscales")
  const tPersona = useTextos("suscripcion.tipoPersona")
  return (
    <SectionCard
      titulo={t("titulo")}
      subtitulo={t("subtitulo")}
      accion={
        reglas && !soloLectura ? (
          <Button variant="outline" size="sm" onClick={onEditar}>
            {datos ? t("editar") : t("agregar")}
          </Button>
        ) : undefined
      }
    >
      <Loadable
        loading={cargando}
        variant="form"
        isEmpty={!datos}
        emptyState={
          reglas ? (
            <SinDatos
              titulo={t("sinDatos")}
              detalle="Te cobramos igual y la factura sale a tu nombre como consumidor final. Agrégalos solo si necesitas que vaya a nombre de tu empresa, por ejemplo para deducir el gasto."
              alto={160}
            />
          ) : (
            <SinDatos
              titulo={`Barion todavía no factura en ${codigoPais ?? "tu país"}`}
              detalle={t("sinDatosDetalle")}
              alto={160}
            />
          )
        }
      >
        {datos && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dato etiqueta={t("nombreLegal")} valor={datos.razonSocial} />
            <Dato
              etiqueta={ETIQUETA_TIPO_DOCUMENTO[datos.tipoDocumento]}
              valor={datos.numeroDocumento}
              tabular
            />
            <Dato etiqueta={t("tipo")} valor={tPersona(datos.tipoPersona)} />
            {datos.direccionFiscal && (
              <Dato
                etiqueta={t("domicilio")}
                valor={`${datos.direccionFiscal.calle}, ${datos.direccionFiscal.ciudad} (${datos.direccionFiscal.pais})`}
              />
            )}
            {datos.codigoMunicipio && (
              <Dato etiqueta={t("municipio")} valor={datos.codigoMunicipio} tabular />
            )}
            {datos.emailFacturacion && (
              <Dato etiqueta={t("enviamosA")} valor={datos.emailFacturacion} />
            )}
            {datos.responsabilidades.length > 0 && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">{t("responsabilidades")}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {datos.responsabilidades.map((codigo) => (
                    <StatusBadge key={codigo} etiqueta={codigo} tono="neutro" />
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </Loadable>
    </SectionCard>
  )
}

function Dato({
  etiqueta,
  valor,
  tabular,
}: {
  etiqueta: string
  valor: string
  tabular?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className={tabular ? "text-sm font-medium tabular-nums" : "text-sm font-medium"}>
        {valor}
      </dd>
    </div>
  )
}
