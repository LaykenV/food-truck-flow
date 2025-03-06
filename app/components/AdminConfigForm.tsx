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
  LinkIcon,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfigHistoryDrawer } from './ConfigHistoryDrawer';

interface AdminConfigFormProps {
  initialConfig: FoodTruckConfig;
  onSave: (config: FoodTruckConfig) => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
  userId?: string;
}

export function AdminConfigForm({ 
  initialConfig, 
  onSave, 
  isSaving = false, 
  lastSaved = null,
  userId
}: AdminConfigFormProps) {
  const [formValues, setFormValues] = useState({
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

  const [activeTab, setActiveTab] = useState<string>("branding");

  // Update form values when initialConfig changes
  useEffect(() => {
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
  }, [initialConfig]);

  // Handle form submission to update config
  const handleSubmitChanges = async () => {
    try {
      const newConfig: FoodTruckConfig = {
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
      
      await onSave(newConfig);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error saving changes. Please try again.');
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

  // Format the last saved date
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

  // Handle selecting a version from history
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
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Customize Your Website</CardTitle>
        <CardDescription>
          Configure your food truck website's appearance and content
          {lastSaved && (
            <div className="text-xs text-muted-foreground mt-1">
              Last saved: {formatLastSaved()}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto pr-4 pb-4">
          <div className="px-6">
            <Tabs 
              defaultValue="branding" 
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="w-full h-auto flex flex-wrap justify-start mb-6 bg-transparent p-0 gap-1">
                <TabsTrigger 
                  value="branding" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <Type className="h-4 w-4 mr-2" />
                  <span>Branding</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="colors" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  <span>Colors</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hero" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  <span>Hero</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <Info className="h-4 w-4 mr-2" />
                  <span>About</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Contact</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Social Media</span>
                </TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      value={formValues.tagline}
                      onChange={handleInputChange}
                      placeholder="A short, catchy phrase about your food truck"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="logo">Logo</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      {formValues.logo && (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={formValues.logo} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          className="w-full"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {formValues.logo ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: formValues.primaryColor }}
                      ></div>
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value={formValues.primaryColor}
                        onChange={handleInputChange}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formValues.primaryColor}
                        onChange={handleInputChange}
                        name="primaryColor"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Used for buttons, headings, and accents
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: formValues.secondaryColor }}
                      ></div>
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        value={formValues.secondaryColor}
                        onChange={handleInputChange}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formValues.secondaryColor}
                        onChange={handleInputChange}
                        name="secondaryColor"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Used for secondary elements and highlights
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Hero Tab */}
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="heroImage">Hero Background Image</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      {formValues.heroImage && (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={formValues.heroImage} 
                            alt="Hero" 
                            className="max-w-full max-h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="hero-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'heroImage')}
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('hero-upload')?.click()}
                          className="w-full"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {formValues.heroImage ? 'Change Image' : 'Upload Image'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* About Tab */}
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="aboutContent">About Content</Label>
                    <Textarea
                      id="aboutContent"
                      name="aboutContent"
                      value={formValues.aboutContent}
                      onChange={handleInputChange}
                      placeholder="Tell your story and what makes your food truck special"
                      rows={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="aboutImage">About Image</Label>
                    <div className="flex items-center gap-4 mt-1.5">
                      {formValues.aboutImage && (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={formValues.aboutImage} 
                            alt="About" 
                            className="max-w-full max-h-full object-cover" 
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="about-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'aboutImage')}
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('about-upload')?.click()}
                          className="w-full"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {formValues.aboutImage ? 'Change Image' : 'Upload Image'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Contact Tab */}
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formValues.contactPhone}
                      onChange={handleInputChange}
                      placeholder="(123) 456-7890"
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
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="socialTwitter">Twitter/X</Label>
                    <Input
                      id="socialTwitter"
                      name="socialTwitter"
                      value={formValues.socialTwitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/yourusername"
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
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-6 bg-muted/20 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          {userId && (
            <ConfigHistoryDrawer 
              userId={userId} 
              onSelectVersion={handleSelectVersion} 
            />
          )}
        </div>
        
        <div className="flex ml-auto">
          <Button 
            onClick={handleSubmitChanges}
            disabled={isSaving}
            size="default"
            className="font-medium"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 