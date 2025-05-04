import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // First, handle subdomain routing
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Check if we're on localhost for development
  const isLocalhost = hostname.includes('localhost');
  
  // For localhost development, we need to handle subdomains differently
  if (isLocalhost) {
    // If the path starts with a known route like /admin, /api, etc., don't treat it as a subdomain
    if (url.pathname.startsWith('/admin') || 
        url.pathname.startsWith('/api') || 
        url.pathname === '/' ||
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/sign-in')) {
      // Continue with session management
      return await updateSession(request);
    }
    
    // Extract the first path segment as potential subdomain
    const pathParts = url.pathname.split('/');
    if (pathParts.length > 1) {
      const potentialSubdomain = pathParts[1];
      
      // If this is already a [subdomain] route, just continue with session management
      if (url.pathname.startsWith(`/${potentialSubdomain}`) && pathParts.length > 2) {
        return await updateSession(request);
      }
    }
    
    // Continue with session management for all other cases
    return await updateSession(request);
  } else {
    // Production environment with real subdomains
    const host = hostname.split(':')[0];
    const parts = host.split('.');
    console.log("parts", parts);
    
    // Check if we have a subdomain (e.g., mikes-pizza.foodtruckflow.com)
    if (parts.length > 2 && parts[0] !== 'www') {
      const subdomain = parts[0];
      console.log("subdomain", subdomain);
      console.log("url", url.pathname);
      
      // Skip rewriting for admin routes even with subdomain
      /*if (url.pathname.startsWith('/admin') || 
          url.pathname.startsWith('/api') || 
          url.pathname.startsWith('/_next') ||
          url.pathname.startsWith('/sign-in') ||
          url.pathname.startsWith('/auth/callback') ||
          url.pathname === '/') {
        console.log("skipping rewrite");
        return await updateSession(request);
      }*/
      
      // Rewrite the URL to the [subdomain] folder
      url.pathname = `/${subdomain}${url.pathname}`;
      console.log("rewritten url", url.pathname);
      // Create a response with the rewritten URL
      const response = NextResponse.rewrite(url);
      
      // Apply session management to the rewritten response
      const sessionResponse = await updateSession(request);
      
      // Copy cookies from session response to our rewrite response
      sessionResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value);
      });
      
      return response;
    }
    
    // No subdomain, proceed with session management
    return await updateSession(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

