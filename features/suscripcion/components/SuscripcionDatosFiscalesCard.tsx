"use client"

import { SectionCard } from "@shared/components/cards/SectionCard"
import { Loadable } from "@shared/components/feedback/Loadable"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { StatusBadge } from "@shared/components/status/StatusBadge"
import { Button } from "@shared/components/ui/button"
import {
  ETIQUETA_TIPO_DOCUMENTO,
  ETIQUETA_TIPO_PERSONA,
  type ReglasFiscales,
} from "@features/suscripcion/utils/fiscal"
import type { DatosFiscales } from "@features/suscripcion/types/suscripcion.types"

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
  return (
    <SectionCard
      titulo="Datos de facturación"
      subtitulo="Opcional. Solo si necesitas la factura a nombre de una empresa"
      accion={
        reglas && !soloLectura ? (
          <Button variant="outline" size="sm" onClick={onEditar}>
            {datos ? "Editar" : "Agregar"}
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
              titulo="No hace falta que pongas nada"
              detalle="Te cobramos igual y la factura sale a tu nombre como consumidor final. Agrégalos solo si necesitas que vaya a nombre de tu empresa, por ejemplo para deducir el gasto."
              alto={160}
            />
          ) : (
            <SinDatos
              titulo={`Barion todavía no factura en ${codigoPais ?? "tu país"}`}
              detalle="Escríbenos antes de activar el cobro y lo resolvemos contigo."
              alto={160}
            />
          )
        }
      >
        {datos && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dato etiqueta="Nombre legal" valor={datos.razonSocial} />
            <Dato
              etiqueta={ETIQUETA_TIPO_DOCUMENTO[datos.tipoDocumento]}
              valor={datos.numeroDocumento}
              tabular
            />
            <Dato etiqueta="Tipo" valor={ETIQUETA_TIPO_PERSONA[datos.tipoPersona]} />
            {datos.direccionFiscal && (
              <Dato
                etiqueta="Domicilio fiscal"
                valor={`${datos.direccionFiscal.calle}, ${datos.direccionFiscal.ciudad} (${datos.direccionFiscal.pais})`}
              />
            )}
            {datos.codigoMunicipio && (
              <Dato etiqueta="Municipio DANE" valor={datos.codigoMunicipio} tabular />
            )}
            {datos.emailFacturacion && (
              <Dato etiqueta="Enviamos la factura a" valor={datos.emailFacturacion} />
            )}
            {datos.responsabilidades.length > 0 && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Responsabilidades</dt>
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
