'use client';

import { useState } from 'react';
import { UnifiedConfigProvider } from './UnifiedConfigProvider';
import { UnifiedConfigWrapper } from './UnifiedConfigWrapper';
import { UnifiedConfigForm } from './UnifiedConfigForm';
import { UnifiedLivePreview } from './UnifiedLivePreview';
import { FoodTruckConfig } from '@/components/food-truck-website';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Example component to demonstrate the usage of unified components
export function TestUnifiedComponents() {
  const [mode, setMode] = useState<'admin' | 'client'>('client');
  const [initialConfig, setInitialConfig] = useState<FoodTruckConfig>({
    name: 'Test Food Truck',
    tagline: 'Testing the unified components',
    logo: '/images/placeholder-logo.jpg',
    primaryColor: '#FF6B35',
    secondaryColor: '#4CB944',
    hero: {
      image: '/images/placeholder-hero.jpg',
      title: 'Test Hero Title',
      subtitle: 'Test Hero Subtitle'
    },
    about: {
      title: 'About Test Food Truck',
      content: 'This is a test food truck for demonstrating the unified components.',
      image: '/images/placeholder-about.jpg'
    },
    contact: {
      email: 'test@example.com',
      phone: '123-456-7890',
      address: '123 Test St, Test City, TC 12345'
    },
    socials: {
      twitter: 'https://twitter.com/test',
      instagram: 'https://instagram.com/test',
      facebook: 'https://facebook.com/test'
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showIndividualComponents, setShowIndividualComponents] = useState(false);

  // Mock save function
  const handleSave = async (config: FoodTruckConfig) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setInitialConfig(config);
    setLastSaved(new Date());
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Unified Components Test</CardTitle>
          <CardDescription>
            This page demonstrates the usage of the unified config components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'admin' | 'client')}>
            <TabsList className="mb-4">
              <TabsTrigger value="client">Client Mode</TabsTrigger>
              <TabsTrigger value="admin">Admin Mode</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-4 mb-4">
            <Button onClick={() => setLastSaved(new Date())}>
              Simulate Save
            </Button>
            <Button variant="outline" onClick={() => setIsSaving(!isSaving)}>
              Toggle Saving State
            </Button>
            <Button variant="secondary" onClick={() => setShowIndividualComponents(!showIndividualComponents)}>
              {showIndividualComponents ? 'Show Wrapper' : 'Show Individual Components'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mb-8">
            <p>Current Mode: <strong>{mode}</strong></p>
            <p>Is Saving: <strong>{isSaving ? 'Yes' : 'No'}</strong></p>
            <p>Last Saved: <strong>{lastSaved ? lastSaved.toLocaleString() : 'Never'}</strong></p>
          </div>
        </CardContent>
      </Card>
      
      {/* Using the unified components */}
      <UnifiedConfigProvider 
        mode={mode} 
        initialConfig={initialConfig}
        onSave={mode === 'admin' ? handleSave : undefined}
      >
        {showIndividualComponents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Form Component</h2>
              <UnifiedConfigForm 
                mode={mode}
                initialConfig={initialConfig}
                onSave={handleSave}
                isSaving={isSaving}
                lastSaved={lastSaved}
                userId="test-user-id"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Preview Component</h2>
              <UnifiedLivePreview 
                mode={mode}
                config={mode === 'admin' ? initialConfig : undefined}
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Wrapper Component</h2>
            <UnifiedConfigWrapper 
              mode={mode}
              initialConfig={initialConfig}
              onSave={handleSave}
              isSaving={isSaving}
              lastSaved={lastSaved}
              userId="test-user-id"
            />
          </>
        )}
      </UnifiedConfigProvider>
    </div>
  );
} 