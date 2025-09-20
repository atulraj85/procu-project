import React, { useState } from "react";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import ImageCropper from "../shared/imagecrop/Imagecrop";

interface SocialLinks {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
}

const STATES = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 
  'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Kerala', 'Telangana'
];

const CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Delhi': ['New Delhi', 'Delhi', 'Noida', 'Gurgaon'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Allahabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar']
};



interface ContactInfoData {
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  whatsappnumber?: string;
  headquartersAddress?: string;
  operatingCountries?: string[];
  state?: string;
  city?: string;
  pincode?: string;
}

interface VendorData {
  companyName?: string;
  legalEntityType?: string;
  taxId?: string;
  establishmentYear?: number;
  socialLinks?: SocialLinks;
  logo?: string;
  coverImage?: string;
  businessOpeningDays?: string[];
  businessTiming?: { start: string; end: string };
}

interface VendorBasicInfoProps {
  data: VendorData;
  updateData: (data: Partial<VendorData>) => void;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];



const OpningDay: React.FC<VendorBasicInfoProps> = ({
  data,
  updateData,
}) => {
  const handleCroppedImage = async (
    croppedImage: string,
    type: "logo" | "cover"
  ) => {
    // Convert base64 to blob
    const response = await fetch(croppedImage);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, `${type}-image.jpg`);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const result = await response.json();

      if (type === "logo") {
        updateData({ logo: result.url });
      } else {
        updateData({ coverImage: result.url });
      }

      toast({
        title: "Image uploaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        variant: "destructive",
      });
    }
  };

  const toggleDaySelection = (day: string) => {
    const currentDays = data.businessOpeningDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateData({ businessOpeningDays: newDays });
  };
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  

  return (
    <div className="w-full">
      <CardContent className="p-2">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
      

          {/* GST Number */}
          {/* <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">GST Number</label>
            <Input
              type="text"
              value={data.taxId || ""}
              onChange={(e) => updateData({ taxId: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter GST number"
            />
          </div> */}

          {/* Establishment Year */}
       

      



       


          {/* Business Opening Days */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Business Opening Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  className={`px-4 py-2 rounded-full transition-all duration-200 hover:shadow-md ${
                    data.businessOpeningDays?.includes(day)
                      ? "bg-blue-500 text-white shadow-inner"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleDaySelection(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Business Timing */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Business Timing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Start Time</label>
                <Input
                  type="time"
                  value={data.businessTiming?.start || "09:00"}
                  onChange={(e) =>
                    updateData({
                      businessTiming: {
                        start: e.target.value,
                        end: data.businessTiming?.end || "17:00",
                      },
                    })
                  }
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">End Time</label>
                <Input
                  type="time"
                  value={data.businessTiming?.end || "17:00"}
                  onChange={(e) =>
                    updateData({
                      businessTiming: {
                        start: data.businessTiming?.start || "09:00",
                        end: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

     

         
        </div>
      </CardContent>
    </div>
  );
};

export default OpningDay;
