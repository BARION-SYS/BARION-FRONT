import type { MetadataRoute } from "next"

/**
 * Manifest de la aplicación. Es lo que permite instalar el panel como app
 * en el teléfono del barbero: sin él, «Añadir a pantalla de inicio» guarda un
 * marcador con una captura en vez del icono de la tijera.
 *
 * `standalone` y no `browser`, al revés que el sitio: el panel se usa a diario
 * y sin barra de direcciones se siente como la app que es.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barion",
    short_name: "Barion",
    description: "Agenda, clientes y nómina de tu barbería.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0f1112",
    theme_color: "#0f1112",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
