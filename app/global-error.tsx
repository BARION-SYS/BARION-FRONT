"use client"

import "@/style/globals.css"

/**
 * El último recurso: lo que se ve cuando revienta el propio `layout.tsx`.
 *
 * **Reemplaza al layout raíz entero**, así que aquí no hay `ThemeProvider`, ni
 * `TenantProvider`, ni tipografía cargada, ni `Toaster` — de ahí que tenga que
 * declarar su propio `<html>` y su propio `<body>` e importar la hoja de estilos
 * él mismo.
 *
 * ── Por qué no reutiliza nada de `shared/` ──────────────────────────────────
 * Porque el escenario que lo dispara es justamente que algo de arriba falló.
 * `LogoBarion` lee el tema con `useTheme`, y el `Button` viene de Base UI: un
 * componente que dependa de un proveedor que quizá acaba de morir convierte la
 * pantalla de rescate en un segundo error, y ese ya no lo atrapa nadie. Texto
 * plano y un `<button>` nativo son la única versión que no puede fallar — es la
 * excepción que la regla de «primitivos siempre de shadcn» admite, y es esta.
 *
 * El tema queda en claro porque nadie puso la clase `.dark` en `<html>`. Se
 * asume: es una pantalla que casi nadie debería ver nunca, y adivinar el tema
 * exigiría el script que precisamente no llegó a correr.
 *
 * Recargar y no `reset()`: si lo que se rompió es el layout, volver a montar el
 * mismo árbol se rompe otra vez.
 */
export default function ErrorGlobal({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-32 text-center">
          <p className="text-lg font-bold tracking-tight text-foreground">Barion</p>
          <p className="mt-12 text-xs font-medium tracking-widest text-primary uppercase">
            Algo se rompió
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            No pudimos cargar la aplicación
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            No es culpa tuya y no se perdió nada de lo que ya estaba guardado. Recarga la página
            para volver a intentarlo.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 h-12 cursor-pointer rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Recargar
          </button>

          {error.digest && (
            <p className="mt-10 text-xs text-muted-foreground">
              Si vuelve a pasar, dile a soporte este código:{" "}
              <span className="font-medium text-foreground tabular-nums">{error.digest}</span>
            </p>
          )}
        </section>
      </body>
    </html>
  )
}
