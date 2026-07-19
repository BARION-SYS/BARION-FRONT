"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// Tema claro/oscuro vía clase en <html>; los tokens viven en style/globals.css.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
