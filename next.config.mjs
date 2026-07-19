/** @type {import('next').NextConfig} */

// next.config corre en Node al arrancar — no puede importar config/env.ts (TS del app).
// Todo valor configurable entra por variable de entorno, con default seguro.
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Acceso en dev a través del proxy — sin esto Next bloquea el HMR y los assets de dev.
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
}

export default nextConfig
