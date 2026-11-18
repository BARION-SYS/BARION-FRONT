import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios"
import { esMotivoConocido } from "@shared/utils/error"
import type { ApiEnvelope, ApiErrorEnvelope, ApiResult, HttpError } from "@shared/types/api.types"

/**
 * Opcional: decide antes de enviarla si una escritura (POST/PUT/PATCH/DELETE)
 * sale o se rechaza aquí mismo con el error devuelto. Lo usa la demo.
 */
type FiltroEscritura = (url: string) => HttpError | null

// Solo la clase — las instancias nombradas viven en lib/http/instances.ts.
// Sin Content-Type fijo: axios pone application/json para objetos y
// multipart/form-data con boundary cuando el cuerpo es FormData.
export class ApiClient {
  private readonly instance: AxiosInstance
  private readonly filtroEscritura?: FiltroEscritura

  constructor(baseURL: string, options?: AxiosRequestConfig, filtroEscritura?: FiltroEscritura) {
    this.filtroEscritura = filtroEscritura
    // withCredentials: la sesión viaja en una cookie httpOnly que pone la API.
    // El navegador NO la manda en peticiones cross-origin sin esto, y el front
    // (puerto 2203) y la API (4000) son orígenes distintos incluso en local.
    // No hay token que leer ni cabecera que agregar: por eso el interceptor de
    // request ya no existe.
    this.instance = axios.create({
      baseURL,
      timeout: 15000,
      withCredentials: true,
      // Un array en la query va como clave REPETIDA y sin corchetes
      // (`ofertaIds=a&ofertaIds=b`), que es lo que documenta el contrato de la
      // api. Por defecto axios le pega corchetes —`ofertaIds[]=a`— y Express 5
      // parsea la query con `querystring` (no con `qs`), así que NO los deshace:
      // a la api le llega una propiedad literal `ofertaIds[]` que su DTO no
      // conoce y responde 400. Se notó en el escaparate, donde dejaba la ficha
      // visible pero cortaba el paso de reservar.
      paramsSerializer: { indexes: null },
      ...options,
    })

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorEnvelope>) => {
        const cuerpo = error.response?.data
        const sobre = cuerpo?.error
        const motivo = sobre?.motivo
        const normalized: HttpError = {
          status: error.response?.status ?? 0,
          // La API responde { error: { message, status } }, no { message }.
          message: sobre?.message ?? cuerpo?.message ?? error.message,
          // `codigo` y `motivo` son ADITIVOS: una api que todavía no los emite
          // los deja en undefined y quien ramifica con ellos ya cuenta con eso.
          // Un `motivo` fuera del catálogo se descarta aquí, en el borde.
          codigo: sobre?.codigo,
          motivo: esMotivoConocido(motivo) ? motivo : undefined,
          detail: cuerpo,
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

  // Lanza el `HttpError` del filtro sin tocar la red: el llamador lo recibe
  // igual que si hubiera respondido la api.
  private revisarEscritura(url: string): void {
    const rechazo = this.filtroEscritura?.(url)
    if (rechazo) throw rechazo
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    this.revisarEscritura(url)
    return this.toResult(await this.instance.post<ApiEnvelope<T>>(url, body, config))
  }

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    this.revisarEscritura(url)
    return this.toResult(await this.instance.put<ApiEnvelope<T>>(url, body, config))
  }

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    this.revisarEscritura(url)
    return this.toResult(await this.instance.patch<ApiEnvelope<T>>(url, body, config))
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    this.revisarEscritura(url)
    return this.toResult(await this.instance.delete<ApiEnvelope<T>>(url, config))
  }
}
