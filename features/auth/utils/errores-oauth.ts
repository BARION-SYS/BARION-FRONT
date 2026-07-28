/**
 * Traduce el motivo con el que la API devuelve al panel cuando el acceso con un
 * proveedor externo falla.
 *
 * La API manda una ETIQUETA, no un texto: el mensaje lo pone aquí, que es donde
 * se sabe en qué idioma habla el usuario. Y son pocas a propósito — cada motivo
 * distinto es información que también recibe quien anda probando correos ajenos.
 *
 * Cada mensaje dice qué puede HACER la persona. "Error de autenticación" es
 * verdad y no sirve para nada.
 */
const MENSAJES: Record<string, string> = {
  oauth_invalido: "El acceso caducó o se interrumpió. Vuelve a intentarlo desde el botón.",
  oauth_no_verificado:
    "Google no confirma que ese correo sea tuyo. Verifícalo en tu cuenta de Google y vuelve a intentarlo.",
  oauth_sin_acceso:
    "Ese correo no tiene acceso a Barion. Pide a tu barbería que te invite con esa misma dirección.",
  oauth_inactiva: "Tu cuenta o tu barbería están inactivas. Ponte en contacto con administración.",
  oauth_no_configurado:
    "El acceso con Google no está disponible en este momento. Entra con tu correo y contraseña.",
}

/** `null` cuando no hay error, o cuando llega uno que no reconocemos. */
export function mensajeDeErrorOauth(motivo: string | null): string | null {
  if (!motivo) return null
  // Un motivo desconocido no se pinta crudo en pantalla: sería exponer un
  // identificador interno a quien no puede hacer nada con él.
  return MENSAJES[motivo] ?? MENSAJES.oauth_sin_acceso
}
