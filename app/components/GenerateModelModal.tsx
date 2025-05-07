'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, UploadCloud, Sparkles, Image as ImageIcon } from 'lucide-react';
import { createFilePreview, revokeFilePreview, base64ToBlob } from '@/utils/file-utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getSubscriptionData } from '../admin/clientQueries';

interface GenerateModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateComplete: (generatedBlob: Blob) => void;
}

// Helper to convert Base64 to Blob URL for preview
function base64ToBlobUrl(base64Data: string, contentType: string = 'image/png'): string {
  const blob = base64ToBlob(base64Data, contentType);
  return URL.createObjectURL(blob);
}

export function GenerateModelModal({ isOpen, onClose, onGenerateComplete }: GenerateModelModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedImageData, setGeneratedImageData] = useState<string | null>(null); // base64
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // Progress for loading state

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: subscriptionData,
    isLoading: isSubscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['subscriptionData'],
    queryFn: getSubscriptionData
  });

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to allow closing animation
      setTimeout(() => {
        setUploadedFile(null);
        if (uploadedPreviewUrl) revokeFilePreview(uploadedPreviewUrl);
        setUploadedPreviewUrl(null);
        setIsLoading(false);
        setErrorMessage(null);
        setGeneratedImageData(null);
        if (generatedPreviewUrl) revokeFilePreview(generatedPreviewUrl);
        setGeneratedPreviewUrl(null);
        setProgress(0);
      }, 300);
    }
  }, [isOpen, uploadedPreviewUrl, generatedPreviewUrl]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (uploadedPreviewUrl) {
        revokeFilePreview(uploadedPreviewUrl);
      }
      const newPreviewUrl = createFilePreview(file);
      setUploadedPreviewUrl(newPreviewUrl);
      // Clear previous results/errors
      setErrorMessage(null);
      setGeneratedImageData(null);
      if (generatedPreviewUrl) revokeFilePreview(generatedPreviewUrl);
      setGeneratedPreviewUrl(null);
      setProgress(0);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle generation call
  const handleGenerate = useCallback(async () => {
    if (!uploadedFile) return;

    if (subscriptionData?.status !== 'active') {
      toast.error('Please subscribe to generate a model.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedImageData(null);
    if (generatedPreviewUrl) revokeFilePreview(generatedPreviewUrl);
    setGeneratedPreviewUrl(null);
    setProgress(10); // Initial progress

    const formData = new FormData();
    formData.append('truckImage', uploadedFile);

    // Simulate progress increase
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90)); // Cap at 90% until response
    }, 2500);

    try {
      const response = await fetch('/api/generate-truck-model', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval); // Stop simulated progress

      if (!response.ok) {
        let errorMsg = 'Failed to generate model.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) { /* Ignore parsing error */ }
        throw new Error(errorMsg);
      }

      setProgress(95); // Progress after successful fetch
      const result = await response.json();

      if (result.imageData) {
        setGeneratedImageData(result.imageData);
        const newGeneratedPreviewUrl = base64ToBlobUrl(result.imageData);
        setGeneratedPreviewUrl(newGeneratedPreviewUrl);
        setProgress(100); // Final progress
        toast.success('Model generated successfully!');
      } else {
        throw new Error('No image data received from server.');
      }

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error("Generation Error:", error);
      setErrorMessage(error.message || 'An unknown error occurred.');
      setProgress(0);
      toast.error(`Generation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, generatedPreviewUrl]);

  // Handle confirming the generated image
  const handleUseModel = () => {
    if (generatedImageData) {
      const blob = base64ToBlob(generatedImageData);
      onGenerateComplete(blob);
      // onClose will be called by parent after onGenerateComplete logic is done
    } else {
      setErrorMessage('No generated model available to use.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-admin-card border-admin-border flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-admin-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-admin-primary"/>
            Generate 3D Food Truck Model
          </DialogTitle>
          <DialogDescription className="text-admin-muted-foreground">
            Upload a clear, side-facing photo of your food truck. We'll use AI to generate a 3D cartoon-style model with a transparent background.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 flex-grow min-h-0 overflow-y-auto pr-6 -mr-6">
          {/* --- Upload Section --- */}
          <div className="space-y-2">
            <Label htmlFor="truck-photo-upload" className="text-admin-foreground">Upload Your Truck Photo</Label>
            <div 
              className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-admin-border border-dashed rounded-md cursor-pointer hover:border-admin-primary/80 bg-admin-secondary/20 transition-colors" 
              onClick={triggerFileInput}
            >
              <div className="space-y-1 text-center">
                {uploadedPreviewUrl ? (
                  <img 
                    src={uploadedPreviewUrl} 
                    alt="Uploaded truck preview" 
                    className="mx-auto h-32 w-auto rounded-md object-contain border border-admin-border shadow-sm"
                  />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-admin-muted-foreground" />
                )}
                <div className="flex text-sm text-admin-muted-foreground justify-center">
                  <span className="relative cursor-pointer rounded-md font-medium text-admin-primary hover:text-admin-primary/80 focus-within:outline-none">
                    {uploadedFile ? 'Change file' : 'Upload a file'}
                  </span>
                  <input 
                    id="truck-photo-upload" 
                    name="truck-photo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                  />
                </div>
                {!uploadedFile && <p className="text-xs text-admin-muted-foreground">PNG, JPG, GIF up to 10MB</p>}
                {uploadedFile && <p className="text-xs text-admin-muted-foreground truncate max-w-xs mx-auto pt-1">{uploadedFile.name}</p>} 
              </div>
            </div>
          </div>

          {/* --- Generate Button --- */} 
          <Button 
            onClick={handleGenerate} 
            disabled={!uploadedFile || isLoading || !!generatedPreviewUrl}
            className="w-full bg-gradient-to-r from-admin-primary to-[hsl(var(--admin-gradient-end))] text-admin-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating... ({progress.toFixed(0)}%)
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Model
              </>
            )}
          </Button>

          {isLoading && (
            <Progress value={progress} className="w-full h-2 [&>div]:bg-admin-primary" />
          )}

          {/* --- Result Section --- */} 
          {generatedPreviewUrl && !isLoading && (
            <div className="space-y-2">
              <Label className="text-admin-foreground">Generated Model Preview</Label>
              <div className="mt-1 flex flex-col items-center gap-4 p-4 border border-admin-border rounded-md bg-admin-secondary/20">
                <div className="w-48 h-48 relative border border-admin-border rounded-md overflow-hidden shadow-sm bg-muted/30"> 
                  <img 
                    src={generatedPreviewUrl} 
                    alt="Generated truck model preview" 
                    className="absolute w-full h-full object-contain"
                  />
                </div>
                <Button 
                  onClick={handleUseModel} 
                  className="w-full sm:w-auto bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </div>
            </div>
          )}

          {/* --- Error Message --- */} 
          {errorMessage && (
            <Alert variant="destructive" className="bg-admin-destructive/10 border-admin-destructive/30 text-admin-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:justify-end border-t border-admin-border pt-4 flex-shrink-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="border-admin-border text-admin-foreground hover:bg-admin-secondary/50"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 