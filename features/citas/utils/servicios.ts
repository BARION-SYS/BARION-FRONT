/** "Corte Clásico, Barba" o, con más de dos, "Corte Clásico +2 más". */
export function resumenServicios(servicios: string[]): string {
  if (servicios.length <= 2) return servicios.join(", ")
  return `${servicios[0]} +${servicios.length - 1} más`
}
