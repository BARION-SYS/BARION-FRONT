import { BarChart3, CalendarDays, QrCode, Scissors, Users } from "lucide-react"

const beneficios = [
  {
    icono: CalendarDays,
    etiqueta: "Citas inteligentes",
    descripcion: "Agenda, reagenda y confirma",
  },
  { icono: Users, etiqueta: "Gestión de clientes", descripcion: "Historial y fidelización" },
  {
    icono: BarChart3,
    etiqueta: "Estadísticas en tiempo real",
    descripcion: "KPIs y métricas clave",
  },
  { icono: QrCode, etiqueta: "Registro por QR", descripcion: "Clientes sin fricción" },
]

const cifras = [
  { valor: "2,400+", etiqueta: "Barberías activas" },
  { valor: "48k+", etiqueta: "Citas/semana" },
  { valor: "99.9%", etiqueta: "Uptime" },
]

export function PanelMarca() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-12 lg:flex lg:w-1/2">
      <div className="pointer-events-none absolute inset-0 opacity-5" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute h-full w-px bg-foreground"
            style={{ left: `${(i + 1) * 12.5}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Scissors className="h-5 w-5 text-primary-foreground" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-bold tracking-wide text-foreground">TRIMLY</p>
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            Barbershop OS
          </p>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-4xl leading-tight font-bold text-balance text-foreground">
            El ecosistema digital
            <br />
            <span className="text-primary">completo</span> para tu
            <br />
            barbería moderna.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Gestiona citas, barberos, nómina y clientes desde una sola plataforma. Simple, rápido y
            premium.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {beneficios.map((beneficio) => (
            <li
              key={beneficio.etiqueta}
              className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/50 p-3.5"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <beneficio.icono className="h-3.5 w-3.5 text-primary" aria-hidden />
              </span>
              <span>
                <span className="block text-xs font-semibold text-foreground">
                  {beneficio.etiqueta}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  {beneficio.descripcion}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        {cifras.map((cifra) => (
          <div key={cifra.etiqueta}>
            <p className="text-lg font-bold text-primary tabular-nums">{cifra.valor}</p>
            <p className="text-[11px] text-muted-foreground">{cifra.etiqueta}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
