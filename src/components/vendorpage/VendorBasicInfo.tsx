import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import ImageCropper from "../shared/imagecrop/Imagecrop";

interface SocialLinks {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
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
  state?: string;
  city?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string;
  headquartersAddress?: string;
  operatingCountries?: string[];
}

interface VendorBasicInfoProps {
  data: VendorData;
  updateData: (data: Partial<VendorData>) => void;
  handleNextStep: () => void;
}

const VendorBasicInfo: React.FC<VendorBasicInfoProps> = ({
  data,
  updateData,
  handleNextStep,
}) => {
  const [loading, setLoading] = useState(false);
  const addressInputRef = useRef(null);

  const handleCroppedImage = async (
    croppedImage: string,
    type: "logo" | "cover"
  ) => {
    const response = await fetch(croppedImage);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append("image", blob, `${type}-image.jpg`);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Image upload failed");

      const result = await response.json();
      updateData({ [type === "logo" ? "logo" : "coverImage"]: result.url });
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

  const handlePincodeChange = async (pincode: string) => {
    const cleanedPincode = pincode.replace(/\D/g, "").slice(0, 6);
    updateData({ pincode: cleanedPincode });

    if (cleanedPincode.length === 6) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${cleanedPincode}`
        );
        const data = await response.json();

        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          updateData({
            state: postOffice.State,
            city: postOffice.District,
          });

          toast({
            title: "Location details updated",
            description: `${postOffice.District}, ${postOffice.State}`,
            variant: "default",
          });
        } else {
          updateData({ state: "", city: "" });
          toast({
            title: "Invalid pincode",
            description: "Please enter a valid 6-digit pincode",
            variant: "destructive",
          });
        }
      } catch (error) {
        updateData({ state: "", city: "" });
        toast({
          title: "Error fetching location details",
          description: "Please check your pincode and try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const [validData, setValidData] = useState<{ companyName: string }>({
    companyName: "",
  });

  const dataSubmit = () => {
    if (data.companyName) {
      if (data.companyName.length < 3) {
        setValidData((prev) => ({
          ...prev,
          companyName: "Company name must be at least 3 characters",
        }));
        return;
      }
      handleNextStep();
    } else {
      setValidData((prev) => ({
        ...prev,
        companyName: "Company name must be at least 3 characters",
      }));
    }
  };

  useEffect(() => {
    if (data.companyName) {
      if (data.companyName.length < 3) {
        setValidData((prev) => ({
          ...prev,
          companyName: "Company name must be at least 3 characters",
        }));
      } else {
        setValidData((prev) => ({
          ...prev,
          companyName: "",
        }));
      }
    }
  }, [data.companyName]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Enter Basic Business Details
            </h2>
            <div className="flex justify-between items-center">
              <div className="border-b-4 border-primary w-full md:w-32"></div>
              <div className="border-b-4 border-gray-200 w-full md:w-32"></div>
              <div className="border-b-4 border-gray-200 w-full md:w-32"></div>
            </div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Business Name */}
            <div className="form-group">
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Name*
              </label>
              <Input
                id="businessName"
                type="text"
                value={data.companyName || ""}
                onChange={(e) => updateData({ companyName: e.target.value })}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="Enter your business name"
                aria-describedby="businessNameError"
              />
              {validData.companyName && (
                <p
                  id="businessNameError"
                  className="text-xs text-red-500 pt-1 ml-2"
                >
                  {validData.companyName}
                </p>
              )}
            </div>

            {/* Pincode */}
            <div className="form-group">
              <label
                htmlFor="pincode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pincode
              </label>
              <Input
                id="pincode"
                type="text"
                value={data.pincode || ""}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                disabled={loading}
                aria-describedby={loading ? "pincodeLoading" : ""}
              />
              {loading && (
                <p
                  id="pincodeLoading"
                  className="text-xs text-gray-500 pt-1 ml-2"
                >
                  Loading location data...
                </p>
              )}
            </div>

            {/* Address Line 1 */}
            <div className="form-group">
              <label
                htmlFor="addressLine1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address Line 1
              </label>
              <Input
                id="addressLine1"
                type="text"
                value={data.addressLine1 || ""}
                onChange={(e) => updateData({ addressLine1: e.target.value })}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="Street address"
              />
            </div>

            {/* Address Line 2 */}
            <div className="form-group">
              <label
                htmlFor="addressLine2"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address Line 2
              </label>
              <Input
                id="addressLine2"
                type="text"
                value={data.addressLine2 || ""}
                onChange={(e) => updateData({ addressLine2: e.target.value })}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            {/* City and State in same row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <Input
                  id="city"
                  type="text"
                  value={data.city || ""}
                  onChange={(e) => updateData({ city: e.target.value })}
                  className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <Input
                  id="state"
                  type="text"
                  value={data.state || ""}
                  onChange={(e) => updateData({ state: e.target.value })}
                  className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                  placeholder="State"
                />
              </div>
            </div>

            {/* Image Uploads */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Business Images
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="logoUpload"
                    className="block text-sm font-medium text-gray-600 mb-2"
                  >
                    Business Logo
                  </label>
                  <div className="w-full">
                    <ImageCropper
                      // id="logoUpload"
                      onImageCropped={(croppedImage) =>
                        handleCroppedImage(croppedImage, "logo")
                      }
                      type="logo"
                    />
                    {data.logo && (
                      <div className="mt-2 w-16 h-16 overflow-hidden rounded-md">
                        <img
                          src={data.logo}
                          alt="Business Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="coverUpload"
                    className="block text-sm font-medium text-gray-600 mb-2"
                  >
                    Cover Image
                  </label>
                  <div className="w-full">
                    <ImageCropper
                      // id="coverUpload"
                      onImageCropped={(croppedImage) =>
                        handleCroppedImage(croppedImage, "cover")
                      }
                      type="cover"
                    />
                    {data.coverImage && (
                      <div className="mt-2 w-full h-16 overflow-hidden rounded-md">
                        <img
                          src={data.coverImage}
                          alt="Cover Image Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save and Continue Button */}
            <button
              className="w-full bg-primary text-white py-3 px-6 rounded-lg mt-6 hover:bg-[#d58829d4] transition duration-300"
              onClick={dataSubmit}
              type="button"
            >
              Save and Continue
            </button>
          </form>
        </div>

        {/* Right Side - Mobile Preview */}
        <div className="w-full lg:w-1/2 flex justify-center items-start mt-8 lg:mt-0">
          <div className="relative bg-gray-900 rounded-3xl p-3 shadow-xl max-w-xs">
            <div className="relative bg-white rounded-2xl overflow-hidden h-[500px] w-64">
              {/* Preview Content */}
              <div>
                {data.coverImage ? (
                  <img
                    src={data.coverImage}
                    alt="Business Cover"
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200"></div>
                )}

                <div className="p-4 relative">
                  {/* Business Card */}
                  <div className="bg-white rounded-lg shadow-md p-3 mb-4 -mt-6 relative z-10">
                    <div className="flex items-center">
                      <div className="w-14 h-14 mr-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        {data.logo ? (
                          <img
                            src={data.logo}
                            alt="Business Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No logo</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {data.companyName || "Business Name"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Restaurant and Coffee
                        </p>
                        <p className="text-xs text-gray-500">
                          {data.city && data.state
                            ? `${data.city}, ${data.state}`
                            : "Location"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Reviews</h4>
                    <div className="flex items-center">
                      <div className="flex text-amber-500">
                        {"★★★★★".split("").map((star, i) => (
                          <span key={i}>{star}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        (101 Reviews)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Open until 9:00 PM today - 9:30 AM to 9:00 PM
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button className="bg-amber-500 text-white text-xs rounded-full px-4 py-1">
                      Message
                    </button>
                    <button className="bg-amber-500 text-white text-xs rounded-full px-4 py-1">
                      Call
                    </button>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Items</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-100 rounded-lg h-16"></div>
                      <div className="bg-gray-100 rounded-lg h-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-white text-xs text-center mt-2">
              Mobile Preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBasicInfo;
