"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';

// Define types for the image
type ImageType = string | {
  src: string;
  alt?: string;
};

// Props interface
interface VendorImageGalleryProps {
  images: ImageType[];
}

const VendorImageGallery: React.FC<VendorImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Helper function to get image src
  const getImageSrc = (image: ImageType): string => {
    return typeof image === 'string' ? image : image.src;
  };

  // Helper function to get image alt
  const getImageAlt = (image: ImageType, index: number): string => {
    return typeof image === 'string' 
      ? `Vendor image ${index + 1}` 
      : (image.alt || `Vendor image ${index + 1}`);
  };

  const openModal = (image: ImageType, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: number) => {
    if (!images || images.length === 0) return;

    const newIndex = (currentImageIndex + direction + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  if (!images || images.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Photos</h2>
      <div className="flex space-x-4 pt-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            onClick={() => openModal(image, index)} 
            className="cursor-pointer"
          >
            <Image
              src={getImageSrc(image)}
              alt={getImageAlt(image, index)}
              width={200}
              height={150}
              className="rounded-md shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        ))}
      </div>
      <button className="text-blue-500 mt-2 underline hover:text-blue-700">Upload Photos</button>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-full max-h-full flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <FaTimes size={30} />
            </button>

            {/* Previous Navigation */}
            {images.length > 1 && (
              <button
                onClick={() => navigateImage(-1)}
                className="absolute left-0 text-white hover:text-gray-300 z-50 p-2 bg-black bg-opacity-50 rounded-full"
              >
                &#10094;
              </button>
            )}

            {/* Image */}
            <Image
              src={getImageSrc(selectedImage)}
              alt={getImageAlt(selectedImage, currentImageIndex)}
              width={800}
              height={600}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* Next Navigation */}
            {images.length > 1 && (
              <button
                onClick={() => navigateImage(1)}
                className="absolute right-0 text-white hover:text-gray-300 z-50 p-2 bg-black bg-opacity-50 rounded-full"
              >
                &#10095;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorImageGallery;