import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface ImageCropperProps {
  onImageCropped: (croppedImage: string) => void;
  type: "logo" | "cover";
}

const ImageCropper = ({ onImageCropped, type }: ImageCropperProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setSrc(reader.result);
          setIsDialogOpen(true);
          // Reset crop when new image is selected
          setCrop(undefined);
        }
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Set initial crop to full image once image dimensions are known
  useEffect(() => {
    if (imgDimensions.width && imgDimensions.height) {
      const initialCrop: Crop = {
        unit: 'px',
        x: 0,
        y: 0,
        width: imgDimensions.width,
        height: imgDimensions.height
      };
      setCrop(initialCrop);
      setCompletedCrop(initialCrop as PixelCrop);
    }
  }, [imgDimensions]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgDimensions({ width, height });
  };

  const getCroppedImage = () => {
    if (!imageRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleSaveCrop = () => {
    if (!completedCrop) return;
    
    const croppedImageUrl = getCroppedImage();
    if (croppedImageUrl) {
      onImageCropped(croppedImageUrl);
      setIsDialogOpen(false);
      setSrc(null);
      setCrop(undefined);
      toast({
        title: "Image cropped successfully",
        variant: "default",
      });
    }
  };

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={onSelectFile}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-screen h-screen">
          <DialogHeader>
            <DialogTitle>Crop {type === "logo" ? "Logo" : "Cover"} Image</DialogTitle>
          </DialogHeader>
          {src && (
            <div className="flex flex-col gap-4">
              <div className="overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => {
                    setCrop(percentCrop);
                  }}
                  onComplete={(c) => {
                    setCompletedCrop(c);
                  }}
                >
                  <img
                    ref={imageRef}
                    src={src}
                    alt="Crop me"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCrop(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveCrop}
                  disabled={!completedCrop}
                >
                  Save Crop
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCropper;