# Authentication Flow Update Plan

This document outlines the plan to address issues in the email/password sign-in and sign-up flow.

## Issues to Address:

1.  **Modal Messages:** Display success (e.g., "Please check your email") and error messages directly within the authentication modal instead of redirecting.
2.  **RLS Violation on Email/Password Sign-up:** Prevent the Row Level Security policy violation when creating a food truck for users signing up with email and password.

## Plan:

1.  **Modify Server Actions (`app/actions.ts`):**
    *   **`signUpAction`:**
        *   On success or error, return a JSON object (e.g., `{ status: 'success', message: '...' }` or `{ status: 'error', message: '...' }`) instead of using `encodedRedirect`.
    *   **`signInAction`:**
        *   On error, return a JSON object (e.g., `{ status: 'error', message: '...' }`) instead of `encodedRedirect`.
        *   Successful sign-in can continue to redirect to `/admin`.
    *   **RLS Issue - `createFoodTruckForUser` Call:**
        *   **Problem:** The RLS violation likely occurs because `createFoodTruckForUser` is called in `signUpAction` *before* the user's email is verified and a session is fully established.
        *   **Solution:** Relocate the `createFoodTruckForUser` call for email/password sign-ups from `signUpAction` to the `app/auth/callback/route.ts` handler. This ensures the function is called *after* email verification and session establishment, mirroring the OAuth flow where `createFoodTruckForUser` is handled by `handleAuthCallback` post-authentication.

2.  **Update Client-Side Modal Handling (`components/auth-modals.tsx`):**
    *   **`SignInForm` and `SignUpForm`:**
        *   Adapt these forms to process the JSON responses from the modified `signInAction` and `signUpAction`.
        *   Utilize `useState` to manage and render success or error messages directly within the modal components.
        *   If using Next.js Server Actions directly in the `form`'s `action` prop, ensure the component correctly re-renders to display the messages passed back from the action. The `useFormState` hook from `react-dom` might be beneficial here.

3.  **Update Email Verification Callback (`app/auth/callback/route.ts`):**
    *   Verify that this route properly triggers food truck creation after a user successfully verifies their email (for those who signed up using email/password).
    *   This will likely involve calling `handleAuthCallback` (or a similar function) from `app/actions.ts` which in turn calls `createFoodTruckForUser` once Supabase confirms email verification and establishes a session.

This plan aims to:
- Enhance user experience by providing immediate feedback within the modals.
- Resolve the RLS issue by standardizing the timing of food truck creation for all sign-up methods.
