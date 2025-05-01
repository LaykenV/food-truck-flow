'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ImageIcon, 
  Palette, 
  Layout, 
  Info, 
  Phone, 
  Save, 
  Share2,
  RotateCcw,
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { ConfigHistoryDrawer } from './ConfigHistoryDrawer';
import { useConfig } from './UnifiedConfigProvider';
import { uploadImage } from '@/utils/storage-utils';
import { createFilePreview, revokeFilePreview, isBlobUrl } from '@/utils/file-utils';
import { ImageEditorModal } from './ImageEditorModal';
import { GenerateModelModal } from './GenerateModelModal';
import { ConfigProvider } from './UnifiedConfigProvider';

// Helper debounce hook
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Props for the UnifiedConfigForm
interface UnifiedConfigFormProps {
  initialConfig?: FoodTruckConfig;
  onSave?: (config: FoodTruckConfig) => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  userId?: string;
}

// Type for image files that are staged for upload
interface StagedImage {
  file: File;
  previewUrl: string;
  fieldName: string;
}

export function UnifiedConfigForm({ 
  initialConfig, 
  onSave, 
  isSaving = false, 
  lastSaved = null,
  userId
}: UnifiedConfigFormProps) {
  const { config: contextConfig, setConfig: setContextConfig } = useConfig();
  const configToInitializeWith = initialConfig || contextConfig;
  
  const [formValues, setFormValues] = useState({
    name: configToInitializeWith.name || '',
    tagline: configToInitializeWith.tagline || '',
    logo: configToInitializeWith.logo || '',
    primaryColor: configToInitializeWith.primaryColor || '#FF6B35',
    secondaryColor: configToInitializeWith.secondaryColor || '#4CB944',
    heroFont: configToInitializeWith.heroFont || '#FFFFFF',
    heroImage: configToInitializeWith.hero?.image || '',
    heroTitle: configToInitializeWith.hero?.title || '',
    heroSubtitle: configToInitializeWith.hero?.subtitle || '',
    aboutTitle: configToInitializeWith.about?.title || '',
    aboutContent: configToInitializeWith.about?.content || '',
    aboutImage: configToInitializeWith.about?.image || '',
    contactEmail: configToInitializeWith.contact?.email || '',
    contactPhone: configToInitializeWith.contact?.phone || '',
    socialTwitter: configToInitializeWith.socials?.twitter || '',
    socialInstagram: configToInitializeWith.socials?.instagram || '',
    socialFacebook: configToInitializeWith.socials?.facebook || '',
  });

  // State to store the original config (last saved state) for reset functionality
  const [originalConfig, setOriginalConfig] = useState<FoodTruckConfig>(configToInitializeWith);

  // Store staged image files that will be uploaded on form submit
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>("branding");
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new state variables for the image editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingFileUrl, setEditingFileUrl] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState<'logo' | 'aboutImage' | 'heroImage' | null>(null);
  const [editorConfig, setEditorConfig] = useState<{ aspect?: number; circularCrop?: boolean }>({});

  // State for AI Model Generation Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Effect to update internal state when initialConfig changes ---
  useEffect(() => {
    // Prevent resetting form values if a save is in progress or if initialConfig hasn't changed
    // Using JSON.stringify for simple deep comparison, avoid adding lodash for one function
    const stringifiedInitialConfig = initialConfig ? JSON.stringify(initialConfig) : null;
    const stringifiedOriginalConfig = JSON.stringify(originalConfig);

    if (isSaving || isSubmitting || !initialConfig || stringifiedInitialConfig === stringifiedOriginalConfig) {
      return;
    }
    
    // Update both formValues and originalConfig when initialConfig changes (e.g., after save)
    const newFormState = {
      name: initialConfig.name || '',
      tagline: initialConfig.tagline || '',
      logo: initialConfig.logo || '',
      primaryColor: initialConfig.primaryColor || '#FF6B35',
      secondaryColor: initialConfig.secondaryColor || '#4CB944',
      heroFont: initialConfig.heroFont || '#FFFFFF',
      heroImage: initialConfig.hero?.image || '',
      heroTitle: initialConfig.hero?.title || '',
      heroSubtitle: initialConfig.hero?.subtitle || '',
      aboutTitle: initialConfig.about?.title || '',
      aboutContent: initialConfig.about?.content || '',
      aboutImage: initialConfig.about?.image || '',
      contactEmail: initialConfig.contact?.email || '',
      contactPhone: initialConfig.contact?.phone || '',
      socialTwitter: initialConfig.socials?.twitter || '',
      socialInstagram: initialConfig.socials?.instagram || '',
      socialFacebook: initialConfig.socials?.facebook || '',
    };
    setFormValues(newFormState);
    setOriginalConfig(initialConfig); // Update originalConfig to reflect the new saved state
    
  }, [initialConfig, isSaving, isSubmitting, originalConfig]); 

  // --- Effect to calculate if there are unsaved changes ---
  useEffect(() => {
    // Compare current form state (constructed into a config) with the originalConfig
    const currentConfigFromForm = createConfigFromFormValues(formValues);
    // Use stringify for simple comparison, ignoring function differences
    setHasUnsavedChanges(
      JSON.stringify(currentConfigFromForm) !== JSON.stringify(originalConfig)
    );
  }, [formValues, originalConfig]); // Re-calculate whenever form or original changes

  // --- Helper to update both formValues and context ---
  const updateStateAndContext = (newFormValues: typeof formValues) => {
     setFormValues(newFormValues);
     // Construct the full config object to update the context
     const newConfig = createConfigFromFormValues(newFormValues);
     setContextConfig(newConfig);
  };

  // --- Debounced version for text inputs ---
  const debouncedUpdateStateAndContext = useDebounce(updateStateAndContext, 300);

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      stagedImages.forEach(staged => {
        if (staged.previewUrl && staged.previewUrl.startsWith('blob:')) {
          revokeFilePreview(staged.previewUrl);
        }
      });
    };
  }, [stagedImages]);

  // Clean up old preview URLs and update the form when uploading images
  const cleanupPreviews = (updatedConfig: FoodTruckConfig) => {
    // For each staged image, check if the preview URL is different from the new URL
    stagedImages.forEach(staged => {
      let newUrl: string | undefined;
      
      // Get the new URL from the updated config
      switch (staged.fieldName) {
        case 'logo':
          newUrl = updatedConfig.logo;
          break;
        case 'heroImage':
          newUrl = updatedConfig.hero?.image;
          break;
        case 'aboutImage':
          newUrl = updatedConfig.about?.image;
          break;
      }
      
      // If the preview URL is a blob URL and different from the new URL, revoke it
      if (isBlobUrl(staged.previewUrl) && staged.previewUrl !== newUrl) {
        revokeFilePreview(staged.previewUrl);
      }
    });
  };

  // Create a new config object from form values (can optionally take updated values)
  const createConfigFromFormValues = (currentFormValues = formValues): FoodTruckConfig => {
    return {
      name: currentFormValues.name,
      tagline: currentFormValues.tagline,
      logo: currentFormValues.logo,
      primaryColor: currentFormValues.primaryColor,
      secondaryColor: currentFormValues.secondaryColor,
      heroFont: currentFormValues.heroFont,
      hero: {
        image: currentFormValues.heroImage,
        title: currentFormValues.heroTitle,
        subtitle: currentFormValues.heroSubtitle
      },
      about: {
        title: currentFormValues.aboutTitle,
        content: currentFormValues.aboutContent,
        image: currentFormValues.aboutImage
      },
      contact: {
        email: currentFormValues.contactEmail,
        phone: currentFormValues.contactPhone
      },
      socials: {
        twitter: currentFormValues.socialTwitter,
        instagram: currentFormValues.socialInstagram,
        facebook: currentFormValues.socialFacebook
      },
      // Ensure schedule data is preserved from the original/context config
      schedule: {
        title: originalConfig.schedule?.title || 'Weekly Schedule',
        description: originalConfig.schedule?.description || 'Find us at these locations throughout the week',
        days: originalConfig.schedule?.days || [],
        primaryTimezone: originalConfig.schedule?.primaryTimezone || 'America/New_York'
      }
    };
  };

  // Upload any staged images and update config with their URLs
  const uploadStagedImages = async (): Promise<FoodTruckConfig> => {
    const newConfig = createConfigFromFormValues();
    
    if (stagedImages.length === 0 || !userId) {
      return newConfig;
    }
    
    // Show loading toast for uploads
    const loadingToastId = toast.loading(`Uploading ${stagedImages.length} image(s)...`);
    
    try {
      // Process each staged image
      for (const stagedImage of stagedImages) {
        // Determine which bucket to use
        let bucket = '';
        switch(stagedImage.fieldName) {
          case 'logo':
            bucket = 'logo-images';
            break;
          case 'heroImage':
            bucket = 'hero-images';
            break;
          case 'aboutImage':
            bucket = 'about-images';
            break;
          default:
            continue; // Skip unknown field names
        }
        
        // Upload the image
        const imageUrl = await uploadImage(stagedImage.file, bucket, userId);
        
        if (!imageUrl) {
          console.error(`Failed to upload ${stagedImage.fieldName} image`);
          continue;
        }
        
        // Update the config with the new URL
        switch(stagedImage.fieldName) {
          case 'logo':
            newConfig.logo = imageUrl;
            break;
          case 'heroImage':
            if (newConfig.hero) newConfig.hero.image = imageUrl;
            break;
          case 'aboutImage':
            if (newConfig.about) newConfig.about.image = imageUrl;
            break;
        }
      }
      
      // Clean up preview URLs
      cleanupPreviews(newConfig);
      
      // Clear staged images
      setStagedImages([]);
      
      // Also update form values with the new URLs for proper state sync
      setFormValues(prev => ({
        ...prev,
        logo: newConfig.logo || prev.logo,
        heroImage: newConfig.hero?.image || prev.heroImage,
        aboutImage: newConfig.about?.image || prev.aboutImage
      }));
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload one or more images');
      // **Important**: If upload fails, revert context state back to what's in formValues *before* upload attempt
      // This prevents the preview from showing broken/missing image URLs
      setContextConfig(createConfigFromFormValues(formValues));
    } finally {
      toast.dismiss(loadingToastId);
    }
    
    return newConfig;
  };

  // Handle form submission to update config
  const handleSubmitChanges = async () => {
    setIsSubmitting(true);
    
    try {
      // First upload any staged images
      const updatedConfig = await uploadStagedImages();
      
      if (onSave) {
        // Admin mode - use the provided onSave function
        await onSave(updatedConfig);
        // The parent component will handle the success toast
      } else {
        // Client mode - NO LONGER using context's setConfig here.
        // The context is already up-to-date due to live updates.
        // We might still want a success message.
        setStatusMessage('success');
        
        // Set the *originalConfig* to the new state after successful client-side "save"
        setOriginalConfig(updatedConfig);
        
        // Clear status message after 3 seconds
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error saving changes. Please try again.');
      setStatusMessage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes (debounced for text/textarea)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newFormValues = {
      ...formValues,
      [name]: value
    };
    setFormValues(newFormValues); // Update local state immediately for responsiveness
    debouncedUpdateStateAndContext(newFormValues); // Debounced update for context/preview
  };

  // Handle color input changes (immediate update)
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
     const newFormValues = {
       ...formValues,
       [name]: value
     };
     // Update local state and context immediately for color changes
     updateStateAndContext(newFormValues);
  };

  // Handle file selection with preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
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
      setEditingFieldName(fieldName as 'logo' | 'aboutImage' | 'heroImage');

      // Set config based on field
      if (fieldName === 'logo') {
        setEditorConfig({ aspect: 1, circularCrop: true });
      } else if (fieldName === 'aboutImage') {
        setEditorConfig({ aspect: 16 / 9, circularCrop: false });
      }

      setIsEditorOpen(true);

      // Clear the input value so the same file can be selected again if needed
      e.target.value = '';
    } else {
      // Original logic for fields that don't need the editor (e.g., heroImage if not using AI gen)
      const previewUrl = createFilePreview(file);
      
      // Update form values with the preview URL for immediate display
      const newFormValues = {
         ...formValues,
         [fieldName]: previewUrl
      };
      setFormValues(newFormValues); // Update local state immediately
      
      // Stage the image for upload during form submission
      setStagedImages(prev => {
        // Remove any existing staged image for this field
        const filtered = prev.filter(img => img.fieldName !== fieldName);
        
        // Revoke old preview if it was a blob
        const oldImage = prev.find(img => img.fieldName === fieldName);
        if (oldImage && isBlobUrl(oldImage.previewUrl)) {
          revokeFilePreview(oldImage.previewUrl);
        }
        
        // Add the new staged image
        return [...filtered, { file, previewUrl, fieldName }];
      });
      
      // Update context immediately with the preview URL
      updateStateAndContext(newFormValues);

      // Notify the user that the image will be uploaded when they save
      if (fieldName !== 'heroImage') {
        toast.info(`Image selected. It will be uploaded when you save changes.`);
      }
    }
  };

  // Add handler for saving cropped image
  const handleSaveCrop = (croppedImageBlob: Blob) => {
    if (!editingFile || !editingFieldName || !editingFileUrl) return;

    // Create a File object from the Blob
    const croppedFile = new File([croppedImageBlob], editingFile.name, {
      type: croppedImageBlob.type,
    });

    // Create a new preview URL for the cropped file
    const croppedPreviewUrl = createFilePreview(croppedFile);

    // Update form values with the cropped preview
    const newFormValues = {
      ...formValues,
      [editingFieldName]: croppedPreviewUrl,
    };
    // Update local state immediately
    setFormValues(newFormValues);

    // Update staged images with the cropped file
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

    // Update context immediately with the cropped image preview
    updateStateAndContext(newFormValues);

    toast.success(`${editingFieldName === 'logo' ? 'Logo' : 'Image'} cropped successfully. Save changes to upload.`);
  };

  // Add handler for canceling crop
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

  // Add handler for AI Model Generation Completion
  const handleModelGenerated = (generatedBlob: Blob) => {
    // Create a File object from the Blob
    const file = new File([generatedBlob], "generated-truck-model.png", { type: "image/png" });

    // Create a preview URL
    const previewUrl = createFilePreview(file);

    // Update form state with the new preview URL
    const newFormValues = { ...formValues, heroImage: previewUrl };
    // Update local state immediately
    setFormValues(newFormValues);

    // Update staged images
    setStagedImages(prev => {
      // Find and revoke the previous preview URL for the hero image if it exists and is a blob
      const oldImage = prev.find(img => img.fieldName === 'heroImage');
      if (oldImage && isBlobUrl(oldImage.previewUrl)) {
        revokeFilePreview(oldImage.previewUrl);
      }
      // Remove any existing entry for 'heroImage' and add the new one
      const filtered = prev.filter(img => img.fieldName !== 'heroImage');
      return [...filtered, { file, previewUrl, fieldName: 'heroImage' }];
    });

    // Close the modal
    setIsGenerateModalOpen(false);

    // Update context immediately with the generated model preview
    updateStateAndContext(newFormValues);

    // Show success toast
    toast.success("3D model generated successfully! Save changes to upload.");
  };

  // Format the last saved date (admin mode only)
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    
    // Format the date as "Today at 2:30 PM" or "Yesterday at 2:30 PM" or "Jan 5 at 2:30 PM"
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = lastSaved >= today;
    const isYesterday = lastSaved >= yesterday && lastSaved < today;
    
    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isYesterday) {
      dateStr = 'Yesterday';
    } else {
      dateStr = lastSaved.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    const timeStr = lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  // Handle selecting a version from history (admin mode only)
  const handleSelectVersion = (config: FoodTruckConfig) => {
    // Ensure all config properties are properly set
    const updatedFormValues = {
      name: config.name || '',
      tagline: config.tagline || '',
      logo: config.logo || '',
      primaryColor: config.primaryColor || '#FF6B35',
      secondaryColor: config.secondaryColor || '#4CB944',
      heroFont: config.heroFont || '#FFFFFF',
      heroImage: config.hero?.image || '',
      heroTitle: config.hero?.title || '',
      heroSubtitle: config.hero?.subtitle || '',
      aboutTitle: config.about?.title || '',
      aboutContent: config.about?.content || '',
      aboutImage: config.about?.image || '',
      contactEmail: config.contact?.email || '',
      contactPhone: config.contact?.phone || '',
      socialTwitter: config.socials?.twitter || '',
      socialInstagram: config.socials?.instagram || '',
      socialFacebook: config.socials?.facebook || '',
    };
    
    setFormValues(updatedFormValues);
    // Also update the context when restoring from history
    updateStateAndContext(updatedFormValues);

    toast.info('Restored configuration from history. Click Save to apply changes.');
  };

  // --- Handle Resetting Changes ---
  const handleReset = () => {
    if (!hasUnsavedChanges) return; // Should already be disabled, but double-check

    // Confirmation dialog
    if (!window.confirm('Are you sure you want to discard all unsaved changes?')) {
      return;
    }

    // 1. Revert formValues state to originalConfig
    const originalFormValues = {
        name: originalConfig.name || '',
        tagline: originalConfig.tagline || '',
        logo: originalConfig.logo || '',
        primaryColor: originalConfig.primaryColor || '#FF6B35',
        secondaryColor: originalConfig.secondaryColor || '#4CB944',
        heroFont: originalConfig.heroFont || '#FFFFFF',
        heroImage: originalConfig.hero?.image || '',
        heroTitle: originalConfig.hero?.title || '',
        heroSubtitle: originalConfig.hero?.subtitle || '',
        aboutTitle: originalConfig.about?.title || '',
        aboutContent: originalConfig.about?.content || '',
        aboutImage: originalConfig.about?.image || '',
        contactEmail: originalConfig.contact?.email || '',
        contactPhone: originalConfig.contact?.phone || '',
        socialTwitter: originalConfig.socials?.twitter || '',
        socialInstagram: originalConfig.socials?.instagram || '',
        socialFacebook: originalConfig.socials?.facebook || '',
    };
    setFormValues(originalFormValues);

    // 2. Reset context state to originalConfig
    setContextConfig(originalConfig);

    // 3. Clean up any staged image previews (blob URLs)
    stagedImages.forEach(staged => {
      if (isBlobUrl(staged.previewUrl)) {
        revokeFilePreview(staged.previewUrl);
      }
    });

    // 4. Clear staged images state
    setStagedImages([]);

    // 5. Provide user feedback
    toast.info('Changes have been reset to the last saved state.');
  };

  return (
    <Card className="w-full border border-admin-border bg-admin-card shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-admin-foreground">
              {onSave ? 'Food Truck Configuration' : 'Customize Your Food Truck Website'}
            </CardTitle>
            <CardDescription className="text-admin-muted-foreground">
              {onSave ? 'Manage the configuration for this food truck website' : 'Customize the appearance and content of your food truck website'}
            </CardDescription>
          </div>
          
          {/* Admin mode controls */}
          {onSave && (
            <div className="hidden md:flex items-center gap-2 self-end md:self-auto">
              <Button
                onClick={handleSubmitChanges}
                disabled={isSaving}
                className="h-9 bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
              >
                {isSaving ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              
              {/* Version history drawer (admin only) */}
              <ConfigHistoryDrawer 
                onSelectVersion={handleSelectVersion} 
                currentConfig={createConfigFromFormValues()}
              />

              {/* Desktop Reset Button (Admin Mode) */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                disabled={!hasUnsavedChanges || isSaving || isSubmitting}
                className="h-9"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          )}
        </div>
        
        {/* Last saved indicator (admin only) */}
        {onSave && lastSaved && (
          <div className="text-xs text-admin-muted-foreground mt-1">
            Last saved: {formatLastSaved()}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs defaultValue="branding" className="w-full">
          <div className="flex pb-2 mb-4 overflow-x-auto no-scrollbar">
            <TabsList className="flex-nowrap bg-admin-secondary">
              <TabsTrigger value="branding" className="flex items-center gap-1 whitespace-nowrap">
                <Palette className="h-4 w-4" />
                <span>Branding</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-1 whitespace-nowrap">
                <Layout className="h-4 w-4" />
                <span>Hero</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-1 whitespace-nowrap">
                <Info className="h-4 w-4" />
                <span>About</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-1 whitespace-nowrap">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </TabsTrigger>
              <TabsTrigger value="socials" className="flex items-center gap-1 whitespace-nowrap">
                <Share2 className="h-4 w-4" />
                <span>Social</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content sections */}
          <TabsContent value="branding" className="space-y-4 text-admin-foreground">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Food Truck Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Enter your food truck name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  value={formValues.tagline}
                  onChange={handleInputChange}
                  placeholder="A catchy tagline for your food truck"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="logo">Logo</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="w-16 h-16 border rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                    {formValues.logo ? (
                      <img 
                        src={formValues.logo} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'logo')}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a logo image (PNG or JPG, square format recommended for best circular crop)
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Label className="mb-2 block">Brand Colors</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm">Primary Color</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <div 
                        className="w-10 h-10 rounded-md border shadow-sm" 
                        style={{ backgroundColor: formValues.primaryColor }}
                      />
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value={formValues.primaryColor}
                        onChange={handleColorChange}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm">Secondary Color</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <div 
                        className="w-10 h-10 rounded-md border shadow-sm" 
                        style={{ backgroundColor: formValues.secondaryColor }}
                      />
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        value={formValues.secondaryColor}
                        onChange={handleColorChange}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 border rounded-md bg-admin-secondary/10">
                  <h4 className="text-sm font-medium mb-2 text-admin-foreground">Color Preview</h4>
                  <div 
                    className="w-full h-8 rounded-md"
                    style={{ 
                      background: `linear-gradient(to right, ${formValues.primaryColor} 0%, ${formValues.secondaryColor} 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hero" className="space-y-4 text-admin-foreground">
            <div className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  name="heroTitle"
                  value={formValues.heroTitle}
                  onChange={handleInputChange}
                  placeholder="Main headline for your hero section"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={formValues.heroSubtitle}
                  onChange={handleInputChange}
                  placeholder="Supporting text for your hero section"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="heroFont">Hero Text Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <div 
                    className="w-10 h-10 rounded-md border shadow-sm" 
                    style={{ backgroundColor: formValues.heroFont }}
                  />
                  <Input
                    id="heroFont"
                    name="heroFont"
                    type="color"
                    value={formValues.heroFont}
                    onChange={handleColorChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>AI Generated Food Truck Model</Label>
                <div className="mt-1 p-4 border border-admin-border rounded-md bg-admin-card/50 flex flex-col items-center sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 flex flex-col items-center sm:items-start space-y-2">
                     <p className="text-sm text-admin-muted-foreground text-center sm:text-left">
                       Generate a unique 3D cartoon-style model of your truck based on a photo.
                       This will replace the current hero image.
                     </p>
                     {/* Display current heroImage if it exists */}
                     {formValues.heroImage && (
                       <div className="rounded-md overflow-hidden border border-admin-border w-40 sm:w-52 aspect-square relative bg-muted/30">
                         <img
                           src={formValues.heroImage}
                           alt="Current truck model preview"
                           className="absolute w-full h-full object-contain" // Use contain for square model
                         />
                       </div>
                     )}
                   </div>
                  <Button 
                    type="button" // Prevent form submission
                    onClick={() => setIsGenerateModalOpen(true)} 
                    className="mt-2 sm:mt-0 w-full sm:w-auto shrink-0 bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Generate Model
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4 text-admin-foreground">
            <div className="space-y-4">
              <div>
                <Label htmlFor="aboutTitle">About Section Title</Label>
                <Input
                  id="aboutTitle"
                  name="aboutTitle"
                  value={formValues.aboutTitle}
                  onChange={handleInputChange}
                  placeholder="Title for your about section"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="aboutContent">About Content</Label>
                <Textarea
                  id="aboutContent"
                  name="aboutContent"
                  value={formValues.aboutContent}
                  onChange={handleInputChange}
                  placeholder="Tell your story here..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <div>
                <Label htmlFor="aboutImage">About Image</Label>
                <div className="mt-1">
                  {formValues.aboutImage && (
                    <div className="mb-2 rounded-md overflow-hidden border w-full max-w-md">
                      <div className="relative w-full aspect-video">
                        <img 
                          src={formValues.aboutImage} 
                          alt="About section preview" 
                          className="absolute w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <Input
                    id="about-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'aboutImage')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image for your about section (16:9 aspect ratio recommended)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4 text-admin-foreground">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formValues.contactEmail}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formValues.contactPhone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="socials" className="space-y-4 text-admin-foreground">
            <div className="space-y-4">
              <div>
                <Label htmlFor="socialTwitter">Twitter/X</Label>
                <Input
                  id="socialTwitter"
                  name="socialTwitter"
                  value={formValues.socialTwitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourusername"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="socialInstagram">Instagram</Label>
                <Input
                  id="socialInstagram"
                  name="socialInstagram"
                  value={formValues.socialInstagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourusername"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="socialFacebook">Facebook</Label>
                <Input
                  id="socialFacebook"
                  name="socialFacebook"
                  value={formValues.socialFacebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Client mode submit button */}
      {!onSave && (
        <CardFooter className="flex justify-end border-t border-admin-border pt-4 gap-2">
          {/* Client Reset Button */}
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isSaving || isSubmitting}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Changes
          </Button>
          <Button
            onClick={handleSubmitChanges}
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
          >
            {isSaving ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Apply Changes
              </>
            )}
          </Button>
        </CardFooter>
      )}

      {/* Admin mode mobile submit button */}
      {onSave && (
        <CardFooter className="md:hidden flex flex-col gap-3 border-t border-admin-border pt-4">
          <Button
            onClick={handleSubmitChanges}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90"
          >
            {isSaving ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          
          {/* Version history drawer (mobile only) */}
          <ConfigHistoryDrawer 
            onSelectVersion={handleSelectVersion} 
            currentConfig={createConfigFromFormValues()}
          />

          {/* Mobile Reset Button (Admin Mode) */}
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isSaving || isSubmitting}
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Changes
          </Button>
        </CardFooter>
      )}

      {/* Status message */}
      {statusMessage && (
        <div className="p-4">
          <Alert variant={statusMessage === 'success' ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {statusMessage === 'success' ? (
                <CheckCircle className="h-4 w-4 text-admin-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-admin-destructive" />
              )}
              <AlertDescription className={statusMessage === 'success' ? 'text-admin-foreground' : 'text-admin-destructive'}>
                {statusMessage === 'success' 
                  ? 'Changes applied successfully!' 
                  : 'Failed to apply changes. Please try again.'}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      {/* Render the ImageEditorModal */}
      {editingFileUrl && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={handleCancelCrop}
          imageSrc={editingFileUrl}
          aspect={editorConfig.aspect}
          circularCrop={editorConfig.circularCrop}
          onSave={handleSaveCrop}
        />
      )}

      {/* Render the AI Model Generation Modal */}
      <GenerateModelModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerateComplete={handleModelGenerated}
      />
    </Card>
  );
}

// Backward compatibility components
export function ConfigForm() {
  return (
    <ConfigProvider> 
       <UnifiedConfigForm />
    </ConfigProvider>
  );
}

export function AdminConfigForm(props: Omit<UnifiedConfigFormProps, 'mode'>) {
  return <UnifiedConfigForm {...props} />;
} 