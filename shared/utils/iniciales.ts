/**
 * Iniciales para un avatar a partir de un nombre.
 *
 * La API no las manda y no debería: son presentación pura, y calcularlas aquí
 * evita que dos respuestas distintas (un barbero, una barbería, un cliente)
 * tengan que ponerse de acuerdo en cómo se abrevian.
 *
 * Toma la primera letra de las dos primeras palabras. Con una sola palabra
 * devuelve una letra, no dos: partir una palabra por la mitad produce cosas
 * como "BA" para "Barbería" y nadie reconoce ahí su negocio.
 */
export function inicialesDe(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return "?"
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase()
}
