"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"

interface AdminThemeProviderProps {
  children: ReactNode
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
} 