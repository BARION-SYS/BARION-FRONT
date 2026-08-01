"use client"

import Link from "next/link"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { LogoBarion } from "@shared/components/brand/LogoBarion"
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
        <>
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground" role="status">
            Confirmando tu correo…
          </p>
        </>
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
          <Button size="lg" render={<Link href="/entrar" />}>
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
          <Button variant="outline" size="lg" render={<Link href="/entrar">Ir a entrar</Link>} />
        </>
      )}
    </main>
  )
}
