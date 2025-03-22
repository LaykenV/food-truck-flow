'use client';

import { useState, useEffect } from 'react';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
import { getConfigurationHistory } from '@/utils/config-utils';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { History, ArrowLeft, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ConfigHistoryDrawerProps {
  userId: string;
  onSelectVersion: (config: FoodTruckConfig) => void;
}

export function ConfigHistoryDrawer({ userId, onSelectVersion }: ConfigHistoryDrawerProps) {
  const [history, setHistory] = useState<{ config: FoodTruckConfig; timestamp: Date }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load history when sheet is opened
  const loadHistory = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const historyData = await getConfigurationHistory(userId, 20);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading configuration history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load history when sheet is opened
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, userId]);

  // Format the timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = timestamp >= today;
    const isYesterday = timestamp >= yesterday && timestamp < today;
    
    let dateStr;
    if (isToday) {
      dateStr = 'Today';
    } else if (isYesterday) {
      dateStr = 'Yesterday';
    } else {
      dateStr = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    const timeStr = timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  // Handle selecting a version
  const handleSelectVersion = (item: { config: FoodTruckConfig; timestamp: Date }) => {
    // Make sure we're passing a complete config object
    const completeConfig: FoodTruckConfig = {
      name: item.config.name || '',
      tagline: item.config.tagline || '',
      logo: item.config.logo || '',
      primaryColor: item.config.primaryColor || '#FF6B35',
      secondaryColor: item.config.secondaryColor || '#4CB944',
      hero: {
        image: item.config.hero?.image || '',
        title: item.config.hero?.title || '',
        subtitle: item.config.hero?.subtitle || ''
      },
      about: {
        title: item.config.about?.title || '',
        content: item.config.about?.content || '',
        image: item.config.about?.image || ''
      },
      contact: {
        email: item.config.contact?.email || '',
        phone: item.config.contact?.phone || '',
        address: item.config.contact?.address || ''
      },
      socials: {
        twitter: item.config.socials?.twitter || '',
        instagram: item.config.socials?.instagram || '',
        facebook: item.config.socials?.facebook || ''
      }
    };
    
    onSelectVersion(completeConfig);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Configuration History</SheetTitle>
          <SheetDescription>
            View and restore previous versions of your configuration
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No history available
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">{item.config.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSelectVersion(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Restore
                    </Button>
                  </div>
                  {index < history.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 