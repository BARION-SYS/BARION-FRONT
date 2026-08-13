/**
 * El diccionario BASE. Los otros dos se escriben contra este.
 *
 * ── Por qué es TypeScript y no un `.json` ───────────────────────────────────
 * Porque así el compilador sabe qué claves existen. `en-US` se declara con el
 * tipo de este archivo, de modo que **una clave sin traducir no compila** — y
 * ese es justo el fallo que no se ve al probar: la pantalla no revienta, enseña
 * la palabra en español a alguien que no lo habla. Con JSON habría que
 * inventarse un script que compare las dos listas; con esto lo hace `tsc`.
 *
 * ── Por qué hay funciones dentro ────────────────────────────────────────────
 * Un texto con un dato adentro no se parte en trozos («Sede activa:» + nombre):
 * el orden de las palabras cambia entre idiomas y quien traduce necesita ver la
 * frase entera. Una función recibe el dato y devuelve la frase, así que el
 * inglés puede colocarlo donde le corresponde. Los plurales van igual — un `if`
 * dentro de la función, que es lo que este dominio necesita; no hace falta ICU
 * para «1 sin leer / N sin leer».
 *
 * ── Lo que NO va aquí ───────────────────────────────────────────────────────
 * Nada que salga de la api: los nombres de servicios, de sedes o de personas son
 * datos de la barbería y se enseñan tal cual llegan. Traducir un dato es
 * inventárselo.
 */
export const esCO = {
  comun: {
    buscar: "Buscar",
    buscarPlaceholder: "Buscar...",
    cancelar: "Cancelar",
    cerrarSesion: "Cerrar sesión",
  },

  idioma: {
    boton: "Idioma",
    cambiar: "Cambiar idioma",
    /** Lo que hace todo el mundo mientras no elija: seguir a su mercado. */
    automatico: "El de la barbería",
  },

  tema: {
    boton: "Tema",
    cambiar: "Cambiar tema",
    claro: "Claro",
    oscuro: "Oscuro",
    sistema: "Sistema",
  },

  marca: {
    boton: "Colores del panel",
    aplicar: "Aplicar",
    restablecer: "Restablecer",
    colorPrimario: "Color primario",
    colorFondo: "Color de fondo",
    elegirPrimario: "Elegir un color primario personalizado",
    elegirFondo: "Elegir un color de fondo personalizado",
    actualizados: "Colores actualizados",
  },

  navegacion: {
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    principal: "Navegación principal",
    secciones: "Secciones",
    expandir: "Expandir barra lateral",
    colapsar: "Colapsar barra lateral",

    /** Los rótulos de grupo del sidebar. El área de plataforma tiene los suyos. */
    grupos: {
      principal: "Principal",
      operacion: "Operación",
      finanzas: "Finanzas",
      herramientas: "Herramientas",
      "admin-principal": "Plataforma",
      "admin-herramientas": "Tu cuenta",
    },

    /**
     * Cada entrada de navegación, indexada por la `clave` de la ruta.
     *
     * El texto salió de `routes/`, que es donde estaba escrito en español: una
     * ruta es dónde se va y con qué permiso, no cómo se llama en cada idioma.
     */
    rutas: {
      dashboard: {
        etiqueta: "Dashboard",
        titulo: "Dashboard",
        subtitulo: "Resumen general de tu barbería",
      },
      citas: {
        etiqueta: "Citas",
        titulo: "Citas",
        subtitulo: "Gestión de citas y calendario",
      },
      personas: {
        etiqueta: "Personas",
        titulo: "Personas",
        subtitulo: "Quién trabaja en la barbería: quién entra, quién atiende y con qué permisos",
      },
      servicios: {
        etiqueta: "Servicios",
        titulo: "Servicios",
        subtitulo: "El catálogo de la barbería: qué se ofrece, cuánto dura y entre qué precios",
      },
      sedes: {
        etiqueta: "Sedes",
        titulo: "Sedes",
        subtitulo: "Dónde opera la barbería, con su horario y sus cierres",
      },
      clientes: {
        etiqueta: "Clientes",
        titulo: "Clientes",
        subtitulo: "Base de clientes y fidelización",
      },
      nomina: {
        etiqueta: "Nómina",
        titulo: "Nómina",
        subtitulo: "Comisiones, propinas y producción",
      },
      estadisticas: {
        etiqueta: "Estadísticas",
        titulo: "Estadísticas",
        subtitulo: "Análisis y métricas de negocio",
      },
      "mi-perfil": {
        etiqueta: "Mi perfil",
        titulo: "Mi perfil",
        subtitulo: "Cuándo trabajas y qué ofreces",
      },
      qr: {
        etiqueta: "Código QR",
        titulo: "Código QR",
        subtitulo: "Registro y acceso de clientes",
      },
      notificaciones: {
        etiqueta: "Notificaciones",
        titulo: "Notificaciones",
        subtitulo: "Lo que ha pasado en tu barbería",
      },
      configuracion: {
        etiqueta: "Configuración",
        titulo: "Configuración",
        subtitulo: "Personalización de tu barbería",
      },
      admin: {
        etiqueta: "Resumen",
        titulo: "Resumen de la plataforma",
        subtitulo: "Cuántas barberías hay, en qué estado y dónde operan",
      },
      "admin-barberias": {
        etiqueta: "Barberías",
        titulo: "Barberías",
        subtitulo: "Alta, ficha, estado y plan de cada cliente",
      },
      "admin-planes": {
        etiqueta: "Planes",
        titulo: "Planes",
        subtitulo: "Qué se vende: límites, funciones y precio por país",
      },
      "admin-suscripciones": {
        etiqueta: "Suscripciones",
        titulo: "Suscripciones",
        subtitulo: "Qué tiene contratado cada barbería y hasta cuándo le vale",
      },
      "admin-mercados": {
        etiqueta: "Mercados",
        titulo: "Mercados",
        subtitulo: "Dónde se opera y con qué impuesto se factura",
      },
      "admin-staff": {
        etiqueta: "Equipo de Barion",
        titulo: "Equipo de Barion",
        subtitulo: "Quién puede entrar a la plataforma y con qué correo",
      },
      "admin-cuenta": {
        etiqueta: "Mi cuenta",
        titulo: "Mi cuenta",
        subtitulo: "Tu contraseña y con qué entras",
      },
    },
  },

  navbar: {
    sedeActiva: (nombre: string) => `Sede activa: ${nombre}`,
    notificaciones: "Notificaciones",
    sinLeer: (cuantas: number) =>
      cuantas === 1 ? "Notificaciones, 1 sin leer" : `Notificaciones, ${cuantas} sin leer`,
    marcarTodas: "Marcar todas como leídas",
    sinNotificaciones: "Sin notificaciones",
    menuUsuario: (nombre: string, rol: string) => `Menú de usuario: ${nombre}, ${rol}`,
    /** La sesión de plataforma no tiene rol en ninguna barbería: se nombra por lo que es. */
    staffPlataforma: "Staff de Barion",
    miPerfil: "Mi perfil",
    miAgenda: "Mi agenda",
    configuracion: "Configuración",
  },
}

/**
 * La forma que los tres diccionarios comparten. `en-US` la declara y el
 * compilador exige que esté completo.
 */
export type Diccionario = typeof esCO
