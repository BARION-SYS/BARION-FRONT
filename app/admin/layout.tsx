import { LayoutDashboard } from "@shared/layout/LayoutDashboard"
import { AuthProvider } from "@shared/providers/AuthProvider"

/**
 * Área del staff de Barion. MISMO chrome que el panel: entra por la misma
 * puerta, se ve igual y cambia solo la navegación, que el sidebar resuelve a
 * partir de la dirección.
 *
 * El `area` no es decorativo: sin él, un propietario que escriba /admin a mano
 * recibiría un 403 por cada llamada en vez de volver a su panel.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider area="admin">
      <LayoutDashboard>{children}</LayoutDashboard>
    </AuthProvider>
  )
}
