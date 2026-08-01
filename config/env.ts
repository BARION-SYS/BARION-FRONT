import { z } from "zod"

// Variables de entorno validadas con zod — falla en build si algo está mal.
// Next solo expone NEXT_PUBLIC_* al cliente si se referencian explícitamente.
const esquemaEnv = z.object({
  // SIN default a propósito. Un valor de reserva apuntando a localhost es peor
  // que no tener ninguno: desplegado tras un dominio, el navegador de cada
  // usuario llamaría a SU propia máquina y el fallo aparecería como una red
  // caída en vez de como configuración ausente. Sin la variable, esto revienta
  // en el arranque, que es cuando se puede arreglar.
  //
  // Incluye el prefijo global /api y la versión /v1: sin el /api toda petición
  // responde 404 y parece un problema de permisos de origen cruzado.
  NEXT_PUBLIC_API_URL: z.url(),
  // Dirección del SITIO PÚBLICO (repo BARION-WEB), que es otro despliegue en
  // otro dominio. Es el «volver al inicio» de esta aplicación: el 404 y el fin
  // del registro apuntan ahí. Sin ella esos dos botones no tendrían destino, así
  // que tampoco lleva reserva.
  NEXT_PUBLIC_LANDING_URL: z.url(),
})

const variables = esquemaEnv.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_LANDING_URL: process.env.NEXT_PUBLIC_LANDING_URL,
})

export const env = {
  apiUrl: variables.NEXT_PUBLIC_API_URL,
  landingUrl: variables.NEXT_PUBLIC_LANDING_URL,
} as const
