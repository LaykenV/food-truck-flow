# Admin Section Theming Documentation

This document describes the theming implementation specific to the `/admin` route group in the FoodTruckFlow application.

## Overview

The `/admin` section utilizes the `next-themes` library to provide support for:

*   **Light Mode:** Default light interface.
*   **Dark Mode:** Default dark interface.
*   **System Mode:** Automatically adapts to the user's operating system preference.

Theming is **scoped** to the `/admin` routes and does not affect the rest of the application. This is achieved by wrapping the admin layout (`app/admin/layout.tsx`) with a dedicated `AdminThemeProvider` component (`app/admin/theme-provider.tsx`).

## Technology Stack

*   **`next-themes`:** Handles theme state management, system preference detection, and synchronization across tabs.
*   **Tailwind CSS:** Used for styling. Configured with `darkMode: 'selector'` to apply dark mode styles based on a `.dark` class on the `<html>` element.
*   **CSS Variables:** Define the color palette for both light and dark modes, ensuring consistency and easy maintenance.

## Configuration

*   **`next-themes` Provider:** Located at `app/admin/theme-provider.tsx`. Configured as:
    ```typescript
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
    ```
    *   `attribute="class"`: Modifies the `class` attribute on the `<html>` tag (e.g., adds `.dark`).
    *   `defaultTheme="system"`: Uses the system preference by default.
    *   `enableSystem`: Allows switching based on `prefers-color-scheme`.
*   **Tailwind Config:** `tailwind.config.js` includes `darkMode: 'selector'` (or `darkMode: 'class'` for older Tailwind versions).

## Color Scheme

A custom color scheme is defined using CSS variables in `app/globals.css`.

*   **Base:** Slate (Neutral grays)
*   **Accent:** Indigo/Violet (Vibrant primary actions and gradients)

### Key CSS Variables (`app/globals.css`)

Variables are defined in `:root` (light mode) and overridden in `.dark` (dark mode). Examples:

```css
:root {
  --background: 0 0% 100%; /* White */
  --foreground: 222.2 84% 4.9%; /* Dark Slate */
  --primary: 243.4 80% 58.4%; /* Indigo */
  --primary-foreground: 0 0% 100%; /* White */
  --secondary: 210 40% 96.1%; /* Light Slate */
  --secondary-foreground: 222.2 47.4% 11.2%; /* Slate */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 243.4 80% 58.4%; /* Indigo */
  --radius: 0.5rem;
  --gradient-start: hsl(var(--primary));
  --gradient-end: 260 85% 65%; /* Violet */
  /* ... other variables ... */
}

.dark {
  --background: 222.2 84% 4.9%; /* Dark Slate */
  --foreground: 210 40% 98%; /* White */
  --primary: 243.4 80% 68.4%; /* Brighter Indigo */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark Slate */
  --secondary: 217.2 32.6% 17.5%; /* Darker Slate */
  --secondary-foreground: 210 40% 98%; /* White */
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 243.4 80% 68.4%; /* Brighter Indigo */
  --gradient-start: hsl(var(--primary));
  --gradient-end: 260 85% 75%; /* Brighter Violet */
  /* ... other variables ... */
}
```
*(Refer to `app/globals.css` for the complete list)*

## Usage in Components

1.  **Basic Styling:** Use Tailwind utility classes that map to the CSS variables (shadcn/ui typically handles this setup).
    *   `bg-background`, `text-foreground`
    *   `bg-card`, `text-card-foreground`
    *   `bg-primary`, `text-primary-foreground`
    *   `bg-secondary`, `text-secondary-foreground`
    *   `border` (maps to `--border`)
    *   `ring-ring` (maps to `--ring`)
    *   `rounded-lg` (maps to `--radius` via Tailwind config)

2.  **Gradients:** Apply gradients using Tailwind utilities and the defined gradient variables:
    ```jsx
    <div className="bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))]">
      Gradient Text or Content
    </div>
    ```

3.  **Conditional Styling:** Tailwind's `dark:` variant works automatically due to the `darkMode: 'selector'` and `ThemeProvider attribute="class"` setup.
    ```jsx
    <div className="text-foreground dark:text-secondary-foreground">
      This text changes color in dark mode.
    </div>
    ```

## Theme Toggle

A dedicated `ThemeToggle` component (`components/theme-toggle.tsx`) is available.

*   It uses the `useTheme` hook from `next-themes`.
*   It handles hydration mismatches by delaying rendering until mounted on the client.
*   Provides UI elements (buttons/icons) to call `setTheme('light')`, `setTheme('dark')`, or `setTheme('system')`.
*   Instances are placed in the admin layout's top-right corner and near the sidebar trigger for easy access.