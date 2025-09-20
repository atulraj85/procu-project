import React, { useState } from 'react';

interface Reference {
  clientCompanyName: string;
  clientIndustry: string;
  projectDescription: string;
  servicePeriodStart: string;
  servicePeriodEnd: string;
  contactPersonName: string;
  contactEmail: string;
  isPublic: boolean;
}

interface ReferencesInfoProps {
  data: {
    references: Reference[];
  };
  updateData: (newData: { references: Reference[] }) => void;
}

const ReferencesInfo: React.FC<ReferencesInfoProps> = ({ data, updateData }) => {
  const [refForm, setRefForm] = useState<Reference>({
    clientCompanyName: '',
    clientIndustry: '',
    projectDescription: '',
    servicePeriodStart: '',
    servicePeriodEnd: '',
    contactPersonName: '',
    contactEmail: '',
    isPublic: false,
  });

  const addReference = () => {
    if (
      refForm.clientCompanyName &&
      refForm.clientIndustry &&
      refForm.contactPersonName &&
      refForm.contactEmail
    ) {
      const references = [...(data.references || []), refForm];
      updateData({ references });
      setRefForm({
        clientCompanyName: '',
        clientIndustry: '',
        projectDescription: '',
        servicePeriodStart: '',
        servicePeriodEnd: '',
        contactPersonName: '',
        contactEmail: '',
        isPublic: false,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">References</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client Company Name *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={refForm.clientCompanyName}
            onChange={(e) => setRefForm({ ...refForm, clientCompanyName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Client Industry *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={refForm.clientIndustry}
            onChange={(e) => setRefForm({ ...refForm, clientIndustry: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Project Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={refForm.projectDescription}
            onChange={(e) => setRefForm({ ...refForm, projectDescription: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Service Period Start</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={refForm.servicePeriodStart}
            onChange={(e) => setRefForm({ ...refForm, servicePeriodStart: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Service Period End</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={refForm.servicePeriodEnd}
            onChange={(e) => setRefForm({ ...refForm, servicePeriodEnd: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Person Name *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={refForm.contactPersonName}
            onChange={(e) => setRefForm({ ...refForm, contactPersonName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Email *</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={refForm.contactEmail}
            onChange={(e) => setRefForm({ ...refForm, contactEmail: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={refForm.isPublic}
              onChange={(e) => setRefForm({ ...refForm, isPublic: e.target.checked })}
            />
            <span className="text-sm font-medium">Make this reference public</span>
          </label>
        </div>
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={addReference}
      >
        Add Reference
      </button>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Added References</h3>
        {data.references?.map((ref, index) => (
          <div key={index} className="p-4 border rounded mt-2 bg-gray-50">
            <div className="flex justify-between">
              <span className="font-medium">{ref.clientCompanyName}</span>
              <button
                className="text-red-500"
                onClick={() => {
                  const references = data.references.filter((_, i) => i !== index);
                  updateData({ references });
                }}
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>Industry: {ref.clientIndustry}</div>
              <div>Contact: {ref.contactPersonName}</div>
              <div>
                Period: {ref.servicePeriodStart && ref.servicePeriodEnd ? `${new Date(ref.servicePeriodStart).toLocaleDateString()} - ${new Date(ref.servicePeriodEnd).toLocaleDateString()}` : 'N/A'}
              </div>
              <div>Public: {ref.isPublic ? 'Yes' : 'No'}</div>
            </div>
            {ref.projectDescription && (
              <div className="mt-2">
                <div className="font-medium">Project Description:</div>
                <p className="text-sm mt-1">{ref.projectDescription}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferencesInfo;
