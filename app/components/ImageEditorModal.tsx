'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  aspect?: number;
  circularCrop?: boolean;
  onSave: (croppedBlob: Blob) => void;
}

export function ImageEditorModal({
  isOpen,
  onClose,
  imageSrc,
  aspect,
  circularCrop = false,
  onSave
}: ImageEditorModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Function to handle when the image loads
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      
      // Initialize the crop based on the aspect ratio
      if (aspect) {
        // For aspectRatio, use makeAspectCrop and centerCrop to create a centered, aspect-correct crop
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            aspect,
            width,
            height
          ),
          width,
          height
        );
        setCrop(crop);
      } else {
        // For free-form crop, set a default centered crop at 80% of the image
        setCrop({
          unit: '%',
          x: 10,
          y: 10,
          width: 80,
          height: 80
        });
      }
    },
    [aspect]
  );

  // Reset crop when aspect ratio changes
  useEffect(() => {
    if (imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<HTMLImageElement>);
    }
  }, [aspect, circularCrop, onImageLoad]);

  // Function to get cropped image
  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Calculate the scaling factor between the displayed image and the original image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to crop size (scaled to original image size)
    const pixelCrop = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas (using original image dimensions)
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // If circular crop, apply a circular mask
    if (circularCrop) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        pixelCrop.width / 2,
        pixelCrop.height / 2,
        Math.min(pixelCrop.width, pixelCrop.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Determine image format: use PNG for images that likely have transparency (logos)
    const mimeType = circularCrop ? 'image/png' : 'image/jpeg';
    const quality = mimeType === 'image/jpeg' ? 0.95 : undefined; // Quality only applies to JPEG

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  }, [completedCrop, circularCrop]);

  // Handle save button click
  const handleSaveCrop = async () => {
    setIsSaving(true);
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        onSave(croppedBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {circularCrop ? 'Crop Logo' : 'Crop Image'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={circularCrop}
              className="max-h-[60vh] mx-auto"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%' }}
              />
            </ReactCrop>
          )}
        </div>
        
        <DialogFooter className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCrop}
            disabled={!completedCrop || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 