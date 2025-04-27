# Plan for Implementing Live Preview Updates and Reset Functionality

**Goal:** Modify the configuration interface so that changes made in `UnifiedConfigForm` are immediately reflected in `UnifiedLivePreview` without requiring a save action. Add a "Reset" button to revert unsaved changes.

**Context:** The application uses a `ConfigProvider` (`app/components/UnifiedConfigProvider.tsx`) to manage the shared configuration state (`config`) and provides a `setConfig` function to update it. `UnifiedConfigWrapper` (`app/components/UnifiedConfigWrapper.tsx`) currently uses local state (`localConfig`) which delays updates to the preview. `UnifiedConfigForm` (`app/components/UnifiedConfigForm.tsx`) handles user input and saving. `UnifiedLivePreview` (`app/components/UnifiedLivePreview.tsx`) displays the preview based on the config it receives.

**Steps:**

1.  **Modify `UnifiedConfigForm` to Update Context Directly:**
    *   **Consume `setConfig`:** Get the `setConfig` function from the `useConfig()` hook.
    *   **Update on Change:** Modify `handleInputChange`, `handleFileSelect`, `handleSaveCrop`, `handleModelGenerated`, and color picker change handlers. In addition to updating the local `formValues` state, these handlers should *immediately* call the `setConfig` function from the context with the newly formed configuration object.
    *   **(Optional but Recommended) Debounce Input Updates:** For text inputs (`handleInputChange`), wrap the `setConfig` call in a debounce function (e.g., using `lodash.debounce` or a custom hook) with a delay of ~300ms. This prevents excessive context updates and re-renders while typing. File/color changes can update immediately.
    *   **Manage Original State for Reset:**
        *   Introduce a new state variable, perhaps `originalConfig`, initialized with the `initialConfig` prop.
        *   Update `originalConfig` *only* when the `initialConfig` prop *actually* changes (e.g., after a successful save from the parent). Use `useEffect` with a deep comparison or track the prop reference.
        *   Do *not* update `originalConfig` during regular form input changes.

2.  **Simplify `UnifiedConfigWrapper`:**
    *   **Remove `localConfig`:** Eliminate the `localConfig` state variable. The form will now directly update the context, making this local state redundant and a source of outdated information for the preview.
    *   **Remove `handleConfigUpdate`:** This function is no longer needed as the form updates the context directly.
    *   **Pass Context Config:** Ensure that `UnifiedLivePreview` (in both mobile and desktop views) receives its configuration directly from the `useConfig()` hook *within* `UnifiedLivePreview` itself, rather than relying on props passed from the wrapper.

3.  **Modify `UnifiedLivePreview` to Use Context:**
    *   **Remove `config` Prop:** Remove the `config: FoodTruckConfig` prop from `LivePreviewProps`.
    *   **Consume Context:** Inside the `UnifiedLivePreview` component, use the `useConfig()` hook to get the `config` object directly from the context.
    *   **Update Dependencies:** Ensure `useEffect` and `useMemo` hooks (like `templateKey`) within `UnifiedLivePreview` depend on the `config` obtained from the context.

4.  **Implement "Reset" Button in `UnifiedConfigForm`:**
    *   **Add Button:** Add a "Reset Changes" button to the form UI (e.g., in the `CardFooter` or near the "Save" button). Style appropriately (e.g., secondary/outline variant).
    *   **Implement `handleReset` Function:**
        *   Create a `handleReset` function triggered by the button's `onClick`.
        *   **(Optional) Confirmation:** Consider adding a `window.confirm` dialog to prevent accidental resets.
        *   **Revert State:** Inside `handleReset`:
            *   Set `formValues` back to the stored `originalConfig`.
            *   Call `setContextConfig(originalConfig)` to update the shared context and the live preview.
            *   Revoke any blob URLs stored in `stagedImages` using `revokeFilePreview`.
            *   Clear the `stagedImages` state array (`setStagedImages([])`).
            *   Provide user feedback (e.g., `toast.info('Changes reset to last saved state.')`).
        *   **Disable Button:** Disable the Reset button if there are no unsaved changes (i.e., if `formValues` deeply equals `originalConfig`).

5.  **Adjust Save Logic (`handleSubmitChanges` in `UnifiedConfigForm`):**
    *   The primary logic remains: upload staged images, then call `onSave` (if provided).
    *   **Update `originalConfig` on Success:** Ensure that after a successful save operation initiated by the parent (which updates `initialConfig`), the `useEffect` watching `initialConfig` correctly updates the `originalConfig` state within the form to match the newly saved state.

**File Checklist:**

*   [ ] `app/components/UnifiedConfigProvider.tsx` (No changes needed, just understanding its role)
*   [ ] `app/components/UnifiedConfigWrapper.tsx` (Remove `localConfig`, `handleConfigUpdate`; adjust preview props)
*   [ ] `app/components/UnifiedConfigForm.tsx` (Update change handlers, add Reset button/logic, store `originalConfig`, optionally debounce)
*   [ ] `app/components/UnifiedLivePreview.tsx` (Remove `config` prop, use `useConfig()` hook)
*   [ ] `app/admin/config/client.tsx` (Ensure `initialConfig` updates correctly post-save)

This plan leverages the existing context provider for efficient state sharing, enabling the desired live updates and simplifying the wrapper component.
