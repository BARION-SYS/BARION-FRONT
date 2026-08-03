import { useState } from "react"
import { Check } from "lucide-react"
import { SectionCard } from "@shared/components/cards/SectionCard"
import { SinDatos } from "@shared/components/feedback/SinDatos"
import { Button } from "@shared/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { useFormato } from "@shared/hooks/useFormato"
import { cn } from "@shared/utils/cn"
import type { DatosElegirPlan } from "@features/suscripcion/schemas/suscripcion.schema"
import type {
  PeriodoCobro,
  PlanPublicado,
  Suscripcion,
} from "@features/suscripcion/types/suscripcion.types"

interface SuscripcionPlanesListProps {
  planes: PlanPublicado[]
  suscripcion: Suscripcion
  /** Código ISO del país de la barbería: decide qué tarifa aplica. */
  pais: string
  soloLectura: boolean
  cargando: boolean
  onElegir: (datos: DatosElegirPlan) => void
}

/**
 * Nombre visible de cada función del plan. Las claves son banderas de producto y
 * la api las manda tal cual: traducirlas aquí es lo que permite cambiar el texto
 * de venta sin tocar la lógica de nadie.
 */
const NOMBRE_FUNCION: Record<string, string> = {
  agenda: "Agenda y reservas",
  portal: "Página pública de reservas",
  recordatorios: "Recordatorios automáticos",
  clientes: "Base de clientes",
  comisiones: "Comisiones y nómina",
  campanas: "Campañas de comunicación",
  fidelidad: "Puntos y premios",
  listaEspera: "Lista de espera",
  reportes: "Reportes y estadísticas",
  multisede: "Varias sedes",
}

export function SuscripcionPlanesList({
  planes,
  suscripcion,
  pais,
  soloLectura,
  cargando,
  onElegir,
}: SuscripcionPlanesListProps) {
  const { dineroEn } = useFormato()
  const [periodo, setPeriodo] = useState<PeriodoCobro>("mensual")

  // Solo los períodos con tarifa publicada para este país: ofrecer el anual sin
  // precio deja elegir algo que la api va a rechazar.
  const periodosDisponibles = new Set(
    planes.flatMap((plan) =>
      plan.precios.filter((p) => p.codigoPais === pais).map((p) => p.periodo)
    )
  )

  if (planes.length === 0) {
    return (
      <SectionCard titulo="Planes" subtitulo="Lo que se puede contratar">
        <SinDatos
          titulo="No hay planes publicados"
          detalle="Escríbenos y te ayudamos a elegir el que le sirve a tu barbería."
        />
      </SectionCard>
    )
  }

  return (
    <SectionCard
      titulo="Planes"
      subtitulo="Cambia cuando quieras. Bajar de plan no desactiva a nadie."
      accion={
        periodosDisponibles.size > 1 ? (
          <Tabs value={periodo} onValueChange={(valor) => setPeriodo(valor as PeriodoCobro)}>
            <TabsList>
              <TabsTrigger value="mensual">Mensual</TabsTrigger>
              <TabsTrigger value="anual">Anual</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : undefined
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {planes.map((plan) => {
          const precio = plan.precios.find((p) => p.codigoPais === pais && p.periodo === periodo)
          const actual = plan.codigo === suscripcion.plan.codigo
          // Sin tarifa no hay nada que contratar: se enseña el plan, no el botón.
          const contratable = Boolean(precio) && !soloLectura

          return (
            <article
              key={plan.codigo}
              className={cn(
                "flex flex-col gap-4 rounded-xl border border-border p-4",
                actual && "border-primary bg-primary/5"
              )}
            >
              <header className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{plan.nombre}</h3>
                  {actual && <span className="text-[10px] font-medium text-primary">Tu plan</span>}
                </div>
                {precio ? (
                  <p className="text-lg font-semibold text-foreground">
                    {dineroEn(Number(precio.montoCentavos), precio.moneda)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {periodo === "anual" ? " / año" : " / mes"}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sin tarifa publicada para tu país en este período
                  </p>
                )}
              </header>

              <ul className="space-y-1.5">
                {plan.funciones.map((funcion) => (
                  <li key={funcion} className="flex items-start gap-2 text-xs text-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-(--exito)" aria-hidden />
                    {NOMBRE_FUNCION[funcion] ?? funcion}
                  </li>
                ))}
              </ul>

              {Object.keys(plan.limites).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Hasta {plan.limites.sedes ?? "∞"} sede(s) y {plan.limites.barberos ?? "∞"}{" "}
                  barberos
                </p>
              )}

              <div className="mt-auto">
                <Button
                  size="sm"
                  variant={actual ? "outline" : "default"}
                  className="w-full"
                  disabled={!contratable || cargando}
                  onClick={() => onElegir({ planCodigo: plan.codigo, periodo })}
                >
                  {actual ? "Renovar en este plan" : `Cambiar a ${plan.nombre}`}
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </SectionCard>
  )
}
