import { supabase } from './supabase';
import { Provider } from '@supabase/supabase-js';

// Define supported OAuth providers
export type SupportedOAuthProvider = 'google' | 'facebook';

// Email/password sign in
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Email/password sign up
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Social login (OAuth)
export async function signInWithOAuth(provider: SupportedOAuthProvider) {
  // Map our supported providers to Supabase Provider type
  const supabaseProvider = provider as Provider;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data;
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Get current user
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Handle auth state change from URL
export async function handleAuthFromUrl() {
  const { data } = await supabase.auth.getSession();
  
  // If we already have a session, no need to parse the URL
  if (data.session) return data.session;
  
  // Otherwise try to get it from the URL
  const hashParams = window.location.hash;
  if (hashParams && hashParams.includes('access_token')) {
    // Use the hash URL to set the session
    await supabase.auth.setSession({
      access_token: extractParamFromHash(hashParams, 'access_token'),
      refresh_token: extractParamFromHash(hashParams, 'refresh_token'),
    });
    
    // Get the newly set session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    return sessionData.session;
  }
  
  return null;
}

// Helper to extract parameters from URL hash
function extractParamFromHash(hash: string, param: string): string {
  const match = hash.match(new RegExp(`${param}=([^&]*)`));
  return match ? match[1] : '';
} 