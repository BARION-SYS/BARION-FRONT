"use client"

import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"
import { rutasPublicas } from "@routes/rutasPublicas"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
import { DataSkeleton } from "@shared/components/feedback/DataSkeleton"
import { Button } from "@shared/components/ui/button"

export type EstadoVerificacion = "verificando" | "listo" | "invalido"

interface RegistroVerificacionProps {
  estado: EstadoVerificacion
  mensaje: string | null
}

/**
 * Lo que ve quien abre el enlace del correo. Presentacional puro: el estado lo
 * decide la página, que es quien llama a la api.
 *
 * Los tres fallos posibles —caducado, ya usado, inexistente— se pintan igual
 * porque **la api responde lo mismo para los tres**, y distinguirlos solo
 * ayudaría a quien está probando enlaces ajenos.
 */
export function RegistroVerificacion({ estado, mensaje }: RegistroVerificacionProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <LogoBarion variante="completo" />

      {estado === "verificando" && (
        <div className="w-full max-w-xs space-y-4">
          <DataSkeleton variant="text" count={2} className="items-center" />
          <p className="sr-only" role="status">
            Confirmando tu correo…
          </p>
        </div>
      )}

      {estado === "listo" && (
        <>
          <CheckCircle2 className="size-10 text-(--exito)" aria-hidden />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Correo confirmado</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              {mensaje ?? "Tu barbería ya es visible para tus clientes."}
            </p>
          </div>
          <Button size="lg" render={<Link href={rutasPublicas.entrar} />}>
            Entrar a mi panel
          </Button>
        </>
      )}

      {estado === "invalido" && (
        <>
          <XCircle className="size-10 text-destructive" aria-hidden />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Este enlace ya no sirve</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              {mensaje ??
                "Puede que haya caducado o que ya lo hayas usado. Entra a tu panel y pídelo de nuevo."}
            </p>
          </div>
          {/* El texto va como children del Button: puesto dentro del elemento de
              `render` se pierde y el botón sale vacío */}
          <Button variant="outline" size="lg" render={<Link href={rutasPublicas.entrar} />}>
            Ir a entrar
          </Button>
        </>
      )}
    </main>
  )
}
