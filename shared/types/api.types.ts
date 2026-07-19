// Tipos genéricos del cliente HTTP — nunca viven dentro de lib/http.

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Contrato de la API: el body SIEMPRE llega como { data, message?, pagination? }.
// El payload viene directo en `data` (nunca data.usuarios ni anidados por recurso).
export interface ApiEnvelope<T> {
  data: T
  message?: string
  pagination?: PaginationInfo | null
}

// Lo normalizado por ApiClient — lo que recibe el service.
export interface ApiResult<T> {
  data: T
  status: number
  message: string
  pagination?: PaginationInfo | null
}

export interface HttpError {
  status: number
  message: string
  detail?: unknown
}
