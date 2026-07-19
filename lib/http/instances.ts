import { ApiClient } from "@lib/http/client"
import { env } from "@config/env"

// Todas las instancias nombradas — los services SIEMPRE importan de aquí.
export const api = new ApiClient(env.apiUrl)
