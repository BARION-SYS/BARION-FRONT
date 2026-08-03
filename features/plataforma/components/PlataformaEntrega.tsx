"use client"

import { EnlaceCopiable } from "@features/plataforma/components/EnlaceCopiable"
import type { BarberiaFicha } from "@features/plataforma/types/plataforma.types"

interface PlataformaEntregaProps {
  barberia: BarberiaFicha
  correoPropietario: string
}

/**
 * Lo que se le entrega al cliente que acaba de comprar.
 *
 * Es el final real del alta: la barbería ya existe, y lo único que falta es que
 * su dueño reciba por dónde entra. A partir de ahí él crea sus barberos, su
 * catálogo y su código QR — Barion no vuelve a tocarla.
 *
 * La contraseña NO se muestra aquí: la escribió quien está dando de alta y ya la
 * tiene. Repetirla en pantalla solo añade un sitio más del que puede escaparse.
 */
export function PlataformaEntrega({ barberia, correoPropietario }: PlataformaEntregaProps) {
  const origen = typeof window === "undefined" ? "" : window.location.origin

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-(--exito)/30 bg-[color-mix(in_srgb,var(--exito)_8%,transparent)] p-4">
        <p className="text-sm font-medium text-foreground">
          {barberia.nombreComercial} ya está creada y funcionando.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Envíale a tu cliente el enlace de entrada junto con el correo y la contraseña temporal que
          acabas de definir. Al entrar podrá cambiarla.
        </p>
      </div>

      <EnlaceCopiable
        etiqueta="Entrada de su equipo"
        descripcion="Aquí entran el propietario y, más adelante, sus barberos"
        valor={`${origen}/b/${barberia.slug}/entrar`}
      />

      <EnlaceCopiable
        etiqueta="Portal público de reservas"
        descripcion="Lo que verán sus clientes. Es también el destino del código QR"
        valor={`${origen}/b/${barberia.slug}`}
      />

      <EnlaceCopiable
        etiqueta="Correo del propietario"
        descripcion="Con este correo inicia sesión"
        valor={correoPropietario}
      />
    </div>
  )
}
