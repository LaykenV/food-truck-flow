"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFoodTruck } from "@/app/admin/clientQueries";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordAction } from "./actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Function to call the server action
async function resetPassword(data: { password: string, confirmPassword: string }) {
  const formData = new FormData();
  formData.append("password", data.password);
  formData.append("confirmPassword", data.confirmPassword);
  
  const result = await resetPasswordAction(formData);
  
  if (result.status === "error") {
    throw new Error(result.message);
  }
  
  return result;
}

export default function ResetPasswordClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Query to fetch food truck data
  const { data: foodTruck, isLoading } = useQuery({
    queryKey: ['foodTruck'],
    queryFn: getFoodTruck
  });
  
  // Mutation to reset password
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      // Invalidate user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("Password reset successfully");
      
      // Redirect to account page
      router.push("/admin/account");
    },
    onError: (error: Error) => {
      setFormError(error.message);
      toast.error(`Error resetting password: ${error.message}`);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (!password || !confirmPassword) {
      setFormError("Password and confirm password are required");
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    
    resetPasswordMutation.mutate({ password, confirmPassword });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-admin-card-foreground text-xl">Reset Password</CardTitle>
          <CardDescription className="text-admin-muted-foreground">Update your account password</CardDescription>
        </div>
        <div className="h-10 w-10 rounded-full bg-admin-primary/10 flex items-center justify-center">
          <LucideLock className="h-5 w-5 text-admin-primary" />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-admin-card-foreground">New password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Enter new password"
              required
              className="bg-admin-card border-admin-border text-admin-card-foreground focus-visible:ring-admin-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-admin-card-foreground">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
              className="bg-admin-card border-admin-border text-admin-card-foreground focus-visible:ring-admin-ring"
            />
          </div>
          
          {formError && (
            <div className="p-3 bg-admin-destructive/10 border border-admin-destructive text-admin-destructive rounded-md text-sm">
              {formError}
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          asChild
          className="w-full sm:w-auto bg-admin-card hover:bg-admin-secondary text-admin-foreground border-admin-border"
        >
          <Link href="/admin/account">
            Cancel
          </Link>
        </Button>
        
        <Button 
          type="submit"
          form="reset-password-form"
          disabled={resetPasswordMutation.isPending}
          className="w-full sm:w-auto bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Update Password"}
        </Button>
      </CardFooter>
    </Card>
  );
} 