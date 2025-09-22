import React, { useState } from 'react';

interface Certification {
  name: string;
  issuer: string;
  issueDate: string; // ISO date string
  expiryDate: string; // ISO date string
  certificationNumber?: string;
  verificationUrl?: string;
}

interface CertificationsInfoProps {
  data: {
    certifications?: Certification[];
  };
  updateData: (newData: Partial<CertificationsInfoProps['data']>) => void;
}

const CertificationsInfo: React.FC<CertificationsInfoProps> = ({ data, updateData }) => {
  const [certForm, setCertForm] = useState<Certification>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    certificationNumber: '',
    verificationUrl: ''
  });

  const addCertification = () => {
    if (certForm.name && certForm.issuer && certForm.issueDate && certForm.expiryDate) {
      const certifications = [...(data.certifications || []), certForm];
      updateData({ certifications });
      setCertForm({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        certificationNumber: '',
        verificationUrl: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Certifications</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Certification Name *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={certForm.name}
            onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issuing Body *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={certForm.issuer}
            onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issue Date *</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={certForm.issueDate}
            onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date *</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={certForm.expiryDate}
            onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Certification Number</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={certForm.certificationNumber}
            onChange={(e) => setCertForm({ ...certForm, certificationNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Verification URL</label>
          <input
            type="url"
            className="w-full p-2 border rounded"
            value={certForm.verificationUrl}
            onChange={(e) => setCertForm({ ...certForm, verificationUrl: e.target.value })}
          />
        </div>
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={addCertification}
      >
        Add Certification
      </button>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Added Certifications</h3>
        {data.certifications?.map((cert, index) => (
          <div key={index} className="p-4 border rounded mt-2 bg-gray-50">
            <div className="flex justify-between">
              <span className="font-medium">{cert.name}</span>
              <button
                className="text-red-500"
                onClick={() => {
                  const certifications = data.certifications?.filter((_, i) => i !== index);
                  updateData({ certifications });
                }}
              >
                Remove
              </button>
           
              </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>Issuer: {cert.issuer}</div>
              <div>Number: {cert.certificationNumber}</div>
              <div>Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
              <div>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsInfo;
