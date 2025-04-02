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
      <AdminThemeProvider>
        <SidebarProvider>
          <AdminSidebar />  
          <SidebarInset className="bg-admin bg-gradient-to-b from-admin/5 to-admin/10 text-admin-foreground min-h-[100dvh]">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto pb-16 transition-all duration-200">
              <div className="container mx-auto px-3 py-4 sm:px-4 md:px-6 md:py-6">
                {children}
              </div>
            </main>
          </SidebarInset>
          <Toaster />
        </SidebarProvider>
      </AdminThemeProvider>
    </QueryClientProvider>
  )
} 