import React from 'react';

interface BusinessInfoProps {
  data: {
    employeeCountRange?: string;
    annualRevenueRange?: string;
    regulatoryLicenses?: string[];
    insuranceCoverage?: any; // You can specify a more precise type if you know the structure
  };
  updateData: (newData: Partial<BusinessInfoProps['data']>) => void;
}

const BusinessInfo: React.FC<BusinessInfoProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Business Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Employee Count Range</label>
          <select
            className="w-full p-2 border rounded"
            value={data.employeeCountRange || ''}
            onChange={(e) => updateData({ employeeCountRange: e.target.value })}
          >
            <option value="">Select Range</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Annual Revenue Range</label>
          <select
            className="w-full p-2 border rounded"
            value={data.annualRevenueRange || ''}
            onChange={(e) => updateData({ annualRevenueRange: e.target.value })}
          >
            <option value="">Select Range</option>
            <option value="<1M">Less than $1M</option>
            <option value="1M-5M">$1M - $5M</option>
            <option value="5M-20M">$5M - $20M</option>
            <option value="20M+">$20M+</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Regulatory Licenses</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded"
              placeholder="Add license and press Enter"
              onKeyDown={(e) => {
                const target = e.target as HTMLInputElement; // Cast to HTMLInputElement
                if (e.key === 'Enter' && target.value) {
                  e.preventDefault();
                  const licenses = [...(data.regulatoryLicenses || []), target.value];
                  updateData({ regulatoryLicenses: licenses });
                  target.value = '';
                }
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.regulatoryLicenses?.map((license, index) => (
              <span
                key={index}
                className="bg-blue-100 px-2 py-1 rounded flex items-center"
              >
                {license}
                <button
                  className="ml-2 text-red-500"
                  onClick={() => {
                    const licenses = data.regulatoryLicenses?.filter((_, i) => i !== index);
                    updateData({ regulatoryLicenses: licenses });
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Insurance Coverage</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Enter insurance coverage details in JSON format"
            value={data.insuranceCoverage ? JSON.stringify(data.insuranceCoverage, null, 2) : ''}
            onChange={(e) => {
              try {
                const coverage = JSON.parse(e.target.value);
                updateData({ insuranceCoverage: coverage });
              } catch (error) {
                // Handle invalid JSON
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;
