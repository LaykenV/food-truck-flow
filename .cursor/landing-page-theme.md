# Plan: Apply Dark Admin Theme to Landing Page

This plan outlines the steps to apply the dark admin theme (specifically the dark mode variant) defined in `app/globals.css` to the landing page (`app/page.tsx`) and its child components. The goal is to hardcode the dark theme, use a consistent left-to-right gradient background across all sections, ensure cards are dark, and maintain good color contrast.

**1. Verify Base Styles in `app/globals.css`**

*   **Goal:** Ensure the necessary dark admin CSS variables are defined for the dark theme.
*   **File:** `app/globals.css`
*   **Action:** Check within the `.dark { ... }` block (or a dedicated admin dark theme section if separate) for the presence and correctness of variables like:
    *   `--admin-background`
    *   `--admin-foreground`
    *   `--admin-card`
    *   `--admin-card-foreground`
    *   `--admin-popover`
    *   `--admin-popover-foreground`
    *   `--admin-primary`
    *   `--admin-primary-foreground`
    *   `--admin-secondary`
    *   `--admin-secondary-foreground`
    *   `--admin-muted`
    *   `--admin-muted-foreground`
    *   `--admin-accent`
    *   `--admin-accent-foreground`
    *   `--admin-destructive`
    *   `--admin-destructive-foreground`
    *   `--admin-border`
    *   `--admin-input`
    *   `--admin-ring`
    *   `--admin-gradient-start`
    *   `--admin-gradient-end`
*   **Context:** These variables provide the color palette for the dark admin theme. Ensure they follow best practices for dark mode accessibility and aesthetics.

**2. Apply Global Background and Text Color in `app/page.tsx`**

*   **Goal:** Set the main page background to a dark gradient and default text color.
*   **File:** `app/page.tsx`
*   **Action:**
    *   Modify the top-level `div` element (currently `className="min-h-screen"`).
    *   **Change:** `className="min-h-screen bg-gradient-to-r from-[--admin-gradient-start] to-[--admin-gradient-end] text-[--admin-foreground]"`
    *   Ensure child `<section>` elements *do not* have conflicting background classes (like `bg-white`, `bg-gray-50`, gradient classes). Remove these if present so they inherit the main gradient.

**3. Update Header Component (`app/components/Header.tsx`)**

*   **Goal:** Style the header for the dark theme, handling both scrolled and initial states.
*   **File:** `app/components/Header.tsx`
*   **Action:**
    *   **Header Tag:**
        *   In the dynamic class string for the `<header>` element:
            *   Replace `bg-white shadow-md` (scrolled state) with `bg-[--admin-background] shadow-lg`.
            *   Remove `bg-transparent` (initial state) - it should blend with the page gradient.
    *   **Logo:**
        *   In the dynamic class string for the `<span>`:
            *   Replace `text-gray-900` (scrolled) with `text-[--admin-foreground]`.
            *   Replace `text-white` (initial) with `text-[--admin-foreground]`.
    *   **Desktop Nav Links:**
        *   In the dynamic class string for each `<Link>`:
            *   Replace `text-gray-700 hover:text-gray-900` (scrolled) with `text-[--admin-muted-foreground] hover:text-[--admin-foreground]`.
            *   Replace `text-gray-200 hover:text-white` (initial) with `text-[--admin-muted-foreground] hover:text-[--admin-foreground]`.
    *   **Desktop Buttons (`AuthModals` Triggers):**
        *   **Sign In Button:**
            *   Update `variant` prop and `className` prop passed to the `Button` trigger based on `isScrolled`:
                *   Scrolled: `variant="outline"` `className="border-[--admin-border] text-[--admin-muted-foreground] hover:bg-[--admin-accent] hover:text-[--admin-accent-foreground]"` (or similar admin outline style).
                *   Initial: `variant="outline"` `className="text-[--admin-foreground] border-[--admin-foreground] hover:bg-[--admin-foreground]/10"` (or similar contrast outline).
        *   **Sign Up Button:**
            *   Update `variant` prop and `className` prop passed to the `Button` trigger based on `isScrolled`:
                *   Scrolled: `variant="default"` `className="bg-[--admin-primary] text-[--admin-primary-foreground] hover:bg-[--admin-primary]/90"`.
                *   Initial: `variant="default"` `className="bg-[--admin-primary] text-[--admin-primary-foreground] hover:bg-[--admin-primary]/90"`. (Removed specific yellow styles).
    *   **Mobile Menu Button (Hamburger):**
        *   Update SVG class: Replace `text-gray-900` (scrolled) and `text-white` (initial) with `text-[--admin-foreground]`.
        *   Update hover background: `hover:bg-gray-100 hover:bg-opacity-20` can be changed to `hover:bg-[--admin-accent]`.
    *   **Mobile Menu Panel:**
        *   Change `bg-white` to `bg-[--admin-background]`.
        *   Update link styles: `text-gray-700 hover:text-gray-900 border-gray-100` should become `text-[--admin-muted-foreground] hover:text-[--admin-foreground] border-[--admin-border]`.
        *   Update Mobile Buttons: Apply styles consistent with the desktop buttons' dark admin theme equivalents (e.g., use `bg-[--admin-primary]`, `border-[--admin-border]`, etc.).

