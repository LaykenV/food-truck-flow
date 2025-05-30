'use client';

import { useState } from 'react';
import { FoodTruckConfig } from '@/components/FoodTruckTemplate';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { History, ArrowLeft, Clock, Bookmark, Plus, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getConfigurationHistory, bookmarkConfiguration } from '@/app/admin/config/actions';

interface ConfigHistoryDrawerProps {
  onSelectVersion: (config: FoodTruckConfig) => void;
  currentConfig: FoodTruckConfig;
}

type HistoryItem = {
  id: string;
  config: FoodTruckConfig;
  timestamp: Date;
  configName: string;
};

export function ConfigHistoryDrawer({ onSelectVersion, currentConfig }: ConfigHistoryDrawerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<HistoryItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // React Query for fetching configuration history
  const { 
    data: history = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['configHistory'],
    queryFn: () => getConfigurationHistory(20),
    enabled: isOpen, // Only fetch when the drawer is open
  });

  // Mutation for bookmarking a configuration
  const bookmarkMutation = useMutation({
    mutationFn: ({ config, name }: { config: FoodTruckConfig, name: string }) => 
      bookmarkConfiguration(config, name),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['configHistory'] });
      toast.success('Configuration bookmarked successfully');
      setBookmarkName('');
      setShowBookmarkDialog(false);
    },
    onError: (error: any) => {
      toast.error(`Error bookmarking configuration: ${error.message || 'Unknown error'}`);
    }
  });

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
  const handleSelectVersion = (item: HistoryItem) => {
    setSelectedConfig(item);
    setShowConfirmDialog(true);
  };

  // Handle opening bookmark dialog
  const handleOpenBookmarkDialog = () => {
    setShowBookmarkDialog(true);
  };

  // Handle bookmarking the current configuration
  const handleBookmarkConfig = () => {
    if (!bookmarkName.trim()) {
      toast.error('Please enter a name for this configuration');
      return;
    }

    bookmarkMutation.mutate({ 
      config: currentConfig, 
      name: bookmarkName.trim() 
    });
  };

  // Handle confirming version switch
  const handleConfirmSwitch = () => {
    if (!selectedConfig) return;
    
    // Call the parent component's callback
    onSelectVersion(selectedConfig.config);
    
    // Close the confirmation dialog and history drawer
    setShowConfirmDialog(false);
    setIsOpen(false);
    
    // Invalidate foodTruck query to refetch with the new selected config
    queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 text-admin-foreground border-admin-border w-full sm:w-auto">
            <History className="h-4 w-4" />
            <span>History</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-full max-w-full sm:max-w-md border-admin-border bg-gradient-to-b from-admin-primary/5 to-admin/95 text-admin-foreground [&_.absolute.right-4.top-4]:hidden"
        >
          <SheetHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <SheetClose asChild className="sm:hidden">
                  <Button variant="ghost" size="icon" className="text-admin-foreground p-1 h-8 w-8">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </SheetClose>
                <SheetTitle className="text-xl font-semibold text-admin-foreground">Configuration History</SheetTitle>
              </div>
              <Button 
                onClick={handleOpenBookmarkDialog}
                className="bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white hover:opacity-90 transition-opacity flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Bookmark className="h-4 w-4" />
                <span>Bookmark Current</span>
              </Button>
            </div>
            <SheetDescription className="text-admin-muted-foreground">
              View, restore or bookmark configurations
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-admin-destructive/10 text-admin-destructive p-4 rounded-md">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Error loading history: {(error as Error).message}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-admin-muted-foreground flex flex-col items-center">
                <p className="mb-4">No saved configurations found</p>
                <Button 
                  onClick={handleOpenBookmarkDialog}
                  className="bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bookmark Current Configuration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="group rounded-lg p-3 hover:bg-admin-secondary/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-admin-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-admin-foreground">
                            {item.configName || item.config.name || 'Unnamed Configuration'}
                          </div>
                          <div className="text-sm text-admin-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSelectVersion(item)}
                        className="text-admin-primary hover:text-white hover:bg-gradient-to-r hover:from-[hsl(var(--admin-gradient-start))] hover:to-[hsl(var(--admin-gradient-end))] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0 w-full sm:w-auto"
                      >
                        Restore
                      </Button>
                    </div>
                    <Separator className="my-4 bg-admin-border" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <SheetFooter className="mt-6 hidden sm:flex sm:justify-start">
            <SheetClose asChild>
              <Button variant="outline" className="gap-2 text-admin-foreground border-admin-border w-full">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent className="bg-admin-background border-admin-border text-admin-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Bookmark Current Configuration</DialogTitle>
            <DialogDescription className="text-admin-muted-foreground">
              Give this configuration a name so you can easily find it later
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="bookmarkName" className="text-admin-foreground">Configuration Name</Label>
            <Input
              id="bookmarkName"
              value={bookmarkName}
              onChange={(e) => setBookmarkName(e.target.value)}
              placeholder="My Favorite Configuration"
              className="mt-2 bg-admin-background border-admin-border text-admin-foreground"
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBookmarkDialog(false)}
              className="text-admin-foreground border-admin-border w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBookmarkConfig}
              disabled={bookmarkMutation.isPending || !bookmarkName.trim()}
              className="bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white hover:opacity-90 transition-opacity w-full sm:w-auto order-1 sm:order-2"
            >
              {bookmarkMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Bookmark
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Version Switch */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-admin-background border-admin-border text-admin-foreground sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle className="text-lg font-semibold">Confirm Configuration Switch</DialogTitle>
            </div>
            <DialogDescription className="text-admin-muted-foreground">
              Are you sure you want to switch to this previous configuration? Your current unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          
          {selectedConfig && (
            <div className="my-2 p-3 bg-admin-secondary rounded-md">
              <p className="font-medium text-admin-foreground">
                {selectedConfig.configName || selectedConfig.config.name || 'Unnamed Configuration'}
              </p>
              <p className="text-sm text-admin-muted-foreground">
                {formatTimestamp(selectedConfig.timestamp)}
              </p>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              className="text-admin-foreground border-admin-border w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSwitch}
              className="bg-gradient-to-r from-[hsl(var(--admin-gradient-start))] to-[hsl(var(--admin-gradient-end))] text-white hover:opacity-90 transition-opacity w-full sm:w-auto order-1 sm:order-2"
            >
              Confirm Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 