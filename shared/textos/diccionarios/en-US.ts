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

  auth: {
    errores: {
      correo: "Enter a valid email",
      contrasenaCorta: "Your password needs at least 8 characters",
      escribeLaActual: "Type the password you signed in with",
      minimo12: "At least 12 characters",
      noCoinciden: "The two passwords don't match",
      distintaDeLaDada: "Pick one that isn't the password you were given",
    },

    login: {
      enLinea: "Online",
      tituloBarberia: "Sign in to your shop",
      tituloGlobal: "Admin panel",
      descripcionBarberia:
        "With your email and password. The same email can work at more than one shop: the door decides which one you walk into.",
      descripcionGlobal: "Welcome back. Your shop is waiting.",
      correo: "Email",
      correoPlaceholder: "you@yourshop.com",
      contrasena: "Password",
      mostrar: "Show password",
      ocultar: "Hide password",
      recordarme: "Remember me",
      olvidaste: "Forgot your password?",
      entrar: "Open the panel",
      o: "or",
      google: "Continue with Google",
      sinCuenta: "No account yet?",
      registrarse: "Sign your shop up, free",
      demo: "Demo access",
      demoEntrar: "Go in without credentials",
    },

    selectorBarberia: {
      titulo: "Which shop are you going into?",
      descripcion: "Your account works at several. Pick the one you want to work in right now.",
      atajo: "Sign in from your shop's own address and you skip this step.",
    },

    recuperar: {
      titulo: "Get back in",
      descripcion: "Type the email you sign in with and we'll send a link to pick a new password.",
      enviadoTitulo: "Check your email",
      enviadoDescripcion:
        "If that address has a Barion account, a link to pick a new password is on its way. It expires in two hours and works once.",
      correo: "Email",
      enviar: "Send the link",
      volver: "Back to sign in",
    },

    nuevaContrasena: {
      titulo: "Pick your password",
      descripcion: "The old one stops working the moment you save this.",
      contrasenaNueva: "New password",
      repite: "Type it again",
      minimo: "At least 12 characters.",
      guardar: "Save the password",
      mostrar: "Show the password",
      ocultar: "Hide the password",
      enlaceIncompleto: "This link is incomplete. Ask for a new one and open it from the email.",
      pedirOtro: "Ask for a new link",
    },

    cambioObligatorio: {
      saludo: (nombre: string) => `Hi, ${nombre}`,
      tituloSinNombre: "Pick your password",
      descripcion:
        "You signed in with a password someone else set. Pick your own to carry on: the panel stays closed until you do.",
      actual: "Current password",
      actualPlaceholder: "The one you were given",
      contrasenaNueva: "New password",
      repite: "Type the new one again",
      minimo: "At least 12 characters.",
      mostrar: "Show the password",
      ocultar: "Hide the password",
      guardar: "Save and go in",
    },

    panelMarca: {
      insignia: "Barbershop OS",
      tituloAntes: "The complete digital",
      tituloDestacado: "ecosystem",
      tituloDespues: "for your modern barbershop.",
      descripcion:
        "Appointments, barbers, payroll and clients from a single platform. Simple, fast and premium.",
      beneficios: {
        citas: { etiqueta: "Smart booking", descripcion: "Book, move and confirm" },
        clientes: { etiqueta: "Client management", descripcion: "History and loyalty" },
        estadisticas: { etiqueta: "Live analytics", descripcion: "The numbers that matter" },
        qr: { etiqueta: "QR sign-up", descripcion: "Clients with no friction" },
      },
      cifras: {
        barberias: "Active shops",
        citas: "Appointments/week",
        uptime: "Uptime",
      },
    },
  },
}
