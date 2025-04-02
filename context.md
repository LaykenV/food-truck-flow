# Plan: Implement Scoped Theming for /admin Route Group

This plan outlines the steps to implement light/dark mode and a custom color scheme specifically for the `/admin` section of the application using `next-themes` and Tailwind CSS.

**Overall Goal:** Add theming support (light, dark) with a custom color scheme (Slate + Indigo/Violet) to the `/admin` routes, defaulting to the system preference on initial load. Add theme and sidebar toggles to a new header section in the admin layout.

---

**Step 1: Install and Configure `next-themes`**

*   **Goal:** Add the `next-themes` package and set up the basic configuration for Tailwind CSS and the admin-specific Theme Provider.
*   **Actions:**
    1.  Install the package: `npm install next-themes` or `yarn add next-themes`.
    2.  Modify `tailwind.config.js`: Set `darkMode: 'selector'` (or `'class'` if using Tailwind < v3.4.1).
    3.  Create `app/admin/theme-provider.tsx`: This will be a client component wrapping `{children}` with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`. Although we won't offer 'system' as a *choice*, setting `defaultTheme="system"` and `enableSystem` ensures the initial theme respects the user's OS setting.
    4.  Update `app/admin/layout.tsx`: Import and use `AdminThemeProvider` to wrap the layout's children. Ensure `app/admin/layout.tsx` is compatible (might need `'use client'` if it directly renders client components or uses hooks).
*   **Context Files:**
    *   `tailwind.config.js`
    *   `app/admin/layout.tsx`

---

**Step 2: Define Color Scheme & CSS Variables**

*   **Goal:** Define the light and dark mode color palettes using CSS variables in the global stylesheet and ensure Tailwind uses them.
*   **Actions:**
    1.  Edit `app/globals.css`:
        *   Add the CSS variable definitions for the Slate + Indigo/Violet color scheme under `:root` (for light mode).
        *   Add the corresponding overrides for dark mode under a `.dark` selector. Include variables for background, foreground, primary, secondary, card, popover, borders, inputs, rings, accents, destructive colors, and gradients.
    2.  Verify `tailwind.config.js`: Ensure the Tailwind theme configuration correctly references these CSS variables.
*   **Context Files:**
    *   `app/globals.css`
    *   `tailwind.config.js`

---

**Step 3: Create Theme Toggle Component**

*   **Goal:** Create a reusable component that allows users to switch between light and dark themes.
*   **Actions:**
    1.  Create `components/theme-toggle.tsx`.
    2.  Implement the component using `useTheme` from `next-themes`.
    3.  Use `useState` and `useEffect` to manage the mounted state and prevent hydration mismatches.
    4.  Include buttons/icons (e.g., Sun, Moon) for setting `setTheme('light')` and `setTheme('dark')`. **Do not include an option for 'system'.**
*   **Context Files:**
    *   `app/globals.css` (for potential styling/icons)
    *   _(Reference `next-themes` documentation for hydration pattern)_

---

**Step 4: Update Admin Layout Structure and Add Controls**

*   **Goal:** Modify the admin layout to include a header/top-bar area, place the theme toggle and a sidebar trigger in the top-right, and add a visual divider.
*   **Actions:**
    1.  Edit `app/admin/layout.tsx`:
        *   Refactor the layout structure (using `div`s, `header`, `main`, etc.) to create a distinct top section above the main content area.
        *   Import and place the `ThemeToggle` component (created in Step 3) in the top-right corner of this new header area.
        *   Import/create and place a `SidebarTrigger` component (using `PanelLeft` icon or similar, likely leveraging shadcn `Button`) adjacent to the `ThemeToggle` in the top-right. Ensure it's wired up to toggle the sidebar state (you might need context or state management for the sidebar visibility).
        *   Add a thin horizontal line element (e.g., `<div className="h-px w-full bg-border"></div>`) styled and positioned appropriately to visually separate the header/top-bar from the main content.
*   **Context Files:**
    *   `app/admin/layout.tsx`
    *   `components/theme-toggle.tsx` (from Step 3)
    *   `components/ui/sidebar.tsx` (if sidebar logic exists) or relevant state management files.
    *   `app/globals.css`

---

**Step 5: Refactor Admin Routes for Theming**

*   **Goal:** Apply the new theme variables and styles throughout all components and pages within the `/admin` route group.
*   **Actions:**
    1.  Iterate through all files within `app/admin/` and its subdirectories (`orders/`, `settings/`, `menus/`, `analytics/`, `schedule/`, etc.).
    2.  In each file (`.tsx`, `.ts` if relevant for style objects):
        *   Replace hardcoded colors and default Tailwind color classes (e.g., `bg-white`, `text-gray-900`, `border-gray-200`, `bg-blue-500`) with classes that use the defined CSS variables (e.g., `bg-background`, `text-foreground`, `border`, `bg-primary`, `text-primary-foreground`).
        *   Apply gradients (`bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))]`) where appropriate for visual enhancement (headers, buttons, key elements), ensuring accessibility.
*   **Context Files (Provide relevant examples first, then list others):**
    *   `app/globals.css` (Essential reference for variables)
    *   `app/admin/page.tsx`
    *   `app/admin/client.tsx`
    *   `app/admin/dashboard-schedule.tsx`
    *   `app/admin/checklist-client.tsx`
    *   _Any file within:_
        *   `app/admin/orders/`
        *   `app/admin/settings/`
        *   `app/admin/menus/`
        *   `app/admin/analytics/`
        *   `app/admin/schedule/`
        *   `app/admin/account/`
        *   `app/admin/config/`
        *   etc.
