import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@shared/components/ui/tooltip"
import { Toaster } from "@shared/components/ui/sonner"
import { TenantProvider } from "@shared/providers/TenantProvider"
import { ThemeProvider } from "@shared/providers/ThemeProvider"
import "@/style/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trimly — Barbershop Management Platform",
  description:
    "The complete digital ecosystem for modern barbershops. Manage appointments, staff, payroll and clients in one place.",
  icons: {
    // SVG ceñido a la marca: se ve grande y nítido en la pestaña; PNG de respaldo
    icon: [{ url: "/trimly-icono.svg", type: "image/svg+xml" }, { url: "/trimly-icono-claro.png" }],
    shortcut: "/trimly-icono.svg",
    apple: "/trimly-icono-claro.png",
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
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="top-right" />
          </TenantProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
