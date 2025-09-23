'use client';

import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth';

// Updated interface to match the new API response structure
interface RFP {
  id: string;
  rfpNumber: string;      // Changed from rfpId to rfpNumber
  title: string;          // Added title
  description?: string;   // Added description
  status: string;         // Changed from requirementType to status  
  estimatedBudget?: number; // Added budget
  deliveryDate: string;
  createdAt: string;      // Changed from createdDate to createdAt
  createdBy: string;      // Added creator name
  createdByEmail?: string; // Added creator email
  quotationCount: number;
  quotations: any[];      // Added quotations array
  canAddQuotation: boolean;
  canCreatePO: boolean;
  canEdit: boolean;
}

// API Response interface to match the new structure
interface APIResponse {
  data: RFP[];
  total: number;
  filters: {
    createdBy?: string;
    userId?: string;
  };
  sorting: {
    sortBy: string;
    order: string;
  };
}

const RfpListPage: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    const fetchRfps = async () => {
      try {
        setLoading(true);
        
        // Get current user ID - replace with your actual auth logic
        const userId = user?.id; // You'll need to implement this
        // Updated API endpoint with new parameter structure
        const response = await axios.get<APIResponse>(`/api/rfp/summary?createdBy=${userId}&sortBy=createdAt&order=desc`);
        
        // Handle the new response structure
        if (response.data && response.data.data) {
          setRfps(response.data.data);
        } else {
          // Fallback for direct array response
          setRfps(Array.isArray(response.data) ? response.data : []);
        }
        
        setError(null);
      } catch (err) {
        const error = err as AxiosError<{ error: string; details?: string }>;
        
        // Enhanced error handling
        let errorMessage = 'Failed to fetch RFP data';
        
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            errorMessage += `: ${error.response.data.details}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        console.error('RFP fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRfps();
  }, []);


  const handleRfpClick = (id: string) => {
    router.push(`/dashboard/user/rfp/view/${id}`);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'text-gray-600 bg-gray-100',
      'PENDING_APPROVAL': 'text-yellow-600 bg-yellow-100',
      'APPROVED': 'text-blue-600 bg-blue-100',
      'SENT_TO_VENDORS': 'text-purple-600 bg-purple-100',
      'QUOTATION_RECEIVED': 'text-indigo-600 bg-indigo-100',
      'VENDOR_SELECTED': 'text-green-600 bg-green-100',
      'PO_GENERATED': 'text-teal-600 bg-teal-100',
      'COMPLETED': 'text-green-700 bg-green-200',
      'CANCELLED': 'text-red-600 bg-red-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-8 w-8 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg font-medium text-green-800">Loading RFPs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600 bg-red-50 px-6 py-4 rounded-lg border border-red-200 mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-green-800">My RFPs</h1>
        <div className="text-sm text-gray-600">
          Total: {rfps.length} RFP{rfps.length !== 1 ? 's' : ''}
        </div>
      </div>

      {rfps.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RFPs found</h3>
          <p className="text-gray-500 mb-4">You haven't created any RFPs yet.</p>
          <button 
            onClick={() => router.push('/dashboard/user/rfp/create')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your First RFP
          </button>
        </div>
      ) : (
        <div className="shadow-lg rounded-lg overflow-hidden border border-green-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">RFP Number</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Budget</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Quotations</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Created Date</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Delivery Date</th>
                <th className="py-3 px-4 text-left font-medium text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfps.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-green-50 transition-colors border-b border-green-100">
                  <td className="py-3 px-4 text-green-900">
                    <span
                      className="cursor-pointer hover:underline hover:text-green-700 font-medium"
                      onClick={() => handleRfpClick(rfp.id)}
                    >
                      {rfp.rfpNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-green-900">
                    <div>
                      <div className="font-medium">{rfp.title}</div>
                      {rfp.description && (
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {rfp.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}>
                      {rfp.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-green-900">
                    {formatCurrency(rfp.estimatedBudget)}
                  </td>
                  <td className="py-3 px-4 text-green-900">
                    <div className="flex items-center space-x-2">
                      <span>{rfp.quotationCount}</span>
                      {rfp.quotationCount > 0 && (
                        <span className="text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-green-900">
                    {new Date(rfp.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-green-900">
                    {new Date(rfp.deliveryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRfpClick(rfp.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View
                      </button>
                      {/* {rfp.canEdit && (
                        <button
                          onClick={() => router.push(`/dashboard/user/rfp/edit/${rfp.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      )} */}
                      {rfp.canCreatePO && (
                        <button
                          onClick={() => router.push(`/dashboard/user/rfp/create-po/${rfp.id}`)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Create PO
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RfpListPage;