**4. Update Hero Section Component (`app/components/HeroSection.tsx`)**

*   **Goal:** Adapt the hero section to the dark theme and page gradient.
*   **File:** `app/components/HeroSection.tsx`
*   **Action:**
    *   **Remove Background Image & Overlay:**
        *   Delete the entire `div` with `absolute inset-0 z-0` containing the `Image` component and its fallback.
        *   Delete the overlay `div` (`absolute inset-0 bg-black bg-opacity-50 z-10`). The background should now come from `page.tsx`.
    *   **Text Elements:**
        *   `h1`: Change `text-white` to `text-[--admin-primary-foreground]` (or `text-[--admin-foreground]` if contrast is better).
        *   Accent `span` (`text-yellow-400`): Change to `text-[--admin-primary]`.
        *   `p`: Change `text-gray-200` to `text-[--admin-muted-foreground]`.\
    *   **Buttons (`AuthModals` Triggers):**
        *   **Login Button:** Replace `bg-yellow-500 text-gray-900 ... hover:bg-yellow-400` with `bg-[--admin-primary] text-[--admin-primary-foreground] ... hover:bg-[--admin-primary]/90`. Keep padding/rounding/shadow classes.
        *   **Sign Up Free Button:** Replace `bg-transparent text-white border-2 border-white ... hover:bg-white hover:bg-opacity-10` with `border-2 border-[--admin-primary] text-[--admin-primary] ... hover:bg-[--admin-primary]/10`. Keep padding/rounding/shadow classes.
    *   **Scroll Down Indicator:**
        *   Change SVG class `text-white` to `text-[--admin-foreground]`.

**5. Update Sections in `app/page.tsx` (Features, Pricing, CTA, Footer)**

*   **Goal:** Style the content sections (Features, Pricing, CTA, Footer) for the dark theme, ensuring card backgrounds are dark and text is legible.
*   **File:** `app/page.tsx`
*   **Action:**
    *   **General:** Remove any `bg-white`, `bg-gray-50`, or other light background classes from `<section>` elements. They should inherit the gradient from the main `div`.
    *   **Features Section (`#features`):**
        *   Titles/Text: Change `text-gray-900` to `text-[--admin-foreground]`, `text-gray-600` to `text-[--admin-muted-foreground]`.\
        *   Feature Cards (`div`): Remove `bg-gray-50`. Add `bg-[--admin-card] rounded-xl shadow-lg`.
        *   Card Text: Change `text-gray-900` to `text-[--admin-card-foreground]`, `text-gray-600` to `text-[--admin-muted-foreground]`.
        *   Icon Backgrounds (`div`): Replace `bg-yellow-100`, `bg-green-100`, `bg-blue-100` with `bg-[--admin-accent]`.
        *   Icon Colors (SVG): Replace `text-yellow-600`, `text-green-600`, `text-blue-600` with `text-[--admin-primary]`.
    *   **Pricing Section (`#pricing`):**
        *   Titles/Text: Change `text-gray-900` to `text-[--admin-foreground]`, `text-gray-600` to `text-[--admin-muted-foreground]`.
        *   Basic Plan `Card`: Remove `border-gray-200`. Add `bg-[--admin-card] border border-[--admin-border]`.
        *   Pro Plan `Card`: Remove `border-primary bg-primary/5`. Add `bg-[--admin-card] border-2 border-[--admin-primary]`. (Keep hover/transition).
        *   Card Titles/Text: Inside both cards, change `text-gray-900`, `text-gray-500` etc. to use `text-[--admin-card-foreground]` or `text-[--admin-muted-foreground]` appropriately.
        *   Check Icon (`Check` component): Change `text-green-500` to `text-[--admin-primary]`.
        *   "RECOMMENDED" Badge: Change `bg-primary text-primary-foreground` to `bg-[--admin-primary] text-[--admin-primary-foreground]`.
    *   **CTA Section:**
        *   Remove the `bg-gradient-to-r from-yellow-500 to-orange-500` classes from the `<section>` tag.
        *   Text: Change `text-white` to `text-[--admin-foreground]` (or `text-[--admin-primary-foreground]`). Adjust `opacity-90` if needed for contrast.
        *   "Get Started Today" Button (`AuthModals` Trigger): Replace `bg-white text-orange-600 hover:bg-gray-100` with `bg-[--admin-primary] text-[--admin-primary-foreground] hover:bg-[--admin-primary]/90`. Keep size class.
    *   **Footer:**
        *   `<footer>`: Replace `bg-gray-900` with `bg-transparent` or a slightly darker/translucent admin background like `bg-[--admin-background]/50`.
        *   Text: Change `text-white` to `text-[--admin-foreground]`, `text-gray-400` to `text-[--admin-muted-foreground]`.
        *   Links: Change `hover:text-white` to `hover:text-[--admin-primary]`.
        *   Border: Change `border-gray-800` to `border-[--admin-border]`.

