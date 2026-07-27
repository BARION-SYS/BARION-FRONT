import { z } from "zod"

// Variables de entorno validadas con zod — falla en build si algo está mal.
// Next solo expone NEXT_PUBLIC_* al cliente si se referencian explícitamente.
const esquemaEnv = z.object({
  // La api monta en /api (prefijo global) + /v1 (versionado por URI). Sin el
  // /api toda petición responde 404 y parece un problema de CORS.
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:2201/api/v1"),
})

const variables = esquemaEnv.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

export const env = {
  apiUrl: variables.NEXT_PUBLIC_API_URL,
} as const
