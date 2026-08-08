import { SearchX } from "lucide-react"

/**
 * Barbería que no existe — y **la única pantalla del portal sin marca de nadie**.
 *
 * ── Por qué es un 404 aparte y no el de la aplicación ───────────────────────
 * El de la raíz ofrece «Volver al inicio» (el sitio de venta de Barion) e
 * «Iniciar sesión» (la puerta del staff). Correcto para quien tecleó mal una
 * dirección del panel, y lo contrario de lo que hay que enseñarle a quien venía
 * a reservar un corte: el portal es de SU barbería, va con su marca, y una
 * dirección mal copiada no puede acabar presentándole la puerta de un producto
 * que no compró ni le importa.
 *
 * Tampoco lleva logotipo: aquí no hay inquilino que resolver —el slug no
 * existe—, así que no hay colores ni nombre que pintar, y poner el de Barion
 * sería presentarle la marca de la plataforma a quien nunca tiene por qué
 * conocerla.
 *
 * ── Por qué no hay NINGÚN botón, que costó tres intentos ────────────────────
 * Primero llevaba «Volver» siempre, y quien llega escaneando un cartón abre una
 * pestaña nueva: no hacía nada. Después solo con historial, y sigue sin servir —
 * «atrás» devuelve a donde fuera que estuviera esa persona, otro sitio o la app
 * de mensajería desde la que abrió el enlace, y nada de eso la acerca a reservar
 * su cita. Un botón que no resuelve el problema por el que se llegó aquí es
 * ruido con aspecto de solución.
 *
 * También llegó a enseñarse la dirección que se intentó abrir, para cotejarla
 * con el cartón letra por letra. **Se retiró**, y no porque filtrara algo —esa
 * URL ya está en la barra del navegador de quien la lee— sino porque le ponía el
 * host de infraestructura enfrente y le pedía comparar caracteres, que es pensar
 * como desarrollador. Un cliente no sabe qué es un identificador de barbería.
 *
 * Lo único que hay que decirle es a quién preguntarle, así que eso es lo único
 * que dice. No hay nada más y no se finge que lo haya: no existe —ni debe
 * existir— una búsqueda pública de barberías, porque sería un directorio de los
 * clientes de Barion.
 *
 * Sin estado, sin navegador y sin interacción: por eso no es un componente de
 * cliente.
 */
export default function BarberiaNoEncontrada() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      <span
        className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"
        aria-hidden
      >
        <SearchX className="size-6" />
      </span>

      <h1 className="mt-8 max-w-md text-2xl font-bold tracking-tight text-balance sm:text-3xl">
        No encontramos esta barbería
      </h1>

      <p className="mt-4 max-w-sm text-base leading-relaxed text-balance text-muted-foreground">
        El enlace puede estar incompleto, o esta barbería ya no está disponible.
      </p>

      <p className="mt-3 max-w-sm text-base leading-relaxed text-balance text-foreground">
        Confirma con tu barbería el enlace o el código QR y vuelve a intentarlo.
      </p>
    </section>
  )
}
