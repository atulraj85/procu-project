'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import RFPConversation from '@/components/shared/RFPConversation';

// Updated interface for line items (products are now JSONB)
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  specifications?: any;
  estimatedPrice?: number;
}

// Interface for organization
interface Organization {
  id: string;
  name: string;
  legalName: string;
  gstin?: string;
  address: string;
}

// Interface for createdBy object
interface CreatedByObject {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
}

// Interface for approval
interface Approval {
  id: string;
  stage: string;
  sequence: number;
  approved: boolean | null;
  approvedAt?: string;
  comments?: string;
  approver: {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: string;
  };
}

// Interface for quotation
interface Quotation {
  id: string;
  quotationNumber?: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  submittedAt?: string;
  isShortlisted: boolean;
  evaluationScore?: number;
  vendor: {
    id: string;
    companyName: string;
    email?: string;
    phone?: string;
    status: string;
  } | null;
}

// Interface for vendor invitation
interface VendorInvitation {
  id: string;
  invitedAt: string;
  viewedAt?: string;
  vendor: {
    id: string;
    companyName: string;
    email?: string;
    phone?: string;
    status: string;
  } | null;
  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Updated main interface
interface DetailedRFP {
  id: string;
  rfpNumber: string;        // Updated from rfpId
  title: string;           // Added title
  description?: string;    // Added description
  status: string;          // Updated field name
  deliveryLocation: string;
  deliveryStates: string[];
  deliveryDate: string;
  estimatedBudget?: number;
  currency: string;
  quotationCutoffDate: string;
  rejectionReason?: string;
  createdAt: string;       // Updated from createdDate
  updatedAt: string;
  
  // JSONB fields
  lineItems: LineItem[];   // Updated from products
  questionAnswers: any;
  selectionCriteria: any;
  
  // Relations
  organization: Organization | null;
  createdBy: CreatedByObject | null;
  approvals: Approval[];
  quotations: Quotation[];
  vendorInvitations: VendorInvitation[];
  
  // Computed fields
  totalQuotations: number;
  shortlistedQuotations: number;
  invitedVendors: number;
  hasActivePO: boolean;
  
