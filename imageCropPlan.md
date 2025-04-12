# Plan: Implement Image Cropping with react-image-crop

1.  **Install Dependency**:
    *   Add `react-image-crop` to the project dependencies:
        ```bash
        npm install --save react-image-crop
        # or yarn add react-image-crop
        ```

2.  **Create `ImageEditorModal` Component**:
    *   Create a new file: `app/components/ImageEditorModal.tsx`.
    *   Use `shadcn/ui`'s `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Button`, and potentially `Slider` (optional for zoom).
    *   Integrate the `ReactCrop` component from `react-image-crop`.
    *   Import the necessary CSS: `import 'react-image-crop/dist/ReactCrop.css';`
    *   **State Management within Modal**:
        *   `crop: Crop | undefined` (controlled by `ReactCrop`'s `onChange`)
        *   `completedCrop: PixelCrop | undefined` (set by `ReactCrop`'s `onComplete`)
        *   Ref for the image element (`imgRef = useRef<HTMLImageElement>(null)`) to get dimensions for cropping.
    *   **Helper Function (`getCroppedImg`)**:
        *   Implement a function inside the modal (or import from utils) that takes the `imgRef`, `completedCrop`, and original filename.
        *   This function will use `canvas.toBlob()` to generate a `Blob` of the cropped area.
        *   Handle potential errors during canvas operations.
    *   **Modal Buttons**:
        *   "Save Crop": Calls `getCroppedImg`, then invokes the `onSave` prop with the resulting Blob.
        *   "Cancel": Calls the `onClose` prop.
    *   **Props**:
        *   `isOpen: boolean`
        *   `onClose: () => void`
        *   `imageSrc: string | null` (The Blob URL of the image to edit)
        *   `aspect?: number` (e.g., `1` or `16 / 9`)
        *   `circularCrop?: boolean` (defaults to `false`)
        *   `onSave: (croppedBlob: Blob) => void`

3.  **Modify `UnifiedConfigForm` State**:
    *   Add new state variables:
        ```typescript
        const [isEditorOpen, setIsEditorOpen] = useState(false);
        const [editingFile, setEditingFile] = useState<File | null>(null);
        const [editingFileUrl, setEditingFileUrl] = useState<string | null>(null);
        const [editingFieldName, setEditingFieldName] = useState<'logo' | 'aboutImage' | null>(null);
        // Store aspect and circularCrop together
        const [editorConfig, setEditorConfig] = useState<{ aspect?: number; circularCrop?: boolean }>({});
        ```

4.  **Update `handleFileSelect`**:
    *   Modify the existing function:
        ```typescript
        const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logo' | 'aboutImage' | 'heroImage') => { // Update type if heroImage also needs cropping
          const file = e.target.files?.[0];
          if (!file) return;

          // Check if the field requires editing
          if (fieldName === 'logo' || fieldName === 'aboutImage') {
            // Revoke previous editing URL if any
            if (editingFileUrl) {
              revokeFilePreview(editingFileUrl);
            }

            const previewUrl = createFilePreview(file);
            setEditingFile(file);
            setEditingFileUrl(previewUrl);
            setEditingFieldName(fieldName);

            // Set config based on field
            if (fieldName === 'logo') {
              setEditorConfig({ aspect: 1, circularCrop: true });
            } else if (fieldName === 'aboutImage') {
              setEditorConfig({ aspect: 16 / 9, circularCrop: false });
            }
            // Add config for heroImage if needed

            setIsEditorOpen(true);

            // Clear the input value so the same file can be selected again if needed
            e.target.value = '';
          } else {
            // --- Keep existing logic for fields that DON'T need the editor ---
            const previewUrl = createFilePreview(file);
            setFormValues(prev => ({ ...prev, [fieldName]: previewUrl }));
            setStagedImages(prev => {
              const filtered = prev.filter(img => img.fieldName !== fieldName);
              // Revoke old preview if it was a blob
              const oldImage = prev.find(img => img.fieldName === fieldName);
              if (oldImage && isBlobUrl(oldImage.previewUrl)) {
                 revokeFilePreview(oldImage.previewUrl);
              }
              return [...filtered, { file, previewUrl, fieldName }];
            });
            toast.info(`Image selected. It will be uploaded when you save changes.`);
            // --- End of existing logic ---
         }
        };
        ```

5.  **Implement Editor Save Logic (`handleSaveCrop`)**:
    *   Create a new function in `UnifiedConfigForm`:
        ```typescript
        const handleSaveCrop = (croppedImageBlob: Blob) => {
          if (!editingFile || !editingFieldName || !editingFileUrl) return;

          // Create a File object from the Blob
          const croppedFile = new File([croppedImageBlob], editingFile.name, {
            type: croppedImageBlob.type,
          });

          // Create a new preview URL for the *cropped* file
          const croppedPreviewUrl = createFilePreview(croppedFile);

          // Update form values with the cropped preview
          setFormValues(prev => ({
            ...prev,
            [editingFieldName]: croppedPreviewUrl,
          }));

          // Update staged images with the *cropped* file
          setStagedImages(prev => {
            // Find and revoke the previous preview URL for this field if it exists
            const oldImage = prev.find(img => img.fieldName === editingFieldName);
            if (oldImage && isBlobUrl(oldImage.previewUrl)) {
               revokeFilePreview(oldImage.previewUrl);
            }
            // Remove existing entry for this field and add the new one
            const filtered = prev.filter(img => img.fieldName !== editingFieldName);
            return [...filtered, { file: croppedFile, previewUrl: croppedPreviewUrl, fieldName: editingFieldName }];
          });

          // Revoke the original (uncropped) preview URL
          revokeFilePreview(editingFileUrl);

          // Close editor and reset state
          setIsEditorOpen(false);
          setEditingFile(null);
          setEditingFileUrl(null);
          setEditingFieldName(null);
          setEditorConfig({});

          toast.success(`${editingFieldName === 'logo' ? 'Logo' : 'Image'} cropped successfully. Save changes to upload.`);
        };
        ```

6.  **Implement Editor Cancel Logic (`handleCancelCrop`)**:
    *   Create a new function in `UnifiedConfigForm` to handle closing/canceling the modal:
        ```typescript
        const handleCancelCrop = () => {
           if (editingFileUrl) {
             revokeFilePreview(editingFileUrl); // Clean up the unused original preview
           }
           setIsEditorOpen(false);
           setEditingFile(null);
           setEditingFileUrl(null);
           setEditingFieldName(null);
           setEditorConfig({});
        };
        ```

7.  **Render the Modal**:
    *   Add the `ImageEditorModal` component within the `UnifiedConfigForm`'s return statement:
        ```jsx
        {editingFileUrl && (
          <ImageEditorModal
            isOpen={isEditorOpen}
            onClose={handleCancelCrop} // Use the cancel handler
            imageSrc={editingFileUrl}
            aspect={editorConfig.aspect}
            circularCrop={editorConfig.circularCrop}
            onSave={handleSaveCrop}
          />
        )}
        ```

8.  **Adjust UI**:
    *   The existing `<img>` tags used for previews in the form will automatically display the `formValues.logo`, `formValues.aboutImage`, etc. which will now be the *cropped* preview URL after `handleSaveCrop` runs. No changes needed there.

9.  **Cleanup**:
    *   Ensure the `useEffect` cleanup for `stagedImages` correctly handles revoking blob URLs when the component unmounts or `initialConfig` changes. The current logic might be sufficient, but double-check.
    *   The `handleSaveCrop` and `handleCancelCrop` functions now handle revoking the temporary `editingFileUrl`.