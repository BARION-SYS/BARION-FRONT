"use client"

import { SectionCard } from "@shared/components/cards/SectionCard"
import { EnlaceCopiable } from "@shared/components/enlaces/EnlaceCopiable"
import { useFormato } from "@shared/hooks/useFormato"
import type { BarberiaFicha } from "@features/plataforma/types/plataforma.types"

interface PlataformaConfiguracionCardProps {
  ficha: BarberiaFicha
  /** `window.location.origin`, resuelto por el padre: aquí no se toca el DOM. */
  origen: string
}

/**
 * Cómo está montada por dentro y por dónde se entra.
 *
 * Los términos sin versión no son una fila a medias: el alta asistida no los
 * escribe, porque nadie acepta términos en nombre de otro. Se dice así para que
 * nadie lo «arregle».
 */
export function PlataformaConfiguracionCard({ ficha, origen }: PlataformaConfiguracionCardProps) {
  const { numero, fechaCorta } = useFormato()

  const datos = [
    { etiqueta: "Moneda", valor: ficha.monedaPorDefecto },
    { etiqueta: "Huso horario", valor: ficha.zonaHoraria },
    { etiqueta: "Idioma", valor: ficha.localePorDefecto },
    { etiqueta: "Cuentas con acceso", valor: numero(ficha.membresiasActivas) },
    {
      etiqueta: "Verificación",
      valor: ficha.verificadaEn ? fechaCorta(ficha.verificadaEn) : "Pendiente",
      nota: ficha.verificadaEn ? undefined : "Su portal público no se sirve todavía",
    },
    {
      etiqueta: "Términos",
      valor: ficha.terminosVersion ?? "Alta asistida",
      nota: ficha.terminosAceptadosEn
        ? `Aceptados el ${fechaCorta(ficha.terminosAceptadosEn)}`
        : "Se firman fuera del producto",
    },
  ]

  return (
    <SectionCard titulo="Cuenta" subtitulo="Configuración y enlaces">
      <div className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          {datos.map((dato) => (
            <div key={dato.etiqueta} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{dato.etiqueta}</dt>
              <dd className="truncate text-sm font-medium">{dato.valor}</dd>
              {dato.nota && <dd className="text-xs text-muted-foreground">{dato.nota}</dd>}
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <EnlaceCopiable
            etiqueta="Portal público de reservas"
            descripcion="Lo que ven sus clientes. Es también el destino de su código QR"
            valor={`${origen}/b/${ficha.slug}`}
          />
          <EnlaceCopiable
            etiqueta="Entrada de su equipo"
            descripcion="Por aquí entran el propietario y sus barberos"
            valor={`${origen}/b/${ficha.slug}/entrar`}
          />
        </div>
      </div>
    </SectionCard>
  )
}