**6. Update Testimonials Section Component (`app/components/TestimonialsSection.tsx`)**

*   **Goal:** Style the testimonials section for the dark theme.
*   **File:** `app/components/TestimonialsSection.tsx`
*   **Action:**
    *   `<section>`: Remove `bg-gray-50`.
    *   Titles/Text: Change `text-gray-900` to `text-[--admin-foreground]`, `text-gray-600` to `text-[--admin-muted-foreground]`.
    *   Testimonial Cards (`div`): Remove `bg-white`. Add `bg-[--admin-card] rounded-xl shadow-lg`.
    *   Card Text: Change `text-gray-900` to `text-[--admin-card-foreground]`, `text-gray-600` to `text-[--admin-muted-foreground]`.\
    *   Owner Title: Change `text-yellow-600` to `text-[--admin-primary]`.
    *   Stars (SVG): Change `text-yellow-500` to `text-[--admin-primary]`.
    *   Image Placeholder (`div`): Change `bg-gray-200` to `bg-[--admin-muted]`.

**7. Update OAuth Buttons Component (`components/oauth-buttons.tsx`)**

*   **Goal:** Style the OAuth buttons (used within modals) for the dark theme.
*   **File:** `components/oauth-buttons.tsx`
*   **Action:**
    *   **Divider:**
        *   `span` border: Change `border-muted-foreground/30` to `border-[--admin-border]`.
        *   "Or continue with" `span`: Change `text-muted-foreground` to `text-[--admin-muted-foreground]`. Change `bg-background` to `bg-[--admin-card]` (assuming the modal background is `admin-card`).
    *   **Buttons:**
        *   Change `variant="outline"` buttons: Apply classes like `border-[--admin-border] text-[--admin-muted-foreground] hover:bg-[--admin-accent] hover:text-[--admin-accent-foreground]`.
        *   SVG Icons: Ensure `fill` attributes (like `#4285F4` for Google, `#1877F2` for Facebook) have sufficient contrast against the button background (`--admin-card` or `--admin-accent` on hover). Consider using `currentColor` and setting the text color, or adjusting the hex codes if needed.
        *   Loading Spinner (`div`): Change `border-primary` to `border-[--admin-primary]`.

**8. Final Review**

*   **Goal:** Ensure consistency, contrast, and remove any remaining light theme styles.
*   **Action:** Visually inspect all updated components and the main page in a browser. Check:
    *   Background gradient is applied consistently.
    *   All text has good contrast against its background.
    *   All interactive elements (buttons, links) use the admin theme colors correctly for default and hover states.
    *   Cards and popovers (like the auth modals) use the `admin-card` background.
    *   No remnants of `bg-white`, `text-gray-900`, `border-gray-200`, etc., unless intentionally styled.
    *   SVGs and icons are clearly visible.
