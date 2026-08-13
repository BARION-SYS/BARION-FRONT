import type { Diccionario } from "@shared/textos/diccionarios/es-CO"

/**
 * El inglés, declarado con el tipo del diccionario base: **una clave que falte
 * no compila**, que es la única forma de que una pantalla no aparezca a medio
 * traducir delante de alguien que no habla español.
 *
 * Las frases con dato adentro son funciones por eso mismo: aquí el orden de las
 * palabras no es el del español, y una frase partida en trozos no se puede
 * recolocar.
 */
export const enUS: Diccionario = {
  comun: {
    buscar: "Search",
    buscarPlaceholder: "Search...",
    cancelar: "Cancel",
    cerrarSesion: "Sign out",
  },

  idioma: {
    boton: "Language",
    cambiar: "Change language",
    automatico: "Same as the shop",
  },

  tema: {
    boton: "Theme",
    cambiar: "Change theme",
    claro: "Light",
    oscuro: "Dark",
    sistema: "System",
  },

  marca: {
    boton: "Panel colors",
    aplicar: "Apply",
    restablecer: "Reset",
    colorPrimario: "Primary color",
    colorFondo: "Background color",
    elegirPrimario: "Pick a custom primary color",
    elegirFondo: "Pick a custom background color",
    actualizados: "Colors updated",
  },

  navegacion: {
    abrirMenu: "Open menu",
    cerrarMenu: "Close menu",
    principal: "Main navigation",
    secciones: "Sections",
    expandir: "Expand sidebar",
    colapsar: "Collapse sidebar",

    grupos: {
      principal: "Main",
      operacion: "Operations",
      finanzas: "Finance",
      herramientas: "Tools",
      "admin-principal": "Platform",
      "admin-herramientas": "Your account",
    },

    rutas: {
      dashboard: {
        etiqueta: "Dashboard",
        titulo: "Dashboard",
        subtitulo: "How your shop is doing today",
      },
      citas: {
        etiqueta: "Appointments",
        titulo: "Appointments",
        subtitulo: "Bookings and calendar",
      },
      personas: {
        etiqueta: "People",
        titulo: "People",
        subtitulo: "Who works here: who signs in, who takes clients, and with what permissions",
      },
      servicios: {
        etiqueta: "Services",
        titulo: "Services",
        subtitulo: "Your menu: what you offer, how long it takes and what it costs",
      },
      sedes: {
        etiqueta: "Locations",
        titulo: "Locations",
        subtitulo: "Where the shop operates, with its hours and closures",
      },
      clientes: {
        etiqueta: "Clients",
        titulo: "Clients",
        subtitulo: "Client base and loyalty",
      },
      nomina: {
        etiqueta: "Payroll",
        titulo: "Payroll",
        subtitulo: "Commissions, tips and production",
      },
      estadisticas: {
        etiqueta: "Analytics",
        titulo: "Analytics",
        subtitulo: "Business metrics and trends",
      },
      "mi-perfil": {
        etiqueta: "My profile",
        titulo: "My profile",
        subtitulo: "When you work and what you offer",
      },
      qr: {
        etiqueta: "QR code",
        titulo: "QR code",
        subtitulo: "How clients sign up and book",
      },
      notificaciones: {
        etiqueta: "Notifications",
        titulo: "Notifications",
        subtitulo: "What has happened in your shop",
      },
      configuracion: {
        etiqueta: "Settings",
        titulo: "Settings",
        subtitulo: "Make the shop yours",
      },
      admin: {
        etiqueta: "Overview",
        titulo: "Platform overview",
        subtitulo: "How many shops there are, in what state and where they operate",
      },
      "admin-barberias": {
        etiqueta: "Shops",
        titulo: "Shops",
        subtitulo: "Sign-up, profile, state and plan of every customer",
      },
      "admin-planes": {
        etiqueta: "Plans",
        titulo: "Plans",
        subtitulo: "What is sold: limits, features and price per country",
      },
      "admin-suscripciones": {
        etiqueta: "Subscriptions",
        titulo: "Subscriptions",
        subtitulo: "What each shop has bought and how long it lasts",
      },
      "admin-mercados": {
        etiqueta: "Markets",
        titulo: "Markets",
        subtitulo: "Where Barion operates and with what tax it invoices",
      },
      "admin-staff": {
        etiqueta: "Barion team",
        titulo: "Barion team",
        subtitulo: "Who can sign in to the platform, and with what email",
      },
      "admin-cuenta": {
        etiqueta: "My account",
        titulo: "My account",
        subtitulo: "Your password and how you sign in",
      },
    },
  },

  navbar: {
    sedeActiva: (nombre: string) => `Current location: ${nombre}`,
    notificaciones: "Notifications",
    sinLeer: (cuantas: number) =>
      cuantas === 1 ? "Notifications, 1 unread" : `Notifications, ${cuantas} unread`,
    marcarTodas: "Mark all as read",
    sinNotificaciones: "Nothing here yet",
    menuUsuario: (nombre: string, rol: string) => `User menu: ${nombre}, ${rol}`,
    staffPlataforma: "Barion staff",
    miPerfil: "My profile",
    miAgenda: "My schedule",
    configuracion: "Settings",
  },
}
