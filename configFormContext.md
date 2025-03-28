# Refactoring Plan: Simplify Configuration System & Implement Supabase Image Storage

**Goal:** Refactor the configuration system to remove client-side landing page preview functionality, simplify the state management, and replace base64 image storage with Supabase Storage URLs.

**Context Files for Agent:**

*   `app/components/UnifiedConfigProvider.tsx`
*   `app/components/UnifiedConfigWrapper.tsx`
*   `app/components/UnifiedConfigForm.tsx`
*   `app/components/UnifiedLivePreview.tsx`
*   `app/page.tsx`
*   `components/auth-modals-with-config.tsx`
*   `app/actions.ts`
*   `utils/config-utils.ts` (or wherever `getDefaultConfig` is defined)
*   `app/admin/config/page.tsx`
*   `app/admin/config/client.tsx`
*   `.cursor/config-and-template-system.md`
*   `app/admin/menus/page.tsx` (for reference on Supabase upload implementation)
*   `utils/storage-utils.ts` (if it exists, otherwise create it)
*   `types/index.ts` (or wherever `FoodTruckConfig` type is defined)

---

**Phase 1: Simplification & Removal of Client-Side Logic**

1.  **Consolidate Default Config:**
    *   **Action:** Locate the primary `getDefaultConfig` function (check `app/admin/config/page.tsx` for its import). Ensure it's comprehensive.
    *   **Files:** `utils/config-utils.ts` (or similar), `app/components/UnifiedConfigProvider.tsx`, `app/actions.ts`.
    *   **Details:** Remove default config objects from `UnifiedConfigProvider.tsx` and `actions.ts`. Update `createFoodTruckForUser` in `actions.ts` and any other necessary places to import and use the single `getDefaultConfig`.

2.  **Remove 'Client' Mode:**
    *   **Action:** Eliminate the dual 'admin'/'client' mode functionality.
    *   **Files:** `app/components/UnifiedConfigProvider.tsx`, `app/components/UnifiedConfigWrapper.tsx`, `app/components/UnifiedConfigForm.tsx`, `app/components/UnifiedLivePreview.tsx`.
    *   **Details:** Remove the `mode` prop, conditional logic checking `mode`, and related types (`FormMode`, `PreviewMode`, `WrapperMode`, `ConfigMode`). Assume 'admin' mode implicitly.

3.  **Remove Local Storage:**
    *   **Action:** Delete all interactions with `localStorage`.
    *   **Files:** `app/components/UnifiedConfigProvider.tsx`.
    *   **Details:** Remove `useEffect` hooks and logic within `setConfig`/`updateConfig` that read/write to `localStorage`. Remove the `isInitialized` state.

4.  **Simplify Context:**
    *   **Action:** Streamline the `UnifiedConfigContext`.
    *   **Files:** `app/components/UnifiedConfigProvider.tsx`.
    *   **Details:** Remove client-only state/values (`jsonError`, `setJsonError`). Decide if `updateConfig` is still needed for admin real-time preview updates; if not, remove it. Remove the `useConfig` and `useAdminConfig` hooks. Rename `useUnifiedConfig` if needed, or keep it as the single hook. Ensure the provider only provides necessary values for the admin context (`config`, `setConfig`, `saveConfig`, `isSaving`).

5.  **Remove Landing Page Preview:**
    *   **Action:** Remove the interactive configuration preview section from the main landing page.
    *   **Files:** `app/page.tsx`.
    *   **Details:** Delete the entire `<section id="preview">...</section>` containing `<ClientWrapper />`. Remove the top-level `<UnifiedConfigProvider>` wrapping the `Home` component.

6.  **Remove Config from Auth Flow:**
    *   **Action:** Decouple the initial configuration state from the sign-up/sign-in process. Users will always get a default config upon creation.
    *   **Files:** `components/auth-modals-with-config.tsx`, `app/actions.ts`.
    *   **Details:**
        *   In `AuthModalsWithConfig`, remove `useConfig`, the `config` prop, and passing `config` data in form submissions.
        *   In `actions.ts`, remove `configString`/`config` parsing from `signInAction` and `signUpAction`. Remove the `userConfig` parameter from `createFoodTruckForUser` and ensure it *always* uses the consolidated default config. Update calls to `createFoodTruckForUser` accordingly.

**Phase 2: Implement Supabase Storage for Images**

7.  **Supabase Buckets Setup:**
    *   **Action:** Ensure required Supabase Storage buckets exist and have correct policies.
    *   **Details:** Verify buckets: `logo-images`, `hero-images`, `about-images`. Set RLS: Authenticated users can insert, public read access enabled. (This step is configuration, not code).

8.  **Image Upload Logic:**
    *   **Action:** Implement file uploads to Supabase Storage and update config with URLs.
    *   **Files:** `utils/storage-utils.ts` (create or update), `app/components/UnifiedConfigForm.tsx`.
    *   **Details:**
        *   Create/Update `uploadImage(file: File, bucket: string, userId: string): Promise<string | null>` in `utils/storage-utils.ts`. This function should upload the file to the specified bucket under a unique path (e.g., `${userId}/${Date.now()}-${file.name}`), handle Supabase errors, and return the public URL. Reference `app/admin/menus/page.tsx` for existing patterns if helpful.
        *   Modify `handleFileUpload` in `UnifiedConfigForm.tsx`.
            *   Remove base64 logic.
            *   Get `userId` from props.
            *   Determine `bucket` based on `fieldName`.
            *   Call `uploadImage`, managing loading state and using `toast` for feedback.
            *   On success, update `formValues` state (`logo`, `heroImage`, `aboutImage`) with the returned URL.

9.  **Data Saving:**
    *   **Action:** Confirm image URLs are saved correctly to the database.
    *   **Files:** `app/admin/config/client.tsx`, `utils/config-utils.ts`.
    *   **Details:** Ensure `handleSaveConfig` in `AdminConfigClient` passes the `FoodTruckConfig` (now containing URLs) to the `saveConfiguration` utility. Verify `saveConfiguration` saves the object with URLs.

**Phase 3: Review & Refine**

10. **Admin Config Page Verification:**
    *   **Action:** Ensure the admin configuration page works correctly with the refactored system.
    *   **Files:** `app/admin/config/page.tsx`, `app/admin/config/client.tsx`.
    *   **Details:** Confirm server-side fetching, `initialConfig` passing, client state initialization, and saving work as expected.

11. **Update Types:**
    *   **Action:** Update TypeScript types to reflect URL strings for images.
    *   **Files:** `types/index.ts` (or wherever `FoodTruckConfig` is defined), `.cursor/config-and-template-system.md`.
    *   **Details:** Change `logo`, `hero.image`, and `about.image` types to `string` (or `string | undefined` / `string | null`).
