// Limpia query params: quita '', null y undefined (conserva false y 0).
export function omitEmpty<T extends Record<string, unknown>>(params: T): Partial<T> {
  const limpio: Record<string, unknown> = {}
  for (const [clave, valor] of Object.entries(params)) {
    if (valor === "" || valor === null || valor === undefined) continue
    limpio[clave] = valor
  }
  return limpio as Partial<T>
}
