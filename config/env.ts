import { z } from "zod"

// Variables de entorno validadas con zod — falla en build si algo está mal.
// Next solo expone NEXT_PUBLIC_* al cliente si se referencian explícitamente.
const esquemaEnv = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000/v1"),
})

const variables = esquemaEnv.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

export const env = {
  apiUrl: variables.NEXT_PUBLIC_API_URL,
} as const
