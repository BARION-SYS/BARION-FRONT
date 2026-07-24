// Shell del portal público del tenant: scroll de documento (nada de columnas con
// scroll interno — recortaban listas largas) y textura de marca compartida.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--foreground) 0 2px, transparent 2px 28px)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  )
}
