import { LayoutDashboard } from "@shared/layout/LayoutDashboard"
import { AuthProvider } from "@shared/providers/AuthProvider"

// AuthProvider POR FUERA del layout: sin sesión resuelta no se pinta ni el
// chrome. El Navbar lee el nombre y la barbería del store, y aquí dentro ya
// están puestos — nunca le toca renderizar con la sesión a medias.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutDashboard>{children}</LayoutDashboard>
    </AuthProvider>
  )
}
