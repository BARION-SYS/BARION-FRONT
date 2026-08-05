import { z } from "zod"

/**
 * Lo que el portal ENVÍA.
 *
 *  · **El código de acceso sale por CORREO, y solo por correo.** Mandar un SMS
 *    se paga por mensaje y Barion no asume la mensajería, así que el correo es
 *    el canal que se verifica y la llave con la que el cliente entra.
 *  · El **teléfono sigue siendo obligatorio** al registrarse —la barbería tiene
 *    que poder llamar a quien va a atender—, pero ya no se verifica. Va en
 *    **E.164** (`+573001112233`), sin espacios ni guiones.
 */
const E164 = /^\+[1-9]\d{7,14}$/

/**
 * La marca del cartón QR: `sedes.slug_qr`, tal como venía en la URL impresa.
 *
 * Viaja como campo OPCIONAL en lo que crea al cliente y la cita, y es lo que las
 * deja con `origen = 'qr'` atadas a la sede del cartón. Quien no traiga marca
 * —cookie rechazada, navegación privada— reserva igual: se prefiere subestimar
 * el QR antes que inflarlo.
 */
const slugQr = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9-]{0,79}$/i, "Marca de QR inválida")
  .optional()

const telefono = z
  .string()
  .trim()
  // Se aceptan espacios y guiones al escribir y se limpian antes de enviar: nadie
  // teclea su número pegado, y rechazarlo por eso es maltratar a quien reserva.
  .transform((valor) => valor.replace(/[\s-]/g, ""))
  .refine((valor) => E164.test(valor), "Formato internacional: +573001112233")

/** Pedir el código: el correo y nada más. Es el único canal que lo manda. */
export const esquemaSolicitarCodigo = z.object({
  email: z.email("Ingresa un correo válido"),
})

/**
 * Verificar el código. `nombre` y `telefonoE164` solo hacen falta la primera vez,
 * pero el formulario los pide siempre: quien reserva escribe sus datos en el mismo
 * paso en el que pide el código, y volver a preguntarlos después sería un paso más.
 */
export const esquemaVerificarCodigo = z.object({
  email: z.email("Ingresa un correo válido"),
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El código es de 6 dígitos"),
  nombre: z.string().trim().min(2, "Ingresa tu nombre").optional(),
  telefonoE164: telefono.optional(),
  aceptaPromos: z.boolean().optional(),
  slugQr,
})

/** Los datos que el cliente escribe antes de recibir el código. */
export const esquemaContacto = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre"),
  telefonoE164: telefono,
  email: z.email("Ingresa un correo válido"),
  notas: z
    .string()
    .trim()
    .max(160, "Máximo 160 caracteres")
    .optional()
    .transform((valor) => valor || undefined),
  aceptaPromos: z.boolean(),
})

/**
 * Lo que se pide cuando YA hay sesión: solo lo que es de ESTA cita.
 *
 * Nombre, teléfono y correo no están porque ya se saben —los tiene su ficha— y
 * volver a pedirlos sería preguntarle a alguien lo que acaba de probar. El
 * consentimiento sigue aquí porque puede no haberlo dado nunca, y la pantalla
 * decide si enseñarlo mirando lo vigente, no adivinando.
 */
export const esquemaReservaConSesion = z.object({
  notas: z
    .string()
    .trim()
    .max(160, "Máximo 160 caracteres")
    .optional()
    .transform((valor) => valor || undefined),
  aceptaPromos: z.boolean().optional(),
})

/**
 * La reserva. `servicioIds` son ids del CATÁLOGO y no de la oferta: la oferta es
 * de un barbero, y con «cualquiera disponible» no se sabe cuál hasta que la api lo
 * resuelve.
 */
export const esquemaReserva = z.object({
  sedeId: z.uuid(),
  /** `null` = cualquiera disponible. */
  barberoId: z.uuid().nullable().optional(),
  servicioIds: z.array(z.uuid()).min(1, "Selecciona al menos un servicio"),
  iniciaEn: z.iso.datetime("Selecciona un horario"),
  notas: z.string().trim().max(1000).optional(),
  claveIdempotencia: z.string().min(8).max(128).optional(),
  slugQr,
})

export const esquemaReagendar = z.object({
  iniciaEn: z.iso.datetime("Selecciona un horario"),
})

export const esquemaCancelar = z.object({
  motivo: z.string().trim().max(500).optional(),
})

export const esquemaCalificar = z.object({
  puntaje: z.number().int().min(1, "Del 1 al 5").max(5, "Del 1 al 5"),
  comentario: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
})

/**
 * Lo que acompaña al enlace de un correo.
 *
 * **No lleva `accion`, y es a propósito**: qué hace el enlace lo decide el token
 * y lo resuelve la api. Si la pantalla pudiera elegir el propósito, un enlace de
 * «calificar» serviría para cancelarle la cita a otro. Aquí solo viaja lo que el
 * token no puede llevar dentro: el motivo de una cancelación y el puntaje de una
 * calificación — cada uno lo ignora la api si el token no es de ese propósito.
 */
export const esquemaAccionEnlace = z.object({
  /**
   * El sí explícito de una cancelación. **Solo la cancelación lo exige**: es la
   * única acción destructiva del grupo —libera un cupo que puede coger otro— y
   * un enlace se abre solo más veces de lo que parece (un cliente de correo que
   * precarga, un antivirus que sigue los enlaces, un reenvío a un grupo).
   *
   * Sin él la api responde `422 · motivo: requiere_confirmacion` **sin gastar el
   * token**, que es lo que permite pedir el motivo antes de ejecutar.
   */
  confirmado: z.boolean().optional(),
  motivo: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
  puntaje: z.number().int().min(1, "Del 1 al 5").max(5, "Del 1 al 5").optional(),
  comentario: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
})

/**
 * Ni el correo ni el teléfono están: el correo es la llave con la que entra y
 * cambiarlo sería cambiar de identidad sin volver a probar nada. Los dos se
 * corrigen desde el panel, que es donde hay alguien respondiendo.
 */
export const esquemaPerfilCliente = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre").optional(),
  apellido: z.string().trim().max(120).nullable().optional(),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD")
    .nullable()
    .optional(),
  barberoFavoritoId: z.uuid().nullable().optional(),
})

/** Un permiso de comunicación. Revocar es una fila nueva, nunca una edición. */
export const esquemaPreferencia = z.object({
  tipo: z.enum(["marketing_whatsapp", "marketing_sms", "marketing_email", "tratamiento_datos"]),
  otorgado: z.boolean(),
})

export const esquemaCanje = z.object({ premioId: z.uuid() })

export type DatosSolicitarCodigo = z.input<typeof esquemaSolicitarCodigo>
export type DatosVerificarCodigo = z.input<typeof esquemaVerificarCodigo>
export type DatosContacto = z.input<typeof esquemaContacto>
export type DatosReservaConSesion = z.input<typeof esquemaReservaConSesion>
export type DatosReserva = z.input<typeof esquemaReserva>
export type DatosReagendar = z.infer<typeof esquemaReagendar>
export type DatosCancelar = z.infer<typeof esquemaCancelar>
export type DatosCalificar = z.infer<typeof esquemaCalificar>
export type DatosPerfilCliente = z.infer<typeof esquemaPerfilCliente>
export type DatosPreferencia = z.infer<typeof esquemaPreferencia>
export type DatosCanje = z.infer<typeof esquemaCanje>
export type DatosAccionEnlace = z.infer<typeof esquemaAccionEnlace>
