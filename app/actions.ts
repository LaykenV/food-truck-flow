"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDefaultConfig } from "@/utils/config-utils";

export const signInWithOAuthAction = async (provider: "google" | "facebook") => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  console.log("origin", origin);

  // Note: Food truck creation happens in the auth callback route
  // after the OAuth flow completes and the user is redirected back to our app
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/", error.message);
  }

  console.log("data", data);

  return redirect(data.url);
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } 
  
  // If sign-up is successful and we have a user, create a food truck for them
  if (data && data.user) {
    await createFoodTruckForUser(data.user.id);
  }
  
  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/admin");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

// Handle OAuth callback and create a food truck if needed
export const handleAuthCallback = async () => {
  const supabase = await createClient();
  
  // Get the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Error getting session:', sessionError);
    return;
  }
  
  // Create a food truck for the user if they don't have one
  if (session.user) {
    await createFoodTruckForUser(session.user.id);
  }
};

// Function to create a food truck for a user
export const createFoodTruckForUser = async (userId: string) => {
  const supabase = await createClient();
  
  // Check if user already has a food truck
  const { data: existingFoodTrucks, error: fetchError } = await supabase
    .from('FoodTrucks')
    .select('id')
    .eq('user_id', userId);
    
  if (fetchError) {
    console.error('Error checking for existing food trucks:', fetchError);
    return { error: fetchError };
  }
  
  // If user already has food trucks, don't create a new one
  if (existingFoodTrucks && existingFoodTrucks.length > 0) {
    return { data: existingFoodTrucks[0], created: false };
  }
  
  // Get default configuration
  const configuration = getDefaultConfig();
  
  // Generate a unique subdomain based on a timestamp
  const timestamp = Date.now().toString(36);
  const subdomain = `foodtruck-${timestamp}`;
  
  // Create a new food truck
  const { data, error } = await supabase
    .from('FoodTrucks')
    .insert([
      {
        user_id: userId,
        subdomain: subdomain,
        custom_domain: null,
        configuration: configuration,
        stripe_customer_id: null,
        stripe_api_key: null,
        published: false
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating food truck:', error);
    return { error };
  }
  
  return { data, created: true };
};
