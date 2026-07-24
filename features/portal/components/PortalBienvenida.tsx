"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CalendarCheck, PartyPopper, Scissors } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { InitialsAvatar } from "@shared/components/avatar/InitialsAvatar"
import type { ClientePortal } from "@features/portal/types/portal.types"

interface PortalBienvenidaProps {
  cliente: ClientePortal
  nombreBarberia: string
  hrefReservar: string
  hrefCitas: string
}

// Cierre del alta: el cliente ya existe en la barbería y entra directo a reservar.
export function PortalBienvenida({
  cliente,
  nombreBarberia,
  hrefReservar,
  hrefCitas,
}: PortalBienvenidaProps) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
    >
      <span
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--exito)_15%,transparent)]"
        aria-hidden
      >
        <PartyPopper className="h-7 w-7 text-(--exito)" />
      </span>

      <h2 className="mt-4 text-2xl font-bold text-foreground">Bienvenido a {nombreBarberia}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Tu perfil quedó creado. Ya puedes reservar sin volver a escribir tus datos.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-left">
        <InitialsAvatar iniciales={cliente.iniciales} tamano="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{cliente.nombre}</p>
          <p className="truncate text-xs text-muted-foreground">{cliente.telefono}</p>
          {cliente.barberoFavorito && (
            <p className="mt-0.5 truncate text-xs text-primary">
              Barbero favorito: {cliente.barberoFavorito}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          render={<Link href={hrefReservar} />}
          nativeButton={false}
          size="lg"
          className="h-12 flex-1 text-sm font-semibold"
        >
          <Scissors aria-hidden />
          Reservar ahora
        </Button>
        <Button
          render={<Link href={hrefCitas} />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="h-12 flex-1 text-sm font-semibold"
        >
          <CalendarCheck aria-hidden />
          Mis citas
        </Button>
      </div>
    </motion.div>
  )
}
