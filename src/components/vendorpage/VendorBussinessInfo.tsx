"use client";
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface VendorBusinessInfoProps {
  data: any;
  updateData: (data: any) => void;
  handleNextStep: () => void;
}

const VendorBusinessInfo: React.FC<VendorBusinessInfoProps> = ({
  data,
  updateData,
  handleNextStep,
}) => {
  const [formData, setFormData] = useState({
    description: data.description || '',
    specializations: data.specializations || [],
    dealingKeywords: data.dealingKeywords || [],
    businessRegistrationYear: data.businessRegistrationYear || '',
    employeeCount: data.employeeCount || '',
    gstin: data.gstin || '',
    pan: data.pan || '',
    website: data.website || '',
    ...data
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateData(updated);
  };

  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.specializations.includes(specializationInput.trim())) {
      const updated = [...formData.specializations, specializationInput.trim()];
      handleInputChange('specializations', updated);
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (spec: string) => {
    const updated = formData.specializations.filter((s: string) => s !== spec);
    handleInputChange('specializations', updated);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.dealingKeywords.includes(keywordInput.trim())) {
      const updated = [...formData.dealingKeywords, keywordInput.trim()];
      handleInputChange('dealingKeywords', updated);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const updated = formData.dealingKeywords.filter((k: string) => k !== keyword);
    handleInputChange('dealingKeywords', updated);
  };

  const predefinedKeywords = [
    'IT Equipment', 'Office Furniture', 'Stationery', 'Electronics', 'Industrial Equipment',
    'Software', 'Hardware', 'Networking', 'Security Systems', 'Maintenance Services',
    'Consulting', 'Training', 'Transportation', 'Catering', 'Cleaning Services'
  ];

  const employeeRanges = [
    '1-10', '11-50', '51-100', '101-500', '501-1000', '1000+'
  ];

  return (
    <div className=" w-full flex flex-col md:flex-row gap-8 ">
      <div className=" space-y-6 p-2 max-w-2xl m-auto bg-white rounded-lg ">
      <div>
        <h2 className="text-2xl font-bold mb-4">Business Information</h2>
        <div className="grid grid-cols-4 gap-8">
            <div className="h-1 bg-primary  rounded"></div>
            <div className="h-1 bg-primary  rounded"></div>
            <div className="h-1 bg-primary  rounded"></div>
            <div className="h-1 bg-primary  rounded"></div>
          </div>
      </div>

      {/* Company Description */}
      <div>
        <Label htmlFor="description">Company Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your business, products, and services..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {/* Business Registration Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessRegistrationYear">Business Registration Year</Label>
          <Input
            id="businessRegistrationYear"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.businessRegistrationYear}
            onChange={(e) => handleInputChange('businessRegistrationYear', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="employeeCount">Employee Count Range</Label>
          <select
            id="employeeCount"
            className="w-full p-2 border rounded-md"
            value={formData.employeeCount}
            onChange={(e) => handleInputChange('employeeCount', e.target.value)}
          >
            <option value="">Select range</option>
            {employeeRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gstin">GSTIN</Label>
          <Input
            id="gstin"
            placeholder="29ABCDE1234F1Z6"
            value={formData.gstin}
            onChange={(e) => handleInputChange('gstin', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pan">PAN</Label>
          <Input
            id="pan"
            placeholder="ABCDE1234F"
            value={formData.pan}
            onChange={(e) => handleInputChange('pan', e.target.value)}
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://www.yourcompany.com"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
        />
      </div>

      {/* Specializations */}
      <div>
        <Label>Business Specializations *</Label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="e.g., Manufacturing, IT Services, Consulting"
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
          />
          <Button type="button" onClick={addSpecialization}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specializations.map((spec: string, index: number) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {spec}
              <X size={14} className="cursor-pointer" onClick={() => removeSpecialization(spec)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Dealing Keywords */}
      <div>
        <Label>Products/Services Keywords *</Label>
        <p className="text-sm text-gray-600 mb-2">
          Add keywords that describe what you deal in (helps in RFP matching)
        </p>
        
        {/* Quick Add Buttons */}
        <div className="mb-3">
          <p className="text-sm font-medium mb-2">Quick Add:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedKeywords.map(keyword => (
              <Button
                key={keyword}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!formData.dealingKeywords.includes(keyword)) {
                    handleInputChange('dealingKeywords', [...formData.dealingKeywords, keyword]);
                  }
                }}
                disabled={formData.dealingKeywords.includes(keyword)}
              >
                {keyword}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="e.g., laptops, office chairs, printers"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
          />
          <Button type="button" onClick={addKeyword}>Add</Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {formData.dealingKeywords.map((keyword: string, index: number) => (
            <Badge key={index} variant="default" className="flex items-center gap-1">
              {keyword}
              <X size={14} className="cursor-pointer" onClick={() => removeKeyword(keyword)} />
            </Badge>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleNextStep} 
        className="w-full"
        disabled={!formData.description || formData.specializations.length === 0 || formData.dealingKeywords.length === 0}
      >
        Continue
      </Button>
        </div>

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
                      <span className="text-lg font-bold text-gray-400">
                        CW
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Cafe Wink</h3>
                      <p className="text-xs text-gray-500">
                        Restaurant and Coffee
                      </p>
                      <p className="text-xs text-gray-500">
                        {data.primaryContactName
                          ? `Contact: ${data.primaryContactName}`
                          : ""}
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
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                      <img
                        src="/pic3.png"
                        alt="Coffee"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="bg-gray-100 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                      <img
                        src="/pic2.png"
                        alt="Pastry"
                        className="h-full w-full object-cover"
                      />
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

export default VendorBusinessInfo;
