"use client"
import React from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = React.useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AdminSidebar />  
        <SidebarInset>
          <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  )
} 