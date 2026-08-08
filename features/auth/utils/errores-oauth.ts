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
  // Solo aparece en el alta abierta, y es el único motivo que no oculta nada:
  // quien llega aquí acaba de demostrarle a Google que ese correo es suyo, así
  // que ya sabía si tenía cuenta. Lo que hacía falta era decirle qué hacer.
  oauth_ya_registrado:
    "Ya tienes una cuenta de Barion con ese correo. Inicia sesión en vez de registrarte.",
  // Antes este caso caía en `oauth_sin_acceso`, que decía justo lo contrario de
  // la verdad —«ese correo no tiene acceso, pide que te inviten»— a alguien que
  // sí lo tiene, y lo mandaba a pedirle permiso a nadie. La cuenta existe: lo
  // que falta es probar que el correo es suyo, y eso se hace entrando una vez.
  // Sin nombrar una pantalla concreta, y hubo que corregirlo: decía
  // «Configuración → Seguridad», que existe en el panel de una barbería y NO en
  // el área del staff de Barion. A ese actor se le daba una instrucción hacia un
  // sitio al que no puede llegar, justo en la puerta de entrada.
  oauth_vincular_pendiente:
    "Tu cuenta existe, pero todavía usa contraseña. Entra con ella una vez y conecta Google desde la seguridad de tu cuenta; después ya podrás entrar directo.",
}

/** `null` cuando no hay error, o cuando llega uno que no reconocemos. */
export function mensajeDeErrorOauth(motivo: string | null): string | null {
  if (!motivo) return null
  // Un motivo desconocido no se pinta crudo en pantalla: sería exponer un
  // identificador interno a quien no puede hacer nada con él.
  return MENSAJES[motivo] ?? MENSAJES.oauth_sin_acceso
}
