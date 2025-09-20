'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

interface Product {
  id: string;
  description: string;
  quantity: number;
}

// Interface for createdBy when it's an object
interface CreatedByObject {
  name: string;
  email: string;
  mobile: string;
  role: string;
}

interface DetailedRFP {
  id: string;
  rfpId: string;
  requirementType: string;
  status?: string | null;
  reason: string;
  products: Product[];
  productCount: number;
  quotationCount: number;
  createdDate: string;
  deliveryDate: string;
  createdBy: string | CreatedByObject; // Support both string and object
  canAddQuotation: boolean;
  canCreatePO: boolean;
}

const RfpViewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [rfp, setRfp] = useState<DetailedRFP | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRfpDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get<DetailedRFP>(`/api/rfp/${id}`);
        console.log('API Response:', response.data); // Debug the response
        setRfp(response.data);
        setError(null);
      } catch (err) {
        const error = err as AxiosError;
        setError(error.message || 'Failed to fetch RFP details');
      } finally {
        setLoading(false);
      }
    };

    fetchRfpDetails();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Helper function to render createdBy
  const renderCreatedBy = (createdBy: string | CreatedByObject) => {
    if (typeof createdBy === 'string') {
      return createdBy || 'Unknown';
    }
    return createdBy.name || createdBy.email || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Loading RFP Details</h3>
              <p className="text-sm text-slate-500">Please wait while we fetch the information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-red-900">Error Loading RFP</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-slate-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h2 className="text-lg font-semibold text-amber-900">RFP Not Found</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-slate-700">The requested RFP could not be found. It may have been deleted or the ID is incorrect.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
            <div className="flex items-center text-sm text-slate-500">
              <span>RFP Management</span>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-900 font-medium">RFP Details</span>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-slate-900">Request for Proposal</h1>
            <p className="text-sm text-slate-500 mt-1">View and manage RFP details</p>
          </div>
        </div>

        {/* RFP Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{rfp.rfpId}</h2>
                <p className="text-green-100">{rfp.requirementType}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rfp.status)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${rfp.status?.toLowerCase() === 'approved' ? 'bg-emerald-400' : 
                    rfp.status?.toLowerCase() === 'pending' ? 'bg-amber-400' :
                    rfp.status?.toLowerCase() === 'rejected' ? 'bg-red-400' :
                    rfp.status?.toLowerCase() === 'submitted' ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                  {rfp.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">RFP ID</label>
                    <p className="text-lg font-medium text-slate-900">{rfp.rfpId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Internal ID</label>
                    <p className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded">{rfp.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Requirement Type</label>
                    <p className="text-lg text-slate-900">{rfp.requirementType}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Created Date</label>
                    <p className="text-lg text-slate-900">
                      {new Date(rfp.createdDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(rfp.createdDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Delivery Date</label>
                    <p className="text-lg text-slate-900">
                      {new Date(rfp.deliveryDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {rfp.reason && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <label className="block text-sm font-medium text-slate-500 mb-2">Reason</label>
                  <p className="text-slate-900 leading-relaxed">{rfp.reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Statistics</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Products</span>
                  <span className="text-2xl font-bold text-blue-600">{rfp.productCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Quotations</span>
                  <span className="text-2xl font-bold text-emerald-600">{rfp.quotationCount}</span>
                </div>
              </div>
            </div>

            {/* Creator Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Created By</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {renderCreatedBy(rfp.createdBy).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{renderCreatedBy(rfp.createdBy)}</p>
                    {typeof rfp.createdBy === 'object' && rfp.createdBy.role && (
                      <p className="text-sm text-slate-500">{rfp.createdBy.role}</p>
                    )}
                  </div>
                </div>
                {typeof rfp.createdBy === 'object' && (
                  <div className="space-y-2 text-sm">
                    {rfp.createdBy.email && (
                      <div className="flex items-center text-slate-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {rfp.createdBy.email}
                      </div>
                    )}
                    {rfp.createdBy.mobile && (
                      <div className="flex items-center text-slate-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {rfp.createdBy.mobile}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Permissions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Permissions</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Add Quotation</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rfp.canAddQuotation ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {rfp.canAddQuotation ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Create PO</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rfp.canCreatePO ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {rfp.canCreatePO ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Products</h3>
              <span className="text-sm text-slate-500">{rfp.productCount} items</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {rfp.products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                        {product.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs lg:max-w-md xl:max-w-lg">
                        {product.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        {product.quantity.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          {rfp.canAddQuotation && (
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Quotation
            </button>
          )}
          {rfp.canCreatePO && (
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Purchase Order
            </button>
          )}
          {/* <button className="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Details
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default RfpViewPage;