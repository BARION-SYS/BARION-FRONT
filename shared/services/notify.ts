import { toast } from "sonner"

// Único punto de toasts — nunca usar `toast` de sonner directo.
export const notify = {
  success: (mensaje: string) => toast.success(mensaje),
  error: (mensaje: string) => toast.error(mensaje),
  info: (mensaje: string) => toast.info(mensaje),
}
