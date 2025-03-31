"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

export async function resetPasswordAction(formData: FormData) {
  try {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    // Validate inputs
    if (!password || !confirmPassword) {
      return { 
        status: "error", 
        message: "Password and confirm password are required" 
      };
    }
    
    if (password !== confirmPassword) {
      return { 
        status: "error", 
        message: "Passwords do not match" 
      };
    }
    
    // Update password in Supabase
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { 
        status: "error", 
        message: "Not authenticated" 
      };
    }
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) {
      return { 
        status: "error", 
        message: error.message 
      };
    }
    
    // Invalidate any relevant cache
    revalidateTag(`user:${user.id}`);
    
    return { 
      status: "success", 
      message: "Password updated successfully" 
    };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { 
      status: "error", 
      message: error.message || "An unexpected error occurred" 
    };
  }
} 