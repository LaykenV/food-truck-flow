'use client';

import { useConfig } from './ConfigProvider';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, Palette, Layout, Type } from 'lucide-react';

export function ConfigForm() {
  const { config, setConfig } = useConfig();
  const [formValues, setFormValues] = useState({
    name: config.name,
    tagline: config.tagline,
    logo: config.logo,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    heroImage: config.hero.image,
    heroTitle: config.hero.title,
    heroSubtitle: config.hero.subtitle
  });

  // Initialize form values from config only once on mount
  useEffect(() => {
    setFormValues({
      name: config.name,
      tagline: config.tagline,
      logo: config.logo,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      heroImage: config.hero.image,
      heroTitle: config.hero.title,
      heroSubtitle: config.hero.subtitle
    });
  }, []);

  // Handle form submission to update config
  const handleSubmitChanges = () => {
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
      }
    };
    setConfig(newConfig);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <CardHeader>
        <CardTitle>Customize Your Food Truck Website</CardTitle>
        <CardDescription>
          Configure your website's appearance and content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="branding" className="flex flex-col items-center gap-1 py-2 sm:flex-row sm:gap-2">
              <Type className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex flex-col items-center gap-1 py-2 sm:flex-row sm:gap-2">
              <Palette className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="flex flex-col items-center gap-1 py-2 sm:flex-row sm:gap-2">
              <Layout className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex flex-col items-center gap-1 py-2 sm:flex-row sm:gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Images</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="branding" className="space-y-4">
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-4">
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
          
          <TabsContent value="hero" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  name="heroTitle"
                  value={formValues.heroTitle}
                  onChange={handleInputChange}
                  placeholder="Enter a compelling headline"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={formValues.heroSubtitle}
                  onChange={handleInputChange}
                  placeholder="Enter a supporting subtitle"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="images" className="space-y-4">
            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo</Label>
                {formValues.logo && (
                  <div className="mb-2 p-2 border rounded-md bg-muted/20">
                    <img 
                      src={formValues.logo} 
                      alt="Logo preview" 
                      className="h-16 object-contain mx-auto"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logoUpload')?.click()}
                    className="w-full sm:w-auto"
                  >
                    Upload Logo
                  </Button>
                  <Input
                    type="text"
                    name="logo"
                    value={formValues.logo}
                    onChange={handleInputChange}
                    placeholder="Or enter image URL"
                    className="flex-1 mt-2 sm:mt-0"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label htmlFor="heroImage">Hero Background</Label>
                {formValues.heroImage && (
                  <div className="mb-2 p-2 border rounded-md bg-muted/20">
                    <img 
                      src={formValues.heroImage} 
                      alt="Hero image preview" 
                      className="h-32 w-full object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="file"
                    id="heroImageUpload"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'heroImage')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('heroImageUpload')?.click()}
                    className="w-full sm:w-auto"
                  >
                    Upload Hero Image
                  </Button>
                  <Input
                    type="text"
                    name="heroImage"
                    value={formValues.heroImage}
                    onChange={handleInputChange}
                    placeholder="Or enter image URL"
                    className="flex-1 mt-2 sm:mt-0"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmitChanges}
            className="bg-primary text-white"
          >
            Apply Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 