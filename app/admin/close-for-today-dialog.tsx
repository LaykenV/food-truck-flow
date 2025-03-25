'use client';

import { Button } from "@/components/ui/button";
import { LucideX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function CloseForTodayDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
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
          <form className="w-full flex justify-end gap-2" action={async (formData: FormData) => {
            // This will be replaced with an imported server action
            // We need to use formData here to satisfy TypeScript even though we don't use it
            const response = await fetch('/api/close-today', {
              method: 'POST',
            });
            setIsOpen(false);
          }}>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Yes, Close for Today
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 