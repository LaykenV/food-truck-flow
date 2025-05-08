import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { handleAuthCallback } from "@/app/actions";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  console.log("redirectTo", redirectTo);
  console.log("origin", origin);
  console.log("code", code);
  console.log("requestUrl", requestUrl);

  if (code) {
    console.log("code", code);
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // Create a food truck for the user if they don't have one
    await handleAuthCallback();
  }

  if (redirectTo) {
    console.log("redirectTo", redirectTo);
    console.log("origin", origin);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  console.log("redirecting to", `${origin}/admin`);
  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/admin`);
}
