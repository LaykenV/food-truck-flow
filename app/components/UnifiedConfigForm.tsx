'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Share2,
  Calendar,
  Plus,
  Trash2,
  MapPin,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { ConfigHistoryDrawer } from './ConfigHistoryDrawer';
import { useConfig } from './UnifiedConfigProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
    scheduleTitle: configToUse.schedule?.title || 'Weekly Schedule',
    scheduleDescription: configToUse.schedule?.description || 'Find us at these locations throughout the week',
    scheduleDays: configToUse.schedule?.days || [],
  });

  const [activeTab, setActiveTab] = useState<string>("branding");
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<{index: number, day: any} | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeValues, setTimeValues] = useState({
    startHour: "11",
    startMinute: "00",
    startAmPm: "AM",
    endHour: "2",
    endMinute: "00",
    endAmPm: "PM"
  });

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
        scheduleTitle: initialConfig.schedule?.title || 'Weekly Schedule',
        scheduleDescription: initialConfig.schedule?.description || 'Find us at these locations throughout the week',
        scheduleDays: initialConfig.schedule?.days || [],
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
      },
      schedule: {
        title: formValues.scheduleTitle,
        description: formValues.scheduleDescription,
        days: formValues.scheduleDays
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
      scheduleTitle: config.schedule?.title || 'Weekly Schedule',
      scheduleDescription: config.schedule?.description || 'Find us at these locations throughout the week',
      scheduleDays: config.schedule?.days || [],
    };
    
    setFormValues(updatedFormValues);
    toast.info('Restored configuration from history. Click Save to apply changes.');
  };

  // Group consecutive days at the same location
  const groupedScheduleDays = useMemo(() => {
    const days = [...formValues.scheduleDays];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Sort days by day of week
    days.sort((a, b) => {
      return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    });
    
    // Group consecutive days at the same location
    const groups: any[] = [];
    let currentGroup: any[] = [];
    
    days.forEach((day, index) => {
      if (index === 0) {
        currentGroup.push(day);
      } else {
        const prevDay = days[index - 1];
        const prevDayIndex = daysOfWeek.indexOf(prevDay.day);
        const currentDayIndex = daysOfWeek.indexOf(day.day);
        
        // Check if days are consecutive and at the same location
        const isConsecutive = (currentDayIndex === prevDayIndex + 1) || 
                             (prevDayIndex === 6 && currentDayIndex === 0); // Sunday to Monday
        const isSameLocation = day.location === prevDay.location && 
                              day.address === prevDay.address &&
                              day.hours === prevDay.hours;
        
        if (isConsecutive && isSameLocation) {
          currentGroup.push(day);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [day];
        }
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [formValues.scheduleDays]);

  // Handle opening the schedule day modal
  const handleOpenScheduleModal = (index: number) => {
    const day = formValues.scheduleDays[index];
    setSelectedScheduleDay({ index, day });
    // Initialize selectedDays with the current day to fix checkbox behavior
    setSelectedDays(day ? [day.day] : []);
    
    // Parse hours for time values if available
    if (day && day.hours) {
      try {
        const hoursParts = day.hours.split(' - ');
        if (hoursParts.length === 2) {
          const startParts = hoursParts[0].split(' ');
          const endParts = hoursParts[1].split(' ');
          
          if (startParts.length === 2 && endParts.length === 2) {
            const [startTime, startAmPm] = startParts;
            const [endTime, endAmPm] = endParts;
            
            const [startHour, startMinute] = startTime.split(':');
            const [endHour, endMinute] = endTime.split(':');
            
            setTimeValues({
              startHour,
              startMinute,
              startAmPm,
              endHour,
              endMinute,
              endAmPm
            });
          }
        }
      } catch (error) {
        console.error('Error parsing hours:', error);
      }
    }
  };

  // Handle adding multiple schedule days
  const handleAddMultipleScheduleDays = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }

    // Format the hours string
    const hoursString = `${timeValues.startHour}:${timeValues.startMinute} ${timeValues.startAmPm} - ${timeValues.endHour}:${timeValues.endMinute} ${timeValues.endAmPm}`;

    // Create new days
    const newDays = selectedDays.map(day => ({
      day,
      location: selectedScheduleDay?.day.location || '',
      address: selectedScheduleDay?.day.address || '',
      hours: hoursString
    }));

    // Add new days to the schedule
    setFormValues(prev => ({
      ...prev,
      scheduleDays: [...prev.scheduleDays, ...newDays]
    }));

    // Clear selected days
    setSelectedDays([]);
    setSelectedScheduleDay(null);
  };

  // Toggle day selection
  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev => {
      // If this day is already in the array, remove it
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } 
      // Otherwise add it to the array
      return [...prev, day];
    });
  };

  // Handle time change
  const handleTimeChange = (field: string, value: string) => {
    setTimeValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle removing a schedule day
  const handleRemoveScheduleDay = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.filter((_, i) => i !== index)
    }));
  };

  // Handle saving schedule day from modal
  const handleSaveScheduleDay = (day: any) => {
    if (selectedScheduleDay === null) return;
    
    setFormValues(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.map((d, i) => 
        i === selectedScheduleDay.index ? day : d
      )
    }));
    
    setSelectedScheduleDay(null);
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
              <TabsTrigger value="schedule" className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
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
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Schedule</h3>
                </div>
                
                <div>
                  <Label htmlFor="scheduleTitle">Schedule Section Title</Label>
                  <Input
                    id="scheduleTitle"
                    name="scheduleTitle"
                    value={formValues.scheduleTitle}
                    onChange={handleInputChange}
                    placeholder="Title for your schedule section"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="scheduleDescription">Schedule Description</Label>
                  <Textarea
                    id="scheduleDescription"
                    name="scheduleDescription"
                    value={formValues.scheduleDescription}
                    onChange={handleInputChange}
                    placeholder="Description for your schedule section"
                    className="mt-1"
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Weekly Schedule</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedScheduleDay({
                          index: formValues.scheduleDays.length,
                          day: {
                            day: 'Monday',
                            location: '',
                            address: '',
                            hours: ''
                          }
                        });
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Day
                    </Button>
                  </div>
                  
                  {formValues.scheduleDays.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground">No schedule days added yet.</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedScheduleDay({
                            index: formValues.scheduleDays.length,
                            day: {
                              day: 'Monday',
                              location: '',
                              address: '',
                              hours: ''
                            }
                          });
                        }}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Day
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {/* Calendar-like view of the week */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                            const hasSchedule = formValues.scheduleDays.some(d => d.day === day);
                            return (
                              <div 
                                key={day} 
                                className={`h-8 rounded-md flex items-center justify-center text-xs ${
                                  hasSchedule 
                                    ? 'bg-primary/20 text-primary font-medium cursor-pointer hover:bg-primary/30' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                                onClick={() => {
                                  if (hasSchedule) {
                                    const index = formValues.scheduleDays.findIndex(d => d.day === day);
                                    handleOpenScheduleModal(index);
                                  } else {
                                    // Add a new day for this day of week
                                    const newIndex = formValues.scheduleDays.length;
                                    setFormValues(prev => ({
                                      ...prev,
                                      scheduleDays: [
                                        ...prev.scheduleDays,
                                        {
                                          day,
                                          location: '',
                                          address: '',
                                          hours: ''
                                        }
                                      ]
                                    }));
                                    setTimeout(() => {
                                      handleOpenScheduleModal(newIndex);
                                    }, 100);
                                  }
                                }}
                              >
                                {hasSchedule ? '✓' : '+'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Grouped schedule cards */}
                      <div className="space-y-4 mt-4">
                        <h4 className="font-medium text-sm text-gray-500">Schedule Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupedScheduleDays.map((group, groupIndex) => {
                            const firstDay = group[0];
                            const lastDay = group[group.length - 1];
                            const dayRange = group.length === 1 
                              ? firstDay.day 
                              : `${firstDay.day} - ${lastDay.day}`;
                              
                            return (
                              <Card 
                                key={groupIndex} 
                                className="border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                                style={{ borderLeftColor: formValues.primaryColor || '#FF6B35' }}
                                onClick={() => handleOpenScheduleModal(formValues.scheduleDays.indexOf(firstDay))}
                              >
                                <CardContent className="p-4">
                                  <div className="flex flex-col">
                                    <div className="flex items-center mb-2">
                                      <Calendar className="h-4 w-4 text-primary mr-2" />
                                      <h3 className="font-bold text-sm">{dayRange}</h3>
                                    </div>
                                    
                                    {firstDay.location && (
                                      <p className="font-medium text-sm">{firstDay.location}</p>
                                    )}
                                    
                                    {firstDay.address && (
                                      <div className="flex items-start mt-1">
                                        <MapPin className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-600 text-xs">{firstDay.address}</p>
                                      </div>
                                    )}
                                    
                                    {firstDay.hours && (
                                      <div className="flex items-start mt-1">
                                        <Clock className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-600 text-xs">{firstDay.hours}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
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

      {/* Admin mode mobile submit button */}
      {mode === 'admin' && (
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

      {/* Schedule Day Edit Modal */}
      <Dialog open={selectedScheduleDay !== null} onOpenChange={(open) => !open && setSelectedScheduleDay(null)}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule Day</DialogTitle>
          </DialogHeader>
          
          {selectedScheduleDay ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex flex-col items-center">
                        <Checkbox 
                          id={`day-${day}`} 
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => toggleDaySelection(day)}
                          className="mb-1"
                        />
                        <Label 
                          htmlFor={`day-${day}`} 
                          className="text-xs cursor-pointer"
                        >
                          {day.substring(0, 3)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select multiple days to apply the same schedule
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="modal-location">Location</Label>
                  <Input
                    id="modal-location"
                    value={selectedScheduleDay.day.location || ''}
                    onChange={(e) => setSelectedScheduleDay({
                      ...selectedScheduleDay,
                      day: { ...selectedScheduleDay.day, location: e.target.value }
                    })}
                    placeholder="Downtown, Food Truck Park, etc."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="modal-address">Address</Label>
                  <Input
                    id="modal-address"
                    value={selectedScheduleDay.day.address || ''}
                    onChange={(e) => setSelectedScheduleDay({
                      ...selectedScheduleDay,
                      day: { ...selectedScheduleDay.day, address: e.target.value }
                    })}
                    placeholder="123 Main St, City, State"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Hours</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                    <div>
                      <Label className="text-xs">Start Time</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <select
                          value={timeValues.startHour}
                          onChange={(e) => handleTimeChange('startHour', e.target.value)}
                          className="flex h-9 w-full sm:w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>
                        <span>:</span>
                        <select
                          value={timeValues.startMinute}
                          onChange={(e) => handleTimeChange('startMinute', e.target.value)}
                          className="flex h-9 w-full sm:w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {['00', '15', '30', '45'].map(minute => (
                            <option key={minute} value={minute}>{minute}</option>
                          ))}
                        </select>
                        <select
                          value={timeValues.startAmPm}
                          onChange={(e) => handleTimeChange('startAmPm', e.target.value)}
                          className="flex h-9 w-full sm:w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">End Time</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <select
                          value={timeValues.endHour}
                          onChange={(e) => handleTimeChange('endHour', e.target.value)}
                          className="flex h-9 w-full sm:w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>
                        <span>:</span>
                        <select
                          value={timeValues.endMinute}
                          onChange={(e) => handleTimeChange('endMinute', e.target.value)}
                          className="flex h-9 w-full sm:w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {['00', '15', '30', '45'].map(minute => (
                            <option key={minute} value={minute}>{minute}</option>
                          ))}
                        </select>
                        <select
                          value={timeValues.endAmPm}
                          onChange={(e) => handleTimeChange('endAmPm', e.target.value)}
                          className="flex h-9 w-full sm:w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                if (selectedScheduleDay) {
                  handleRemoveScheduleDay(selectedScheduleDay.index);
                  setSelectedScheduleDay(null);
                }
              }}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSelectedScheduleDay(null);
                  setSelectedDays([]);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {selectedDays.length > 0 ? (
                <Button 
                  type="button" 
                  onClick={handleAddMultipleScheduleDays}
                  className="w-full sm:w-auto"
                >
                  Add {selectedDays.length} Day{selectedDays.length > 1 ? 's' : ''}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={() => {
                    if (selectedScheduleDay) {
                      // Format the hours string
                      const hoursString = `${timeValues.startHour}:${timeValues.startMinute} ${timeValues.startAmPm} - ${timeValues.endHour}:${timeValues.endMinute} ${timeValues.endAmPm}`;
                      
                      // Update the day with the new hours
                      const updatedDay = {
                        ...selectedScheduleDay.day,
                        hours: hoursString
                      };
                      
                      handleSaveScheduleDay(updatedDay);
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  Save
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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