'use client';

import { useConfig } from './ConfigProvider';
import { useState, useEffect } from 'react';
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
  Link as LinkIcon
} from 'lucide-react';

export function ConfigForm() {
  const { config, setConfig } = useConfig();
  const [formValues, setFormValues] = useState({
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Initialize form values from config only once on mount
  useEffect(() => {
    setFormValues({
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
    });
  }, []);

  // Handle form submission to update config
  const handleSubmitChanges = () => {
    setIsSubmitting(true);
    setStatusMessage('');
    
    try {
      const newConfig = {
        ...config,
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
      
      setConfig(newConfig);
      setStatusMessage('Changes saved successfully!');
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      setStatusMessage('Error saving changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to default values
  const handleReset = () => {
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
    setStatusMessage('Form reset to default values. Click Save to apply changes.');
    
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Customize Your Website</CardTitle>
        <CardDescription>
          Configure your food truck website's appearance and content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-12rem)] md:max-h-none overflow-y-auto pr-4">
          <div className="px-6">
            <Tabs defaultValue="branding" className="w-full">
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
                  value="socials" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  <span>Social</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="images" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 h-auto"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  <span>Images</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="branding" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      placeholder="Enter your food truck name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      value={formValues.tagline}
                      onChange={handleInputChange}
                      placeholder="Enter a catchy tagline"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A short phrase that describes your food truck
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="colors" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Input
                          type="color"
                          id="primaryColor"
                          name="primaryColor"
                          value={formValues.primaryColor}
                          onChange={handleInputChange}
                          className="h-10 w-10 p-1 cursor-pointer"
                        />
                      </div>
                      <Input
                        type="text"
                        name="primaryColor"
                        value={formValues.primaryColor}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for buttons, links, and accents
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Input
                          type="color"
                          id="secondaryColor"
                          name="secondaryColor"
                          value={formValues.secondaryColor}
                          onChange={handleInputChange}
                          className="h-10 w-10 p-1 cursor-pointer"
                        />
                      </div>
                      <Input
                        type="text"
                        name="secondaryColor"
                        value={formValues.secondaryColor}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for gradients and secondary elements
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="p-4 rounded-md" style={{ background: `linear-gradient(to right, ${formValues.primaryColor}, ${formValues.secondaryColor})` }}>
                      <p className="text-white text-center font-medium">Color Preview</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hero" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      name="heroTitle"
                      value={formValues.heroTitle}
                      onChange={handleInputChange}
                      placeholder="Enter a title for your hero section"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input
                      id="heroSubtitle"
                      name="heroSubtitle"
                      value={formValues.heroSubtitle}
                      onChange={handleInputChange}
                      placeholder="Enter a subtitle for your hero section"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="heroImage">Hero Background Image URL</Label>
                    <Input
                      id="heroImage"
                      name="heroImage"
                      value={formValues.heroImage}
                      onChange={handleInputChange}
                      placeholder="Enter a URL for your hero background image"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can also upload an image in the Images tab
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="aboutTitle">About Section Title</Label>
                    <Input
                      id="aboutTitle"
                      name="aboutTitle"
                      value={formValues.aboutTitle}
                      onChange={handleInputChange}
                      placeholder="Enter a title for your about section"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="aboutContent">About Content</Label>
                    <Textarea
                      id="aboutContent"
                      name="aboutContent"
                      value={formValues.aboutContent}
                      onChange={handleInputChange}
                      placeholder="Tell your story"
                      rows={5}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="aboutImage">About Image URL</Label>
                    <Input
                      id="aboutImage"
                      name="aboutImage"
                      value={formValues.aboutImage}
                      onChange={handleInputChange}
                      placeholder="Enter a URL for your about section image"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Email Address</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formValues.contactEmail}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formValues.contactPhone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactAddress">Address</Label>
                    <Textarea
                      id="contactAddress"
                      name="contactAddress"
                      value={formValues.contactAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="socials" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="socialFacebook">Facebook URL</Label>
                    <Input
                      id="socialFacebook"
                      name="socialFacebook"
                      value={formValues.socialFacebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="socialInstagram">Instagram URL</Label>
                    <Input
                      id="socialInstagram"
                      name="socialInstagram"
                      value={formValues.socialInstagram}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="socialTwitter">Twitter URL</Label>
                    <Input
                      id="socialTwitter"
                      name="socialTwitter"
                      value={formValues.socialTwitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="logoUpload">Logo Image</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        className="cursor-pointer"
                      />
                      {formValues.logo && (
                        <div className="mt-2 relative h-20 w-20 border rounded-md overflow-hidden">
                          <img 
                            src={formValues.logo} 
                            alt="Logo preview" 
                            className="object-contain w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="heroImageUpload">Hero Background Image</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="heroImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'heroImage')}
                        className="cursor-pointer"
                      />
                      {formValues.heroImage && (
                        <div className="mt-2 relative h-32 border rounded-md overflow-hidden">
                          <img 
                            src={formValues.heroImage} 
                            alt="Hero image preview" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="aboutImageUpload">About Section Image</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="aboutImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'aboutImage')}
                        className="cursor-pointer"
                      />
                      {formValues.aboutImage && (
                        <div className="mt-2 relative h-32 border rounded-md overflow-hidden">
                          <img 
                            src={formValues.aboutImage} 
                            alt="About image preview" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-6 pb-4 px-6 border-t mt-4">
        {statusMessage && (
          <div className={`w-full mb-4 p-3 rounded-md text-sm ${statusMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {statusMessage}
          </div>
        )}
        
        <div className="flex w-full sm:w-auto gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="gap-1 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleSubmitChanges} 
            disabled={isSubmitting}
            className="gap-1 w-full sm:w-auto"
            style={{ 
              backgroundColor: formValues.primaryColor,
              color: 'white'
            }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 