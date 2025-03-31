import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SubscribeClient from "./client";

export default function SubscribePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/admin/account">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Account
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
        </div>
        <SidebarTrigger className="md:hidden" />
      </div>
      
      <SubscribeClient />
    </div>
  );
} 