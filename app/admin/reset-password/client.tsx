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
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton disabled={resetPasswordMutation.isPending}>
        {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
      </SubmitButton>
      {formError && (
        <div className="mt-2 text-sm text-red-500">
          {formError}
        </div>
      )}
    </form>
  );
} 