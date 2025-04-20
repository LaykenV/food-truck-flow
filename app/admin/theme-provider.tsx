"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
interface AdminThemeProviderProps {
  children: ReactNode
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const pathname = usePathname()
  const forced = pathname === '/' 
    ? 'dark'        // landing page locked dark
    : pathname.startsWith('/admin')
      ? undefined   // admin uses normal toggle
      : 'light'     // everything else locked light


  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem forcedTheme={forced}>
      {children}
    </ThemeProvider>
  )
} 