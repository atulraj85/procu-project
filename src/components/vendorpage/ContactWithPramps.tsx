import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { X, ChevronDown } from "lucide-react";
import Loader from '../shared/Loader';

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: string;
  emailVerifToken: null;
  mobile: string;
  role: string;
  vendorProfileId: null;
  profilePic: null;
  coverPic: null;
  secureProfilePic: null;
  createdBy: null;
  createdAt: string;
  updatedAt: string;
  vendorProfile: null;
}

interface ContactInfoData {
  primaryContactName?: string;
  primaryContactPhone?: string;
  whatsappNumber?: string;
  primaryContactEmail?: string;
  anotherMobileNumbers: string[];
  anotheremails: string[];
  businessOpeningDays?: string[];
  businessTiming?: { 
    start: string; 
    end: string;
  };
}

interface ContactInfoProps {
  data: ContactInfoData;
  id: any;
  updateData: (data: Partial<ContactInfoData>) => void;
  handleNextStep: () => void;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ContactInfo: React.FC<ContactInfoProps> = ({ data, updateData, id , handleNextStep }) => {
  const [newPhone, setNewPhone] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [salutation, setSalutation] = useState<string>('Mr');
  const user = id.id;
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users?id=${user}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData: UserData[] = await response.json();
        
        if (userData && userData.length > 0) {
          const user = userData[0];
          updateData({
            primaryContactName: user.name,
            primaryContactPhone: user.mobile,
            primaryContactEmail: user.email,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAddPhone = () => {
    if (newPhone) {
      if (!data.primaryContactPhone) {
        updateData({ 
          primaryContactPhone: newPhone,
          whatsappNumber: sameAsPhone ? newPhone : data.whatsappNumber 
        });
      } else {
        const updatedNumbers = [...(data.anotherMobileNumbers || []), newPhone];
        updateData({ anotherMobileNumbers: updatedNumbers });
      }
      setNewPhone('');
    }
  };

  const handleAddEmail = () => {
    if (newEmail) {
      if (!data.primaryContactEmail) {
        updateData({ primaryContactEmail: newEmail });
      } else {
        const updatedEmails = [...(data.anotheremails || []), newEmail];
        updateData({ anotheremails: updatedEmails });
      }
      setNewEmail('');
    }
  };

  const handleRemovePhone = (index: number) => {
    const updatedNumbers = [...(data.anotherMobileNumbers || [])];
    updatedNumbers.splice(index, 1);
    updateData({ anotherMobileNumbers: updatedNumbers });
  };

  const handleRemoveEmail = (index: number) => {
    const updatedEmails = [...(data.anotheremails || [])];
    updatedEmails.splice(index, 1);
    updateData({ anotheremails: updatedEmails });
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: 'phone' | 'email'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'phone') {
        handleAddPhone();
      } else {
        handleAddEmail();
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader/></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-8 p-6">
      <div className="w-full md:w-1/2">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Add Contact Details
          </h2>
          <div className="flex gap-4 mb-6">
            <div className="border-b-4 border-amber-500 w-20"></div>
            <div className="border-b-4 border-amber-500 w-20"></div>
            <div className="border-b-4 border-gray-200 w-20"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Contact Person with Salutation */}
          <div className="flex gap-2 w-full">
            <div className="w-1/4 relative">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-gray-700 border border-gray-200">
                <span>{salutation}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="w-3/4">
              <Input
                type="text"
                value={data.primaryContactName || ""}
                onChange={(e) => updateData({ primaryContactName: e.target.value })}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="Contact Person"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex gap-2 w-full">
            <div className="w-1/4 relative">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-gray-700 border border-gray-200">
                <span>+91</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="w-3/4">
              <Input
                type="text"
                value={data.primaryContactPhone || newPhone}
                onChange={(e) => {
                  if (!data.primaryContactPhone) {
                    setNewPhone(e.target.value);
                  } else {
                    updateData({ primaryContactPhone: e.target.value })
                  }
                }}
                onKeyPress={(e) => handleKeyPress(e, 'phone')}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="Mobile Number"
              />
            </div>
          </div>

          {/* Add Another Mobile Number Link */}
          {data.primaryContactPhone && (
            <div className="pl-1">
              <button 
                className="text-amber-500 text-sm hover:underline flex items-center"
                onClick={() => {
                  // Show a field to add another number
                  if (!data.anotherMobileNumbers?.length) {
                    updateData({ anotherMobileNumbers: [''] });
                  }
                }}
              >
                + Add Another Mobile Number
              </button>
            </div>
          )}

          {/* WhatsApp Number */}
          <div className="flex gap-2 w-full">
            <div className="w-1/4 relative">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-gray-700 border border-gray-200">
                <span>+91</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="w-3/4">
              <Input
                type="text"
                value={data.whatsappNumber || ""}
                onChange={(e) => updateData({ whatsappNumber: e.target.value })}
                disabled={sameAsPhone}
                className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
                placeholder="WhatsApp Number"
              />
            </div>
          </div>

          {/* Same as Mobile Number Checkbox */}
          <div className="flex items-center space-x-2 pl-1">
            <Checkbox 
              id="sameAsPhone"
              checked={sameAsPhone}
              onCheckedChange={(checked) => {
                setSameAsPhone(checked as boolean);
                if (checked && data.primaryContactPhone) {
                  updateData({ whatsappNumber: data.primaryContactPhone });
                } else if (!checked) {
                  updateData({ whatsappNumber: '' });
                }
              }}
              className="h-4 w-4 border-amber-500 text-amber-500 rounded"
            />
            <label 
              htmlFor="sameAsPhone" 
              className="text-sm text-gray-600 cursor-pointer"
            >
              Same as Mobile Number
            </label>
          </div>

          {/* Email */}
          <div>
            <Input
              type="email"
              value={data.primaryContactEmail || newEmail}
              onChange={(e) => {
                if (!data.primaryContactEmail) {
                  setNewEmail(e.target.value);
                } else {
                  updateData({ primaryContactEmail: e.target.value })
                }
              }}
              onKeyPress={(e) => handleKeyPress(e, 'email')}
              className="w-full bg-gray-50 rounded-lg p-3 text-gray-700"
              placeholder="Email"
            />
          </div>

          {/* Save and Continue Button */}
          <button
            className="w-full bg-amber-500 text-white py-3 px-6 rounded-lg mt-4 hover:bg-amber-600 transition duration-300"
            onClick={handleNextStep}
          >
            Save and Continue
          </button>
        </div>
      </div>

      {/* Right Side - Mobile Preview */}
      <div className="w-full md:w-1/2 flex justify-center space-x-4 items-start">
        <div className="relative bg-gray-900 rounded-3xl p-3 shadow-xl max-w-xs">
          <div className="relative bg-white rounded-2xl overflow-hidden h-[500px] w-64">
            {/* Preview Content */}
            <div>
              {/* Cover Image */}
              <img 
                src="/pic1.png"
                alt="Business Cover"
                className="w-full h-24 object-cover"
              />
              
              <div className="p-4 relative">
                {/* Business Card */}
                <div className="bg-white rounded-lg shadow-md p-3 mb-4 -mt-6 relative z-10">
                  <div className="flex items-center">
                    <div className="w-14 h-14 mr-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-400">CW</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Cafe Wink</h3>
                      <p className="text-xs text-gray-500">Restaurant and Coffee</p>
                      <p className="text-xs text-gray-500">
                        {data.primaryContactName ? `Contact: ${data.primaryContactName}` : ""}
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
                    <span className="text-xs text-gray-500 ml-2">(101 Reviews)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Open until 9:00 PM today - 9:30 AM to 9:00 PM</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button className="bg-amber-500 text-white text-xs rounded-full px-4 py-1">Message</button>
                  <button className="bg-amber-500 text-white text-xs rounded-full px-4 py-1">Call</button>
                </div>
                
                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Items</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                      <img src="/pic3.png" alt="Coffee" className="h-full w-full object-cover" />
                    </div>
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                      <img src="/pic2.png" alt="Pastry" className="h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;