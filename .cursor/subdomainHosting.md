# Subdomain Hosting Setup and Workflow

This document explains how subdomain handling is implemented in the FoodTruckFlow application, covering both localhost development and deployed production environments.

## Code Analysis

1.  **`middleware.ts`:**
    *   **Detects Environment:** It correctly identifies whether the request is coming from `localhost` or a production domain (`*.foodtruckflow.com` or a custom domain).
    *   **Localhost Handling (`http://localhost:3000/...`):**
        *   It checks if the URL path starts with specific known routes (`/admin`, `/api`, `/`, `/_next`, `/sign-in`). If so, it bypasses subdomain logic and proceeds directly to `updateSession` for authentication/session management.
        *   For other paths (e.g., `/mikes-pizza/menu`), the current logic primarily calls `updateSession(request)` without rewriting the URL. Next.js routing then naturally picks up the first path segment (`mikes-pizza`) as the `[subdomain]` dynamic parameter for pages within `app/[subdomain]/...`.
    *   **Production Handling (`https://{subdomain}.foodtruckflow.com/...` or custom domain):**
        *   It extracts the hostname (e.g., `mikes-pizza.foodtruckflow.com`).
        *   It splits the hostname by `.` to check if there's a subdomain. If it's a custom domain, it relies on the database query later to match it.
        *   **Subdomain Found:**
            *   Extracts the `subdomain` (e.g., `mikes-pizza`).
            *   Skips rewriting for specific routes (`/admin`, `/api`, `/_next`, `/sign-in`).
            *   For other routes, it **rewrites the URL**. It prepends the extracted `subdomain` to the path: `url.pathname = \`/${subdomain}${url.pathname}\`;`. Example: `mikes-pizza.foodtruckflow.com/menu` is rewritten internally to `/mikes-pizza/menu`.
            *   Creates a `NextResponse.rewrite(url)` with this new internal path.
            *   Calls `updateSession` on the *original* request to handle authentication/session logic.
            *   Copies the session cookies from the `updateSession` response onto the `rewrite` response before returning it. This ensures the user's session is correctly maintained despite the internal rewrite.
        *   **No Subdomain Found / Base Domain:** Proceeds directly to `updateSession`.
    *   **Session Management (`utils/supabase/middleware.ts#updateSession`)**: Handles Supabase authentication, checks user sessions, manages cookies, and performs redirects based on auth status for protected routes (`/admin`, `/`).

2.  **`app/[subdomain]/layout.tsx`:**
    *   Receives the `subdomain` parameter from the URL path (originating either directly from the path on localhost or via the middleware rewrite in production).
    *   Uses `getFoodTruckData(subdomain)` to fetch data specific to that food truck.
    *   Includes logic to handle cases where the food truck isn't found or isn't published (checking against the logged-in user for previews). Shows a 404 (`notFound()`) if no valid data can be retrieved.

3.  **Data Fetching (`lib/fetch-food-truck.ts`, `lib/getFoodTruckByHostname.ts`):**
    *   `getFoodTruckData` acts as a wrapper, potentially caching and calling `getFoodTruckByHostname`.
    *   `getFoodTruckByHostname` takes the `subdomain` parameter.
    *   Queries the `FoodTrucks` table in Supabase using an `OR` condition to match either `subdomain` column OR `custom_domain` column against the input.
    *   Includes a crucial check: If a food truck record is found but its `published` field is `false`, it verifies if the currently authenticated user (`supabase.auth.getUser()`) owns that food truck (`user.data.user?.id === data.id`). If the site isn't published and the viewer isn't the owner, it returns `null`, effectively hiding unpublished sites from the public.

## Workflow Explanation

**Localhost (`http://localhost:3000/{subdomain}/...`):**

1.  Request: `http://localhost:3000/mikes-pizza/menu`
2.  Middleware identifies `localhost`.
3.  Path `/mikes-pizza/menu` doesn't match admin/API routes.
4.  Middleware calls `updateSession` (no rewrite).
5.  `updateSession` handles auth, returns `NextResponse.next()`.
6.  Next.js router matches `/mikes-pizza/menu` to `app/[subdomain]/...`.
7.  `layout.tsx` receives `subdomain: 'mikes-pizza'`.
8.  `getFoodTruckData('mikes-pizza')` fetches data.
9.  Page renders.

**Deployed (`https://{subdomain}.foodtruckflow.com/...`):**

1.  Request: `https://mikes-pizza.foodtruckflow.com/menu`
2.  Middleware identifies production.
3.  Hostname yields `subdomain: 'mikes-pizza'`.
4.  Path `/menu` doesn't match admin/API routes.
5.  Middleware **rewrites** URL path to `/mikes-pizza/menu`.
6.  Middleware calls `updateSession` on the *original* request (`https://mikes-pizza.foodtruckflow.com/menu`) for session cookies.
7.  Middleware creates `NextResponse.rewrite()` pointing to `/mikes-pizza/menu`.
8.  Session cookies are copied to the rewrite response.
9.  Rewrite response is returned.
10. Next.js router internally handles the rewritten path `/mikes-pizza/menu` matching `app/[subdomain]/...`.
11. `layout.tsx` receives `subdomain: 'mikes-pizza'`.
12. `getFoodTruckData('mikes-pizza')` fetches data.
13. Page renders. User sees `https://mikes-pizza.foodtruckflow.com/menu`.

## Correctness

This setup is **correct** for handling both localhost development and deployed subdomain/custom domain hosting.

*   It correctly differentiates environments.
*   It uses the standard `NextResponse.rewrite` technique in production to map domain/subdomain requests to the file-system-based routing (`app/[subdomain]/...`) without altering the user-visible URL.
*   Data fetching correctly uses the subdomain/hostname to query the database, including checks for custom domains and publication status.
*   Session management is correctly integrated with the rewrite process. 