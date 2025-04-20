"use client"
import React from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminThemeProvider } from './theme-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = React.useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* <AdminThemeProvider> */}
        <SidebarProvider>
          <AdminSidebar />  
          <SidebarInset className="bg-admin-background text-admin-foreground min-h-[100dvh] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] opacity-90 z-0"></div>
            <div className="relative z-10 h-full">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto pb-16 transition-all duration-200">
                <div className="container mx-auto px-3 py-4 sm:px-4 md:px-6 md:py-6">
                  {children}
                </div>
              </main>
            </div>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
      {/* </AdminThemeProvider> */}
    </QueryClientProvider>
  )
} 