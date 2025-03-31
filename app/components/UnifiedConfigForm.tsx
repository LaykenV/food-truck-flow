'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { ConfigHistoryDrawer } from './ConfigHistoryDrawer';
import { useConfig } from './UnifiedConfigProvider';
import { uploadImage } from '@/utils/storage-utils';
import { createFilePreview, revokeFilePreview, isBlobUrl } from '@/utils/file-utils';

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
  const configToUse = initialConfig || contextConfig;
  
  const [formValues, setFormValues] = useState({
    name: configToUse.name || '',
    tagline: configToUse.tagline || '',
    logo: configToUse.logo || '',
    primaryColor: configToUse.primaryColor || '#FF6B35',
    secondaryColor: configToUse.secondaryColor || '#4CB944',
    heroFont: configToUse.heroFont || '#FFFFFF',
    heroImage: configToUse.hero?.image || '',
    heroTitle: configToUse.hero?.title || '',
    heroSubtitle: configToUse.hero?.subtitle || '',
    aboutTitle: configToUse.about?.title || '',
    aboutContent: configToUse.about?.content || '',
    aboutImage: configToUse.about?.image || '',
    contactEmail: configToUse.contact?.email || '',
    contactPhone: configToUse.contact?.phone || '',
    socialTwitter: configToUse.socials?.twitter || '',
    socialInstagram: configToUse.socials?.instagram || '',
    socialFacebook: configToUse.socials?.facebook || '',
  });

  // Store staged image files that will be uploaded on form submit
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>("branding");
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setFormValues({
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
      });
      
      // Clear any staged images when initialConfig changes
      setStagedImages([]);
    }
  }, [initialConfig]);

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

  // Create a new config object from form values
  const createConfigFromFormValues = (): FoodTruckConfig => {
    return {
      name: formValues.name,
      tagline: formValues.tagline,
      logo: formValues.logo,
      primaryColor: formValues.primaryColor,
      secondaryColor: formValues.secondaryColor,
      heroFont: formValues.heroFont,
      hero: {
        image: formValues.heroImage,
        title: formValues.heroTitle,
        subtitle: formValues.heroSubtitle
      },
      about: {
        title: formValues.aboutTitle,
        content: formValues.aboutContent,
        image: formValues.aboutImage
      },
      contact: {
        email: formValues.contactEmail,
        phone: formValues.contactPhone
      },
      socials: {
        twitter: formValues.socialTwitter,
        instagram: formValues.socialInstagram,
        facebook: formValues.socialFacebook
      },
      schedule: {
        title: configToUse.schedule?.title || 'Weekly Schedule',
        description: configToUse.schedule?.description || 'Find us at these locations throughout the week',
        days: configToUse.schedule?.days || []
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
        // Client mode - use the context's setConfig function
        setContextConfig(updatedConfig);
        setStatusMessage('success');
        
        // Update the context config to trigger a preview update
        setContextConfig(updatedConfig);
        
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

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection with preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL
    const previewUrl = createFilePreview(file);
    
    // Update form values with the preview URL for immediate display
    setFormValues(prev => ({
      ...prev,
      [fieldName]: previewUrl
    }));
    
    // Stage the image for upload during form submission
    setStagedImages(prev => {
      // Remove any existing staged image for this field
      const filtered = prev.filter(img => img.fieldName !== fieldName);
      // Add the new staged image
      return [...filtered, { file, previewUrl, fieldName }];
    });
    
    // Notify the user that the image will be uploaded when they save
    toast.info(`Image selected. It will be uploaded when you save changes.`);
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
    toast.info('Restored configuration from history. Click Save to apply changes.');
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">
              {onSave ? 'Food Truck Configuration' : 'Customize Your Food Truck Website'}
            </CardTitle>
            <CardDescription>
              {onSave ? 'Manage the configuration for this food truck website' : 'Customize the appearance and content of your food truck website'}
            </CardDescription>
          </div>
          
          {/* Admin mode controls */}
          {onSave && (
            <div className="hidden md:flex items-center gap-2 self-end md:self-auto">
              <Button
                onClick={handleSubmitChanges}
                disabled={isSaving}
                className="h-9"
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
            </div>
          )}
        </div>
        
        {/* Last saved indicator (admin only) */}
        {onSave && lastSaved && (
          <div className="text-xs text-muted-foreground mt-1">
            Last saved: {formatLastSaved()}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs defaultValue="branding" className="w-full">
          <div className="flex pb-2 mb-4 overflow-x-auto no-scrollbar">
            <TabsList className="flex-nowrap">
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
          <TabsContent value="branding" className="space-y-4">
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
                  <div className="w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                    {formValues.logo ? (
                      <img 
                        src={formValues.logo} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
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
                      Upload a logo image (PNG or JPG, square format recommended)
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">Color Preview</h4>
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
          
          <TabsContent value="hero" className="space-y-4">
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
                    onChange={handleInputChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="heroImage">Hero Background Image</Label>
                <div className="mt-1">
                  {formValues.heroImage && (
                    <div className="mb-2 rounded-md overflow-hidden border">
                      <img 
                        src={formValues.heroImage} 
                        alt="Hero preview" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="hero-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'heroImage')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a high-quality image for your hero background (recommended: 1920x1080px)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4">
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
                    <div className="mb-2 rounded-md overflow-hidden border">
                      <img 
                        src={formValues.aboutImage} 
                        alt="About section preview" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="about-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'aboutImage')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image for your about section (recommended: square format)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
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
          
          <TabsContent value="socials" className="space-y-4">
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
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            onClick={handleSubmitChanges}
            disabled={isSaving}
            className="w-full md:w-auto"
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
        <CardFooter className="md:hidden flex justify-end border-t pt-4">
          <Button
            onClick={handleSubmitChanges}
            disabled={isSaving}
            className="w-full"
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
        </CardFooter>
      )}

      {/* Status message */}
      {statusMessage && (
        <div className="p-4">
          <Alert variant={statusMessage === 'success' ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {statusMessage === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {statusMessage === 'success' 
                  ? 'Changes applied successfully!' 
                  : 'Failed to apply changes. Please try again.'}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
    </Card>
  );
}

// Backward compatibility components
export function ConfigForm() {
  return <UnifiedConfigForm />;
}

export function AdminConfigForm(props: Omit<UnifiedConfigFormProps, 'mode'>) {
  return <UnifiedConfigForm {...props} />;
} 