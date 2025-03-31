import AccountClient from "./client";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function AccountPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      <AccountClient />
    </div>
  );
} 