import { toast } from "sonner"

/*
 * El aviso de la demo es UN toast con id fijo: lo lanza el cliente HTTP al
 * cortar un guardado, y el formulario que esperaba ese guardado lo vuelve a
 * lanzar como error. Con el mismo id el segundo actualiza al primero en vez de
 * apilarse, y sale como aviso —no es un fallo, es la demo—.
 */
const ID_DEMO = "modo-demo"
let mensajeDemo = ""

// Único punto de toasts — nunca usar `toast` de sonner directo.
export const notify = {
  success: (mensaje: string) => toast.success(mensaje),
  error: (mensaje: string) =>
    mensaje && mensaje === mensajeDemo ? toast.info(mensaje, { id: ID_DEMO }) : toast.error(mensaje),
  info: (mensaje: string) => toast.info(mensaje),
  demo: (mensaje: string) => {
    mensajeDemo = mensaje
    return toast.info(mensaje, { id: ID_DEMO })
  },
}
