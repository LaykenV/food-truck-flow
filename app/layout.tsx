import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { AdminThemeProvider } from '@/app/admin/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FoodTruckFlow',
  description: 'B2B SaaS platform for food truck owners',
  icons: {
    icon: '/images/truckIcon.svg',
    shortcut: '/images/truckIcon.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AdminThemeProvider>
          {children}
          <Toaster />
        </AdminThemeProvider>
      </body>
    </html>
  )
}
