/** Rótulos de las familias de capacidades. Sin entrada, se muestra la clave. */
export const NOMBRE_FAMILIA: Record<string, string> = {
  barberias: "Barbería",
  sedes: "Sedes",
  equipo: "Equipo",
  roles: "Roles y permisos",
  barberos: "Barberos",
  catalogo: "Catálogo",
  agenda: "Agenda",
  clientes: "Clientes",
  ganancias: "Liquidación",
  jornadas: "Jornadas",
  reportes: "Reportes",
  plataforma: "Plataforma",
}

/**
 * Las capacidades de plataforma no se reparten desde una barbería: no salen de
 * un rol sino de la bandera del staff de Barion.
 */
export const FAMILIA_EXCLUIDA = "plataforma"
