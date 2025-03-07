# Unified Config Components

This document explains the changes made to unify the configuration components in the Food Truck Flow application.

## Changes Made

### Step 1: Unified Config Provider

1. Created a new `UnifiedConfigProvider` component that combines the functionality of both `ConfigProvider` and `AdminConfigProvider`.
2. Updated all imports and usages of the old providers to use the new unified provider.
3. Maintained backward compatibility with existing code by providing `useConfig` and `useAdminConfig` hooks that work with the new provider.

### Step 2: Unified Config Wrapper

1. Created a new `UnifiedConfigWrapper` component that combines the functionality of both `AdminConfigWrapper` and `ClientWrapper`.
2. Updated all imports and usages of the old wrappers to use the new unified wrapper.
3. Maintained backward compatibility by exporting the original component names that internally use the unified wrapper.

### Step 3: Unified Form and Preview Components

1. Created a new `UnifiedConfigForm` component that combines the functionality of both `ConfigForm` and `AdminConfigForm`.
2. Created a new `UnifiedLivePreview` component that combines the functionality of both `LivePreview` and `AdminLivePreview`.
3. Updated the `UnifiedConfigWrapper` to use these new unified components.
4. Maintained backward compatibility by exporting the original component names that internally use the unified components.

### Step 4: Cleanup

1. Deleted the old components that are no longer needed:
   - `ConfigProvider.tsx`
   - `AdminConfigProvider.tsx`
   - `ClientWrapper.tsx`
   - `AdminConfigWrapper.tsx`
   - `ConfigForm.tsx`
   - `AdminConfigForm.tsx`
   - `LivePreview.tsx`
   - `AdminLivePreview.tsx`
2. Kept the backward compatibility exports in the unified components to ensure existing code continues to work.

## How It Works

### UnifiedConfigProvider

The new `UnifiedConfigProvider` has a `mode` prop that can be set to either `'admin'` or `'client'`. This determines how the provider behaves:

- In `'client'` mode, it behaves like the old `ConfigProvider`, saving to localStorage.
- In `'admin'` mode, it behaves like the old `AdminConfigProvider`, saving via an API call.

### UnifiedConfigWrapper

The new `UnifiedConfigWrapper` also has a `mode` prop that can be set to either `'admin'` or `'client'`. This determines which form and preview components are rendered:

- In `'client'` mode, it renders the client version of the form and preview.
- In `'admin'` mode, it renders the admin version of the form and preview.

### UnifiedConfigForm

The new `UnifiedConfigForm` has a `mode` prop that can be set to either `'admin'` or `'client'`. This determines how the form behaves:

- In `'client'` mode, it behaves like the old `ConfigForm`, with client-specific features like the reset button.
- In `'admin'` mode, it behaves like the old `AdminConfigForm`, with admin-specific features like the history tab.

### UnifiedLivePreview

The new `UnifiedLivePreview` has a `mode` prop that can be set to either `'admin'` or `'client'`. This determines how the preview behaves:

- In `'client'` mode, it behaves like the old `LivePreview`, showing the sign-up button.
- In `'admin'` mode, it behaves like the old `AdminLivePreview`, without the sign-up button.

## Usage

### Client Mode

```tsx
<UnifiedConfigProvider mode="client">
  <UnifiedConfigWrapper mode="client" />
</UnifiedConfigProvider>
```

Or using the backward compatibility components:

```tsx
<UnifiedConfigProvider mode="client">
  <ClientWrapper />
</UnifiedConfigProvider>
```

### Admin Mode

```tsx
<UnifiedConfigProvider 
  mode="admin" 
  initialConfig={config} 
  onSave={handleSaveConfig}
>
  <UnifiedConfigWrapper 
    mode="admin"
    initialConfig={config}
    onSave={handleSaveConfig}
    isSaving={isLoading}
    lastSaved={lastSaved}
    userId={userId}
  />
</UnifiedConfigProvider>
```

Or using the backward compatibility components:

```tsx
<UnifiedConfigProvider 
  mode="admin" 
  initialConfig={config} 
  onSave={handleSaveConfig}
>
  <AdminConfigWrapper 
    initialConfig={config}
    onSave={handleSaveConfig}
    isSaving={isLoading}
    lastSaved={lastSaved}
    userId={userId}
  />
</UnifiedConfigProvider>
```

## Hooks

The following hooks are available:

- `useUnifiedConfig()`: The main hook for accessing the config context.
- `useConfig()`: Backward compatibility hook for client mode.
- `useAdminConfig()`: Backward compatibility hook for admin mode.

## Benefits of Unification

1. **Reduced Code Duplication**: By combining similar components, we've eliminated a significant amount of duplicated code.
2. **Easier Maintenance**: Changes to the configuration system now only need to be made in one place.
3. **Consistent Behavior**: The unified components ensure consistent behavior between admin and client modes.
4. **Backward Compatibility**: Existing code continues to work without changes, making this a non-breaking refactor.
5. **Better Extensibility**: Adding new features to the configuration system is now easier as they only need to be added once.
6. **Smaller Bundle Size**: By removing duplicate code, the overall bundle size of the application is reduced. 