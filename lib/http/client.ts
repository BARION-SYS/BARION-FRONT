import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios"
import type { ApiEnvelope, ApiResult, HttpError } from "@shared/types/api.types"

// Solo la clase — las instancias nombradas viven en lib/http/instances.ts.
// Sin Content-Type fijo: axios pone application/json para objetos y
// multipart/form-data con boundary cuando el cuerpo es FormData.
export class ApiClient {
  private readonly instance: AxiosInstance

  constructor(baseURL: string, options?: AxiosRequestConfig) {
    this.instance = axios.create({ baseURL, timeout: 15000, ...options })

    this.instance.interceptors.request.use((config) => {
      // Al integrar auth real: leer token de la sesión y agregar Authorization.
      return config
    })

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string }>) => {
        const normalized: HttpError = {
          status: error.response?.status ?? 0,
          message: error.response?.data?.message ?? error.message,
          detail: error.response?.data,
        }
        return Promise.reject(normalized)
      }
    )
  }

  // Desempaca el envelope { data, message?, pagination? } de la API.
  private toResult<T>(response: AxiosResponse<ApiEnvelope<T>>): ApiResult<T> {
    return {
      data: response.data?.data as T,
      status: response.status,
      message: response.data?.message ?? response.statusText ?? "",
      pagination: response.data?.pagination ?? null,
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.toResult(await this.instance.get<ApiEnvelope<T>>(url, config))
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.toResult(await this.instance.post<ApiEnvelope<T>>(url, body, config))
  }

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.toResult(await this.instance.put<ApiEnvelope<T>>(url, body, config))
  }

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.toResult(await this.instance.patch<ApiEnvelope<T>>(url, body, config))
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return this.toResult(await this.instance.delete<ApiEnvelope<T>>(url, config))
  }
}
