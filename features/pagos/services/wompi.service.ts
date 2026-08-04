import { wompiProduccion, wompiSandbox } from "@lib/http/instances"
import { esquemaTokenizacionWompi, type DatosTarjeta } from "@features/pagos/schemas/pagos.schema"
import type { AceptacionesPasarela, AmbientePasarela } from "@features/pagos/types/pagos.types"
import type { ComercioWompi, TokenTarjetaWompi } from "@features/pagos/types/wompi.types"

/**
 * Wompi, en su dominio y desde el navegador.
 *
 * Es el ÚNICO sitio del repo por el que pasa un número de tarjeta, y no cruza
 * hacia Barion: lo que sale de aquí es un token de un solo uso. Por eso tampoco
 * hay estado — ni el token ni el número se guardan en ninguna parte, se pasan y
 * se olvidan.
 *
 * Contrato del proveedor: https://docs.wompi.co/en/docs/colombia/metodos-de-pago/
 */
export const wompiService = {
  /**
   * Las dos aceptaciones que Wompi exige antes de guardar una tarjeta, con el
   * enlace al documento de cada una.
   *
   * Se piden desde el navegador porque son de la PERSONA que acepta, no del
   * servidor: la api solo las transporta, y como cadenas opacas.
   */
  async obtenerAceptaciones(
    llavePublica: string,
    ambiente: AmbientePasarela
  ): Promise<AceptacionesPasarela> {
    const res = await clienteDe(ambiente).get<ComercioWompi>(`/merchants/${llavePublica}`)
    const terminos = res.data?.presigned_acceptance
    const datosPersonales = res.data?.presigned_personal_data_auth

    // Sin una de las dos no se monta el formulario: la tarjeta se guardaría sin
    // un consentimiento que la ley colombiana exige, y la pasarela la rechazaría
    // igual una pantalla más tarde.
    if (!terminos?.acceptance_token || !datosPersonales?.acceptance_token) {
      throw new Error(
        "La pasarela no entregó los documentos que hay que aceptar. Vuelve a intentarlo en un momento."
      )
    }

    return {
      terminos: { token: terminos.acceptance_token, enlace: terminos.permalink },
      datosPersonales: {
        token: datosPersonales.acceptance_token,
        enlace: datosPersonales.permalink,
      },
    }
  },

  /**
   * Canjea el número de tarjeta por un token de UN SOLO USO.
   *
   * La llave pública va como `Bearer` en la petición y no en la instancia: es un
   * dato de la barbería que responde la api, no configuración del despliegue.
   */
  async tokenizarTarjeta(
    datos: DatosTarjeta,
    llavePublica: string,
    ambiente: AmbientePasarela
  ): Promise<string> {
    const res = await clienteDe(ambiente).post<TokenTarjetaWompi>(
      "/tokens/cards",
      esquemaTokenizacionWompi.parse(datos),
      { headers: { Authorization: `Bearer ${llavePublica}` } }
    )
    return res.data.id
  },
}

// Sandbox y producción son dominios distintos y sus llaves no se cruzan: una
// llave `pub_test_` contra producción falla la autenticación, y al revés.
function clienteDe(ambiente: AmbientePasarela) {
  return ambiente === "produccion" ? wompiProduccion : wompiSandbox
}
