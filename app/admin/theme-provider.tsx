"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
interface AdminThemeProviderProps {
  children: ReactNode
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const pathname = usePathname()
  const forced = typeof window !== 'undefined' && window.location.hostname === 'foodtruckflow.com' && pathname === '/'
    ? 'dark'        // landing page (foodtruckflow.com/) locked dark
    : pathname.startsWith('/admin')
      ? undefined   // admin uses normal toggle
      : 'light'     // everything else locked light


  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem forcedTheme={forced}>
      {children}
    </ThemeProvider>
  )
} 