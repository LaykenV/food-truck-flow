import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import ResetPasswordClient from "./client";

export default function ResetPassword() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/admin/account">
            <LucideArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
        </Button>
      </div>
      
      <ResetPasswordClient />
    </div>
  );
}
