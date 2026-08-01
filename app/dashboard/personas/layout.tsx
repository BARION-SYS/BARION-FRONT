import { PersonasNav } from "@features/personas/components/PersonasNav"

// El chrome de la sección: las pestañas se pintan una vez y no se remontan al
// cambiar de vista. Cada página de dentro es su propio padre.
export default function PersonasLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="scroll-fino flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <PersonasNav />
      {children}
    </main>
  )
}
