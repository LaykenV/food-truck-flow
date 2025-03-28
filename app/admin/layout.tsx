import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log("user", user);
  // Fetch food truck data
  const { data: foodTruck } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  
  const foodTruckName = foodTruck?.configuration?.name || "Food Truck";
  
  return (
    <SidebarProvider>
      <AdminSidebar foodTruckName={foodTruckName} />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
} 