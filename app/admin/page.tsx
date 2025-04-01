import { SidebarTrigger } from "@/components/ui/sidebar";
import AdminDashboardClient from "./client";

// Server component that just renders the header and client component
export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      {/* Client component handles all data fetching */}
      <AdminDashboardClient />
    </div>
  )
}
