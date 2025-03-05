'use client';

import { useConfig } from './ConfigProvider';
import { useState, useEffect } from 'react';

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

  // Update the config when form values change
  useEffect(() => {
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
  }, [formValues, setConfig]);

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
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="px-6 py-8 sm:p-10">
        <h3 className="text-xl font-medium text-gray-900 mb-6">Food Truck Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formValues.tagline}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="flex flex-col space-y-2">
                  {formValues.logo && (
                    <div className="mb-2">
                      <img 
                        src={formValues.logo} 
                        alt="Logo preview" 
                        className="h-16 object-contain border border-gray-200 rounded p-1"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="logoUpload"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('logoUpload')?.click()}
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Upload Logo
                    </button>
                    <input
                      type="text"
                      name="logo"
                      value={formValues.logo}
                      onChange={handleInputChange}
                      placeholder="Or enter image URL"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colors */}
          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Brand Colors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formValues.primaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formValues.primaryColor}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formValues.secondaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={formValues.secondaryColor}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="col-span-2">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Hero Section</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Image
                </label>
                <div className="flex flex-col space-y-2">
                  {formValues.heroImage && (
                    <div className="mb-2">
                      <img 
                        src={formValues.heroImage} 
                        alt="Hero image preview" 
                        className="h-32 w-full object-cover border border-gray-200 rounded"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="heroImageUpload"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'heroImage')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('heroImageUpload')?.click()}
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Upload Hero Image
                    </button>
                    <input
                      type="text"
                      name="heroImage"
                      value={formValues.heroImage}
                      onChange={handleInputChange}
                      placeholder="Or enter image URL"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Title
                </label>
                <input
                  type="text"
                  id="heroTitle"
                  name="heroTitle"
                  value={formValues.heroTitle}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={formValues.heroSubtitle}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 