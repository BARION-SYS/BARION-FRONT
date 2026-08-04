/** @type {import('next').NextConfig} */

// next.config corre en Node al arrancar — no puede importar config/env.ts (TS del app).
// Todo valor configurable entra por variable de entorno, con default seguro.
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const esDesarrollo = process.env.NODE_ENV !== "production"

// El origen de la api sale de la MISMA variable que usa el navegador para
// llamarla. Cablearlo aquí a mano sería una segunda verdad: el día que la api
// cambie de dominio, la política la bloquearía y el síntoma sería «el panel no
// carga nada» sin un solo error de red que lo explique.
const origenApi = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin
  } catch {
    return null
  }
})()

// Wompi tokeniza la tarjeta en SU dominio, desde el navegador: el número no pasa
// nunca por Barion. Por eso los dos ambientes van en `connect-src` y en nada
// más — no se carga ningún script suyo ni se abre ningún iframe, son dos fetch.
const ORIGENES_WOMPI = ["https://sandbox.wompi.co", "https://production.wompi.co"]

// Política de seguridad de contenido.
//
// Dos permisos amplios, y conviene saber por qué están antes de intentar
// quitarlos:
//
// - `style-src 'unsafe-inline'`: `TenantProvider` inyecta un <style> con los
//   colores de la barbería, y `motion` escribe estilos en línea en cada
//   fotograma. Sin esto, el panel se pinta sin marca y sin animaciones.
// - `script-src 'unsafe-inline'`: Next arranca con scripts en línea sin nonce.
//   Quitarlo exige generar un nonce por petición desde un `middleware.ts`, lo
//   que además vuelve dinámica toda página que lo use. Es la mejora pendiente,
//   no un descuido: mientras esté, la CSP no frena la inyección de un <script>
//   en línea, pero sí frena traerse código de otro dominio y sí frena exfiltrar
//   datos a un tercero, que es lo que protege una pantalla de pago.
const cspDirectivas = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  // Nadie mete el panel en un iframe: ni el sitio público, ni un tercero.
  "frame-ancestors": ["'none'"],
  "frame-src": ["'none'"],
  "form-action": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", ...(esDesarrollo ? ["'unsafe-eval'"] : [])],
  "style-src": ["'self'", "'unsafe-inline'"],
  // `next/font` sirve las fuentes desde este mismo origen: no hace falta abrir
  // Google Fonts.
  "font-src": ["'self'", "data:"],
  // El logotipo de cada barbería lo sirve quien lo aloje, así que las imágenes
  // se dejan abiertas a https. Es la directiva de menor riesgo: una imagen no
  // ejecuta nada.
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "connect-src": [
    "'self'",
    ...(origenApi ? [origenApi] : []),
    ...ORIGENES_WOMPI,
    // HMR de Turbopack. En producción no se abre ningún websocket.
    ...(esDesarrollo ? ["ws:", "wss:"] : []),
  ],
  // PWA: el service worker y el manifiesto son de este origen.
  "worker-src": ["'self'"],
  "manifest-src": ["'self'"],
}

const csp = Object.entries(cspDirectivas)
  .map(([directiva, valores]) => `${directiva} ${valores.join(" ")}`)
  .join("; ")

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Acceso en dev a través del proxy — sin esto Next bloquea el HMR y los assets de dev.
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  async headers() {
    return [
      {
        // Todo el panel. No se acota a una ruta: una política que solo cubre la
        // pantalla de pago deja fuera justo la sesión con la que se llega a ella.
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // El navegador no adivina el tipo de una respuesta: un JSON servido
          // como HTML deja de poder ejecutarse.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // La api pública del tenant no tiene por qué recibir la URL completa
          // desde la que se llegó — puede llevar identificadores en la ruta.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // El panel no usa cámara, micrófono ni ubicación. Escanear un QR es
          // cosa de la cámara del teléfono, fuera de la aplicación.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
