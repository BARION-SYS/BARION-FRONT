// Transforma un objeto plano (data validada por zod) a FormData para envíos multipart.
// axios agrega el multipart/form-data con boundary automáticamente.
export function toFormData(data: Record<string, unknown>): FormData {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("toFormData espera un objeto plano de clave/valor")
  }

  const formData = new FormData()

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value)
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString())
    } else if (Array.isArray(value)) {
      // Arrays: un append por elemento (convención clave[] de la api)
      for (const item of value) {
        if (item === undefined || item === null) continue
        formData.append(
          `${key}[]`,
          item instanceof Blob
            ? item
            : typeof item === "object"
              ? JSON.stringify(item)
              : String(item)
        )
      }
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  }

  return formData
}
