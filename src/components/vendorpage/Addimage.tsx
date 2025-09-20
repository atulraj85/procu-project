import React, { ChangeEvent, useState } from 'react';
import { toast } from '../ui/use-toast';
import { X } from 'lucide-react';

interface ImageUploadProps {
  updateData: (data: { photos?: string[] }) => void;
  existingPhotos?: string[];
  serviceId?: string; // Optional service ID
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  updateData, 
  existingPhotos = [], 
  serviceId 
}) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Ensure we don't exceed 4 images
      if (photos.length >= 4) {
        toast({ 
          title: 'Maximum 4 images allowed', 
          variant: 'destructive' 
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // Include serviceId in the upload if available
        if (serviceId) {
          formData.append('serviceId', serviceId);
        }

        const response = await fetch('/api/media/upload', { 
          method: 'POST', 
          body: formData 
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const { url } = await response.json();
        
        // Update local state and form data
        const newPhotos = [...photos, url];
        setPhotos(newPhotos);
        updateData({ photos: newPhotos });
        
        toast({ 
          title: 'Image uploaded', 
          variant: 'default' 
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast({ 
          title: 'Error uploading image', 
          variant: 'destructive' 
        });
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(newPhotos);
    updateData({ photos: newPhotos });
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {photos.map((photoUrl, index) => (
          <div key={index} className="relative">
            <img 
              src={photoUrl} 
              alt={`Uploaded ${index + 1}`} 
              className="w-full h-20 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {photos.length < 4 && (
          <label className="cursor-pointer flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-md">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <span className="text-gray-400">+ Add Image</span>
          </label>
        )}
      </div>
      {photos.length > 0 && (
        <p className="text-sm text-gray-500">
          {photos.length}/4 images uploaded
        </p>
      )}
    </div>
  );
};

export default ImageUpload;