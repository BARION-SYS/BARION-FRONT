"use client"

import { motion, type Variants } from "motion/react"
import { BarChart3, CalendarDays, QrCode, Users } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"

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

const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

// Los bloques del panel entran deslizando desde la izquierda, con resorte.
const bloque: Variants = {
  oculto: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 170, damping: 22 } },
}

export function PanelMarca() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-12 lg:flex lg:w-1/2">
      {/* Empapelado diagonal — textura sutil de barbería */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--foreground) 0 2px, transparent 2px 26px)",
        }}
        aria-hidden
      />

      {/* Poste de barbero — cinta vertical animada en el borde del panel */}
      <div className="cinta-barberia absolute top-0 right-0 h-full w-1.5" aria-hidden />

      {/* Resplandor dorado de marca */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <motion.div
        className="relative z-10 flex h-full flex-col justify-between"
        variants={contenedor}
        initial="oculto"
        animate="visible"
      >
        <motion.div className="flex items-center gap-4" variants={bloque}>
          <LogoBarion priority className="h-14" />
          <span className="rounded-full border border-border px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Barbershop OS
          </span>
        </motion.div>

        <div className="space-y-7">
          <motion.div variants={bloque}>
            <h1 className="text-4xl leading-tight font-bold text-balance text-foreground">
              El ecosistema digital
              <br />
              <span className="text-primary">completo</span> para tu
              <br />
              barbería moderna.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Gestiona citas, barberos, nómina y clientes desde una sola plataforma. Simple, rápido
              y premium.
            </p>
          </motion.div>

          <motion.ul className="grid grid-cols-2 gap-3" variants={contenedor}>
            {beneficios.map((beneficio) => (
              <motion.li
                key={beneficio.etiqueta}
                variants={bloque}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
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
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div className="flex items-center divide-x divide-border" variants={bloque}>
          {cifras.map((cifra) => (
            <div key={cifra.etiqueta} className="px-6 first:pl-0">
              <p className="text-lg font-bold text-primary tabular-nums">{cifra.valor}</p>
              <p className="text-[11px] text-muted-foreground">{cifra.etiqueta}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
