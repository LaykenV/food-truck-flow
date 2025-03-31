import { SidebarTrigger } from "@/components/ui/sidebar";
import SettingsClient from "./client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      <SettingsClient />
    </div>
  );
} 