import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@shared/components/ui/tooltip"
import { Toaster } from "@shared/components/ui/sonner"
import { TenantProvider } from "@shared/providers/TenantProvider"
import { ThemeProvider } from "@shared/providers/ThemeProvider"
import "@/style/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Barion — Barbershop Management Platform",
  description:
    "The complete digital ecosystem for modern barbershops. Manage appointments, staff, payroll and clients in one place.",
  icons: {
    // Favicon según el tema del navegador; apple-touch-icon en PNG (iOS no soporta webp)
    icon: [
      { url: "/barion-icon-light.webp", media: "(prefers-color-scheme: light)" },
      { url: "/barion-icon-dark.webp", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/barion-icon-light.webp",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
}

// El tema lo controla next-themes (clase en <html>); los tokens viven en style/globals.css.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className="bg-background"
      style={{ fontFamily: inter.style.fontFamily }}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TenantProvider>
            {/* Sin proveedor de textos: el idioma vive en un store y el
                traductor se construye donde se usa (`shared/textos/useTextos`).
                Un contexto aquí solo serviría para volver a publicar lo que el
                store ya publica. */}
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="top-right" />
          </TenantProvider>
        </ThemeProvider>
        {/* Decide ella si se carga: fuera de producción no, y en las rutas
            donde se teclea una tarjeta tampoco. */}
      </body>
    </html>
  )
}
