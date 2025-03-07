'use client';

import { useState, useEffect } from 'react';
import { FoodTruckConfig } from '@/components/food-truck-website';
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
  Type, 
  Info, 
  Phone, 
  Save, 
  RefreshCw,
  Building,
  Link as LinkIcon,
  Share2
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { ConfigHistoryDrawer } from './ConfigHistoryDrawer';
import { useConfig } from './UnifiedConfigProvider';

// Define the type for the form mode
export type FormMode = 'admin' | 'client';

// Props for the UnifiedConfigForm
interface UnifiedConfigFormProps {
  mode: FormMode;
  initialConfig?: FoodTruckConfig;
  onSave?: (config: FoodTruckConfig) => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  userId?: string;
}

export function UnifiedConfigForm({ 
  mode = 'client',
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
    heroImage: configToUse.hero?.image || '',
    heroTitle: configToUse.hero?.title || '',
    heroSubtitle: configToUse.hero?.subtitle || '',
    aboutTitle: configToUse.about?.title || '',
    aboutContent: configToUse.about?.content || '',
    aboutImage: configToUse.about?.image || '',
    contactEmail: configToUse.contact?.email || '',
    contactPhone: configToUse.contact?.phone || '',
    contactAddress: configToUse.contact?.address || '',
    socialTwitter: configToUse.socials?.twitter || '',
    socialInstagram: configToUse.socials?.instagram || '',
    socialFacebook: configToUse.socials?.facebook || '',
  });

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
        heroImage: initialConfig.hero?.image || '',
        heroTitle: initialConfig.hero?.title || '',
        heroSubtitle: initialConfig.hero?.subtitle || '',
        aboutTitle: initialConfig.about?.title || '',
        aboutContent: initialConfig.about?.content || '',
        aboutImage: initialConfig.about?.image || '',
        contactEmail: initialConfig.contact?.email || '',
        contactPhone: initialConfig.contact?.phone || '',
        contactAddress: initialConfig.contact?.address || '',
        socialTwitter: initialConfig.socials?.twitter || '',
        socialInstagram: initialConfig.socials?.instagram || '',
        socialFacebook: initialConfig.socials?.facebook || '',
      });
    }
  }, [initialConfig]);

  // Create a new config object from form values
  const createConfigFromFormValues = (): FoodTruckConfig => {
    return {
      name: formValues.name,
      tagline: formValues.tagline,
      logo: formValues.logo,
      primaryColor: formValues.primaryColor,
      secondaryColor: formValues.secondaryColor,
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
        phone: formValues.contactPhone,
        address: formValues.contactAddress
      },
      socials: {
        twitter: formValues.socialTwitter,
        instagram: formValues.socialInstagram,
        facebook: formValues.socialFacebook
      }
    };
  };

  // Handle form submission to update config
  const handleSubmitChanges = async () => {
    if (mode === 'admin' && onSave) {
      // Admin mode - use the provided onSave function
      try {
        setIsSubmitting(true);
        const newConfig = createConfigFromFormValues();
        await onSave(newConfig);
        // The toast notification will be handled by the parent component
      } catch (error) {
        console.error('Error saving changes:', error);
        toast.error('Error saving changes. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Client mode - use the context's setConfig function
      setIsSubmitting(true);
      setStatusMessage('');
      
      try {
        const newConfig = createConfigFromFormValues();
        setContextConfig(newConfig);
        setStatusMessage('success');
        
        // Clear status message after 3 seconds
        setTimeout(() => {
          setStatusMessage('');
        }, 3000);
      } catch (error) {
        setStatusMessage('error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form to default values (client mode only)
  const handleReset = () => {
    if (mode !== 'client') return;
    
    const defaultValues = {
      name: 'Food Truck Name',
      tagline: 'Tasty meals on wheels',
      logo: '',
      primaryColor: '#FF6B35',
      secondaryColor: '#4CB944',
      heroImage: '/images/placeholder-hero.jpg',
      heroTitle: 'Delicious Food Truck',
      heroSubtitle: 'Serving the best street food in town',
      aboutTitle: 'About Our Food Truck',
      aboutContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      aboutImage: '',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '123 Main Street, City, State 12345',
      socialTwitter: '',
      socialInstagram: '',
      socialFacebook: '',
    };
    
    setFormValues(defaultValues);
    setStatusMessage('reset');
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
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

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormValues(prev => ({
          ...prev,
          [fieldName]: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
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
      heroImage: config.hero?.image || '',
      heroTitle: config.hero?.title || '',
      heroSubtitle: config.hero?.subtitle || '',
      aboutTitle: config.about?.title || '',
      aboutContent: config.about?.content || '',
      aboutImage: config.about?.image || '',
      contactEmail: config.contact?.email || '',
      contactPhone: config.contact?.phone || '',
      contactAddress: config.contact?.address || '',
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
              {mode === 'admin' ? 'Food Truck Configuration' : 'Customize Your Food Truck Website'}
            </CardTitle>
            <CardDescription>
              {mode === 'admin' 
                ? 'Manage the configuration for this food truck website' 
                : 'Customize the appearance and content of your food truck website'}
            </CardDescription>
          </div>
          
          {/* Admin mode controls */}
          {mode === 'admin' && (
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="h-9"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
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
              {userId && (
                <ConfigHistoryDrawer 
                  userId={userId} 
                  onSelectVersion={handleSelectVersion} 
                />
              )}
            </div>
          )}
        </div>
        
        {/* Last saved indicator (admin only) */}
        {mode === 'admin' && lastSaved && (
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
              {mode === 'admin' && (
                <TabsTrigger value="json" className="flex items-center gap-1 whitespace-nowrap">
                  <Type className="h-4 w-4" />
                  <span>JSON</span>
                </TabsTrigger>
              )}
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
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a logo image (PNG or JPG, square format recommended)
                    </p>
                  </div>
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
                    onChange={(e) => handleFileUpload(e, 'heroImage')}
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
                    onChange={(e) => handleFileUpload(e, 'aboutImage')}
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
              
              <div>
                <Label htmlFor="contactAddress">Address</Label>
                <Textarea
                  id="contactAddress"
                  name="contactAddress"
                  value={formValues.contactAddress}
                  onChange={handleInputChange}
                  placeholder="Your food truck's primary location or address"
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
      {mode === 'client' && (
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
    </Card>
  );
}

// Backward compatibility components
export function ConfigForm() {
  return <UnifiedConfigForm mode="client" />;
}

export function AdminConfigForm(props: Omit<UnifiedConfigFormProps, 'mode'>) {
  return <UnifiedConfigForm mode="admin" {...props} />;
} 