  // Action flags (you may need to add these in your API)
  canAddQuotation?: boolean;
  canCreatePO?: boolean;
  canEdit?: boolean;
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
        console.log('API Response:', response.data);
        setRfp(response.data);
        setError(null);
      } catch (err) {
        const error = err as AxiosError<{ error: string; details?: string }>;
        let errorMessage = 'Failed to fetch RFP details';
        
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
          if (error.response.data.details) {
            errorMessage += `: ${error.response.data.details}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRfpDetails();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'bg-gray-50 text-gray-700 border-gray-200',
      'PENDING_APPROVAL': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'APPROVED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
      'SENT_TO_VENDORS': 'bg-blue-50 text-blue-700 border-blue-200',
      'QUOTATION_RECEIVED': 'bg-purple-50 text-purple-700 border-purple-200',
      'VENDOR_SELECTED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'PO_GENERATED': 'bg-teal-50 text-teal-700 border-teal-200',
      'DELIVERED': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'COMPLETED': 'bg-green-50 text-green-800 border-green-300',
      'CANCELLED': 'bg-red-50 text-red-700 border-red-200',
    };
    return statusColors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-400';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-400';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-400';
      case 'SENT_TO_VENDORS':
      case 'QUOTATION_RECEIVED':
        return 'bg-blue-400';
      default:
        return 'bg-slate-400';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    };
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
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
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
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
              <h2 className="text-lg font-semibold text-amber-900">RFP Not Found</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-slate-700">The requested RFP could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const createdDateTime = formatDateTime(rfp.createdAt);
  const deliveryDate = formatDate(rfp.deliveryDate);
  const cutoffDate = formatDate(rfp.quotationCutoffDate);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
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
                <h2 className="text-2xl font-bold text-white mb-1">{rfp.rfpNumber}</h2>
                <h3 className="text-xl text-green-100 mb-2">{rfp.title}</h3>
                {rfp.description && (
                  <p className="text-green-100 text-sm">{rfp.description}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rfp.status)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusIcon(rfp.status)}`}></div>
                  {rfp.status.replace(/_/g, ' ')}
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
                    <label className="block text-sm font-medium text-slate-500 mb-1">RFP Number</label>
                    <p className="text-lg font-medium text-slate-900">{rfp.rfpNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Title</label>
                    <p className="text-lg text-slate-900">{rfp.title}</p>
                  </div>
                  {rfp.estimatedBudget && (
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Estimated Budget</label>
                      <p className="text-lg text-slate-900">{formatCurrency(rfp.estimatedBudget)}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Delivery Location</label>
                    <p className="text-lg text-slate-900">{rfp.deliveryLocation}</p>
                  </div>
                  {rfp.deliveryStates && rfp.deliveryStates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Delivery States</label>
                      <div className="flex flex-wrap gap-1">
                        {rfp.deliveryStates.map((state, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                            {state}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Created Date</label>
                    <p className="text-lg text-slate-900">{createdDateTime.date}</p>
                    <p className="text-sm text-slate-500">{createdDateTime.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Delivery Date</label>
                    <p className="text-lg text-slate-900">{deliveryDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Quotation Cutoff</label>
                    <p className="text-lg text-slate-900">{cutoffDate}</p>
                  </div>
                </div>
              </div>
              
              {rfp.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <label className="block text-sm font-medium text-red-700 mb-2">Rejection Reason</label>
                  <p className="text-slate-900 leading-relaxed">{rfp.rejectionReason}</p>
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
                  <span className="text-sm font-medium text-slate-500">Line Items</span>
                  <span className="text-2xl font-bold text-blue-600">{rfp.lineItems?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Total Quotations</span>
                  <span className="text-2xl font-bold text-emerald-600">{rfp.totalQuotations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Shortlisted</span>
                  <span className="text-2xl font-bold text-purple-600">{rfp.shortlistedQuotations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Invited Vendors</span>
                  <span className="text-2xl font-bold text-orange-600">{rfp.invitedVendors}</span>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            {rfp.organization && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Organization</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-slate-900">{rfp.organization.name}</p>
                      <p className="text-sm text-slate-500">{rfp.organization.legalName}</p>
                    </div>
                    {rfp.organization.gstin && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">GSTIN:</span> {rfp.organization.gstin}
                      </div>
                    )}
                    <div className="text-sm text-slate-600">
                      {rfp.organization.address}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Creator Information */}
            {rfp.createdBy && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Created By</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {rfp.createdBy.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{rfp.createdBy.name}</p>
                      <p className="text-sm text-slate-500">{rfp.createdBy.role.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-slate-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {rfp.createdBy.email}
                    </div>
                    {rfp.createdBy.mobile && (
                      <div className="flex items-center text-slate-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {rfp.createdBy.mobile}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        {rfp.lineItems && rfp.lineItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
                <span className="text-sm text-slate-500">{rfp.lineItems.length} items</span>
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
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                      Quantity
                    </th>
                    {rfp.lineItems.some(item => item.estimatedPrice) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                        Est. Price
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {rfp.lineItems.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 max-w-xs lg:max-w-md xl:max-w-lg">
                          {item.description}
                          {item.specifications && (
                            <div className="text-xs text-slate-500 mt-1">
                              Specifications available
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                          {item.quantity?.toLocaleString()}
                        </span>
                      </td>
                      {rfp.lineItems.some(item => item.estimatedPrice) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {item.estimatedPrice ? formatCurrency(item.estimatedPrice) : '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approvals Section */}
        {rfp.approvals && rfp.approvals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Approval Workflow</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {rfp.approvals
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((approval, index) => (
                    <div key={approval.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          approval.approved === true ? 'bg-green-100 text-green-600' :
                          approval.approved === false ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {approval.approved === true ? '✓' : 
                           approval.approved === false ? '✗' : 
                           index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-slate-900">{approval.approver.name}</p>
                          <span className="text-xs text-slate-500">({approval.stage.replace(/_/g, ' ')})</span>
                        </div>
                        <p className="text-sm text-slate-500">{approval.approver.email}</p>
                        {approval.comments && (
                          <p className="text-sm text-slate-600 mt-1 italic">"{approval.comments}"</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          approval.approved === true ? 'bg-green-100 text-green-700' :
                          approval.approved === false ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {approval.approved === true ? 'Approved' :
                           approval.approved === false ? 'Rejected' :
                           'Pending'}
                        </span>
                        {approval.approvedAt && (
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(approval.approvedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Quotations Summary */}
        {rfp.quotations && rfp.quotations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Quotations</h3>
                <span className="text-sm text-slate-500">
                  {rfp.quotations.length} received, {rfp.shortlistedQuotations} shortlisted
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {rfp.quotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {quotation.vendor?.companyName || 'Unknown Vendor'}
                          </div>
                          {quotation.quotationNumber && (
                            <div className="text-sm text-slate-500">{quotation.quotationNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{formatCurrency(quotation.totalAmount)}</div>
                        <div className="text-xs text-slate-500">
                          Subtotal: {formatCurrency(quotation.subtotal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                            {quotation.status.replace(/_/g, ' ')}
                          </span>
                          {quotation.isShortlisted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Shortlisted
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {quotation.evaluationScore || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {quotation.submittedAt ? formatDate(quotation.submittedAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          {rfp.canEdit && (
            <button 
              onClick={() => router.push(`/dashboard/user/rfp/edit/${rfp.id}`)}
              className="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit RFP
            </button>
          )}
          
          {rfp.canAddQuotation && (
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Invite Vendors
            </button>
          )}
          
          {rfp.canCreatePO && (
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Purchase Order
            </button>
          )}

          <RFPConversation rfpId={rfp.id} />
        </div>
      </div>
    </div>
  );
};

export default RfpViewPage;
