'use client';

import { Button } from "@/components/ui/button";
import { LucideX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { closeToday } from "./actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CloseForTodayDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Use React Query mutation for closing today
  const closeTodayMutation = useMutation({
    mutationFn: closeToday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodTruck'] });
      toast.success("Food truck closed for today");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to close food truck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="destructive">
          <LucideX className="w-4 h-4 mr-2" />
          Close for Today
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close for Today</DialogTitle>
          <DialogDescription>
            Are you sure you want to close your food truck for today? This will mark today as closed and stop accepting orders regardless of your scheduled hours.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => closeTodayMutation.mutate()}
              disabled={closeTodayMutation.isPending}
            >
              {closeTodayMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Closing...
                </span>
              ) : (
                'Yes, Close for Today'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 