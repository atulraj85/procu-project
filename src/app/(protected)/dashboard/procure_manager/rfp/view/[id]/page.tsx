"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Building,
  DollarSign,
  Package,
  MessageSquare,
  MessageCircleMore,
  PlusCircle,
  Trash2,
  Search,
  Mail,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { FaRupeeSign } from "react-icons/fa";
import RFPConversation from "@/components/shared/RFPConversation";
import { useCurrentUser } from "@/hooks/auth";
import { debounce } from "lodash";

// Updated interfaces
interface LineItem {
  productName: string;
  description: string;
  quantity: number;
  specifications?: Record<string, string>;
  estimatedUnitPrice?: number;
  urgency?: string;
}

interface QuestionAnswers {
  usage_type: string;
  request_type: string;
  required_date: string;
  client_related: string;
  request_reason: string;
  quantity_needed: number;
  specific_request: string;
  replacement_reason?: string;
  business_justification?: string;
}

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

interface Vendor {
  id: string;
  name: string;
  vendorName?: string; // For backward compatibility
  email?: string;
  specifications?: Record<string, string>;
}

interface RFPData {
  id: string;
  rfpNumber: string;
  title: string;
  description?: string;
  deliveryLocation: string;
  deliveryStates: string[];
  deliveryDate: string;
  estimatedBudget?: number;
  currency: string;
  status: string;
  quotationCutoffDate: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  questionAnswers: QuestionAnswers;
  selectionCriteria: any;
  organization: {
    id: string;
    name: string;
    legalName: string;
    gstin?: string;
    address: string;
  } | null;
  approvals: Approval[];
  createdBy: {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: string;
  } | null;
  quotations: any[];
  totalQuotations: number;
}

interface Specification {
  key: string;
  value: string;
}

const ViewRFPForApproval: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;

  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLineItemForm, setShowLineItemForm] = useState<boolean>(true); // Form visible by default
  const [quotationCutoffDate, setQuotationCutoffDate] = useState<string>(""); // New state for quotationCutoffDate

  // Approval/Rejection state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Line Item Form State
  const [newLineItem, setNewLineItem] = useState<LineItem>({
    productName: "",
    description: "",
    quantity: 0,
    estimatedUnitPrice: undefined,
    urgency: "",
    specifications: {},
  });
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Vendor Search State
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [vendorSearchResults, setVendorSearchResults] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [vendorSearchLoading, setVendorSearchLoading] = useState(false);
  const [vendorSearchError, setVendorSearchError] = useState<string | null>(null);

  const user = useCurrentUser();

  // Debounced vendor search
  const debouncedSearchVendors = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setVendorSearchResults([]);
        return;
      }
      setVendorSearchLoading(true);
      setVendorSearchError(null);
      try {
        const response = await fetch(`/api/vendor/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }
        const data = await response.json();
        // Filter out already selected vendors
        const availableVendors = (data.results || []).filter(
          (vendor: Vendor) => !selectedVendors.some((sv) => sv.id === vendor.id)
        );
        setVendorSearchResults(availableVendors);
      } catch (err) {
        setVendorSearchError(err instanceof Error ? err.message : "An error occurred while searching vendors");
        setVendorSearchResults([]);
      } finally {
        setVendorSearchLoading(false);
      }
    }, 300),
    [selectedVendors]
  );

  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const response = await fetch(`/api/rfp/${rfpId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RFP data");
        }
        const data: RFPData = await response.json();
        setRfpData({ ...data, lineItems: [] });
        setQuotationCutoffDate(data.quotationCutoffDate || ""); // Initialize with fetched value
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (rfpId) {
      fetchRFP();
    }
  }, [rfpId]);

  useEffect(() => {
    if (keywords.length > 0) {
      debouncedSearchVendors(keywords.join(' '));
    } else {
      setVendorSearchResults([]);
    }
  }, [keywords, debouncedSearchVendors]);

  // Vendor selection handlers
  const handleSelectVendor = (vendor: Vendor) => {
    if (!selectedVendors.some((sv) => sv.id === vendor.id)) {
      setSelectedVendors([...selectedVendors, vendor]);
      toast({
        title: "Vendor Selected",
        description: `${vendor.name || vendor.vendorName} has been added to the selection.`,
      });
    }
  };

  const handleDeselectVendor = (vendorId: string) => {
    const updatedVendors = selectedVendors.filter((vendor) => vendor.id !== vendorId);
    setSelectedVendors(updatedVendors);
    toast({
      title: "Vendor Removed",
      description: "Vendor has been removed from selection.",
    });
  };

  const handleAddLineItem = () => {
    if (!newLineItem.productName || newLineItem.quantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Product name and quantity are required.",
        variant: "destructive",
      });
      return;
    }

    const specs: Record<string, string> = {};
    specifications.forEach(({ key, value }) => {
      if (key && value) {
        specs[key] = value;
      }
    });

    const updatedLineItem = { ...newLineItem, specifications: Object.keys(specs).length > 0 ? specs : undefined };

    if (editingIndex !== null) {
      const updatedLineItems = [...lineItems];
      updatedLineItems[editingIndex] = updatedLineItem;
      setLineItems(updatedLineItems);
      setEditingIndex(null);
    } else {
      setLineItems([...lineItems, updatedLineItem]);
    }

    // Reset form and hide it
    setNewLineItem({
      productName: "",
      description: "",
      quantity: 0,
      estimatedUnitPrice: undefined,
      urgency: "",
      specifications: {},
    });
    setSpecifications([]);
    setShowLineItemForm(false);
    toast({
      title: editingIndex !== null ? "Line Item Updated" : "Line Item Added",
      description: "Line item has been successfully added/updated.",
    });
  };

  const handleEditLineItem = (index: number) => {
    const item = lineItems[index];
    setNewLineItem(item);
    setEditingIndex(index);
    setSpecifications(
      item.specifications
        ? Object.entries(item.specifications).map(([key, value]) => ({ key, value }))
        : []
    );
    setShowLineItemForm(true); // Show form for editing
  };

  const handleDeleteLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    toast({
      title: "Line Item Removed",
      description: "Line item has been successfully removed.",
    });
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleSpecificationChange = (index: number, field: "key" | "value", value: string) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setSpecifications(updatedSpecs);
  };

  const handleDeleteSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleResetForm = () => {
    setNewLineItem({
      productName: "",
      description: "",
      quantity: 0,
      estimatedUnitPrice: undefined,
      urgency: "",
      specifications: {},
    });
    setSpecifications([]);
    setEditingIndex(null);
    setShowLineItemForm(true); // Show form when adding new line item
  };

  console.log("Data sent to backend for approval:", {
    id: rfpId,
    updatedBy: user?.id,
    approvalAction: 'approve',
    approvalComments: approvalComments || 'Approved for next stage',
    lineItems,
    selectedVendorIds: selectedVendors.map(v => v.id),
    sendToVendors: selectedVendors.length > 0,
    quotationCutoffDate,
  });

  const handleApprove = async () => {
    if (!quotationCutoffDate) {
      toast({
        title: "Invalid Input",
        description: "Quotation cutoff date is required.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      console.log("Data sent to backend for approval:", {
        id: rfpId,
        updatedBy: user?.id,
        approvalAction: 'approve',
        approvalComments: approvalComments || 'Approved for next stage',
        lineItems,
        selectedVendorIds: selectedVendors.map(v => v.id),
        sendToVendors: selectedVendors.length > 0,
        quotationCutoffDate,
      });
      const response = await fetch('/api/rfp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rfpId,
          updatedBy: user?.id,
          approvalAction: 'approve',
          approvalComments: approvalComments || 'Approved for next stage',
          lineItems,
          selectedVendorIds: selectedVendors.map(v => v.id),
          sendToVendors: selectedVendors.length > 0,
          quotationCutoffDate,
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "RFP Approved",
          description: data.message,
        });
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to approve RFP');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setShowApproveDialog(false);
      setApprovalComments("");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this RFP",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      console.log("Data sent to backend for rejection:", {
        id: rfpId,
        updatedBy: user?.id,
        approvalAction: 'reject',
        rejectionReason: rejectionReason,
        lineItems,
      });
      const response = await fetch('/api/rfp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rfpId,
          updatedBy: user?.id,
          approvalAction: 'reject',
          rejectionReason: rejectionReason,
          lineItems,
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "RFP Rejected",
          description: data.message,
        });
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to reject RFP');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setShowRejectDialog(false);
      setRejectionReason("");
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'DRAFT': 'bg-gray-500',
      'PENDING_APPROVAL': 'bg-yellow-500',
      'APPROVED': 'bg-green-500',
      'REJECTED': 'bg-red-500',
      'SENT_TO_VENDORS': 'bg-blue-500',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const canApproveOrReject = rfpData?.status === 'DRAFT' || rfpData?.status === 'PENDING_APPROVAL';

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!rfpData) return <div className="p-4">No RFP data found.</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{rfpData.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="font-mono">
                  {rfpData.rfpNumber}
                </Badge>
                <Badge className={getStatusColor(rfpData.status)}>
                  {rfpData.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {rfpData.description && (
            <p className="text-gray-600 mt-2">{rfpData.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Vendor Search - Multiple Selection */}
      <Card className="border border-green-200 shadow-lg rounded-xl bg-white">
        <CardHeader className="bg-green-50 rounded-t-xl px-6 py-4">
          <CardTitle className="flex items-center text-green-800">
            <Building className="w-6 h-6 mr-3 text-green-600" />
            <span className="text-lg font-semibold">Select Vendors ({selectedVendors.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="vendorKeyword" className="text-green-800 font-medium">
                Add Vendor Search Keywords
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="vendorKeyword"
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  placeholder="Enter a keyword (e.g., laptop)"
                  className="border-green-300 focus:ring-green-500 focus:border-green-500"
                />
                <Button
                  onClick={() => {
                    if (vendorSearchQuery.trim()) {
                      setKeywords([...keywords, vendorSearchQuery.trim()]);
                      setVendorSearchQuery('');
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>

            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {keyword}
                    <X
                      className="ml-2 h-3 w-3 cursor-pointer"
                      onClick={() => {
                        const newKeywords = keywords.filter((_, i) => i !== index);
                        setKeywords(newKeywords);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {vendorSearchLoading && <p className="text-sm text-green-600">Searching vendors...</p>}
            {vendorSearchError && <p className="text-sm text-red-600">{vendorSearchError}</p>}

            {/* Available Vendors as Cards */}
            {vendorSearchResults.length > 0 && (
              <div>
                <Label className="text-green-800 font-medium">Available Vendors</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  {vendorSearchResults.map((vendor) => (
                    <Card
                      key={vendor.id}
                      className="border border-green-200 bg-green-50 hover:bg-green-100 transition-colors duration-200 shadow-sm"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Building className="w-5 h-5 text-green-600" />
                            <h4 className="font-medium text-green-800">
                              {vendor.name || vendor.vendorName || "Unknown Vendor"}
                            </h4>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectVendor(vendor)}
                            className="border-green-500 text-green-700 hover:bg-green-200"
                          >
                            Select
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">
                              {vendor.email || "No email provided"}
                            </span>
                          </div>
                          {vendor.specifications && Object.keys(vendor.specifications).length > 0 && (
                            <div>
                              <div className="font-medium text-green-800">Specifications:</div>
                              <div className="mt-1 space-y-1">
                                {Object.entries(vendor.specifications).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize text-green-700">{key.replace("_", " ")}:</span>
                                    <span className="text-gray-600">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Vendors as Cards */}
            {selectedVendors.length > 0 && (
              <div>
                <Label className="text-green-800 font-medium">Selected Vendors ({selectedVendors.length})</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  {selectedVendors.map((vendor) => (
                    <Card
                      key={vendor.id}
                      className="border border-green-300 bg-green-100 shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Building className="w-5 h-5 text-green-600" />
                            <h4 className="font-medium text-green-800">
                              {vendor.name || vendor.vendorName || "Unknown Vendor"}
                            </h4>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeselectVendor(vendor.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">
                              {vendor.email || "No email provided"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">ID: {vendor.id}</span>
                          </div>
                          {vendor.specifications && Object.keys(vendor.specifications).length > 0 && (
                            <div>
                              <div className="font-medium text-green-800">Specifications:</div>
                              <div className="mt-1 space-y-1">
                                {Object.entries(vendor.specifications).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize text-green-700">{key.replace("_", " ")}:</span>
                                    <span className="text-gray-600">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Answers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Request Details & Justification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Usage Type:</Label>
              <p className="text-sm">{rfpData.questionAnswers.usage_type}</p>
            </div>
            <div>
              <Label className="font-medium">Request Type:</Label>
              <p className="text-sm">{rfpData.questionAnswers.request_type}</p>
            </div>
            <div>
              <Label className="font-medium">Required Date:</Label>
              <p className="text-sm">{new Date(rfpData.questionAnswers.required_date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="font-medium">Client Related:</Label>
              <p className="text-sm">{rfpData.questionAnswers.client_related}</p>
            </div>
            <div>
              <Label className="font-medium">Request Reason:</Label>
              <p className="text-sm">{rfpData.questionAnswers.request_reason}</p>
            </div>
            <div>
              <Label className="font-medium">Quantity Needed:</Label>
              <p className="text-sm">{rfpData.questionAnswers.quantity_needed}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div>
              <Label className="font-medium">Specific Request:</Label>
              <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                {rfpData.questionAnswers.specific_request}
              </p>
            </div>
            
            {rfpData.questionAnswers.replacement_reason && (
              <div>
                <Label className="font-medium">Replacement Reason:</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                  {rfpData.questionAnswers.replacement_reason}
                </p>
              </div>
            )}
            
            {rfpData.questionAnswers.business_justification && (
              <div>
                <Label className="font-medium">Business Justification:</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                  {rfpData.questionAnswers.business_justification}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="font-medium">Location:</Label>
            <p className="text-sm mt-1">{rfpData.deliveryLocation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quotation Cutoff Date */}
      <Card className="border border-green-200 rounded-lg bg-white">
        <CardHeader className="bg-green-50 rounded-t-lg px-4 py-2">
          <CardTitle className="flex items-center text-green-800 text-base">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Quotation Cutoff Date
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="quotationCutoffDate" className="text-green-800 font-medium text-sm">
                Quotation Cutoff Date *
              </Label>
              <Input
                id="quotationCutoffDate"
                type="date"
                value={quotationCutoffDate}
                onChange={(e) => setQuotationCutoffDate(e.target.value)}
                className="border-green-300 focus:ring-green-500 focus:border-green-500 mt-1"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="border border-green-200 shadow-lg rounded-xl bg-white">
        <CardHeader className="bg-green-50 rounded-t-xl px-6 py-4">
          <CardTitle className="flex items-center text-green-800">
            <Package className="w-6 h-6 mr-3 text-green-600" />
            <span className="text-lg font-semibold">Line Items ({lineItems.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <Card key={index} className="p-4 border border-green-100 shadow-sm rounded-lg bg-white hover:shadow-md transition-shadow duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="font-medium text-green-800">Product:</Label>
                    <p className="text-sm text-gray-700">{item.productName}</p>
                    {item.urgency && (
                      <Badge
                        variant={item.urgency === "High" ? "destructive" : "secondary"}
                        className={`mt-1 ${item.urgency === "High" ? "bg-red-500" : "bg-green-200 text-green-800"}`}
                      >
                        {item.urgency}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <Label className="font-medium text-green-800">Quantity:</Label>
                    <p className="text-sm text-gray-700">{item.quantity}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-green-800">Est. Unit Price:</Label>
                    <p className="text-sm text-gray-700">{item.estimatedUnitPrice ? formatCurrency(item.estimatedUnitPrice) : "Not specified"}</p>
                  </div>
                  {item.description && (
                    <div className="md:col-span-3">
                      <Label className="font-medium text-green-800">Description:</Label>
                      <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                    </div>
                  )}
                  {item.specifications && Object.keys(item.specifications).length > 0 && (
                    <div className="md:col-span-3">
                      <Label className="font-medium text-green-800">Specifications:</Label>
                      <div className="text-sm mt-1 p-3 bg-green-50 rounded-lg">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize text-green-800">{key.replace("_", " ")}:</span>
                            <span className="text-gray-700">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditLineItem(index)}
                    className="border-green-500 text-green-700 hover:bg-green-100 transition-colors duration-200"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteLineItem(index)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {lineItems.length > 0 && !showLineItemForm && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                className="border-green-500 text-green-700 hover:bg-green-100 transition-colors duration-200"
                onClick={handleResetForm}
              >
                <PlusCircle className="w-4 h-4 mr-2 text-green-600" />
                Add New Line Item
              </Button>
            </div>
          )}

          {showLineItemForm && (
            <Card className="p-4 mt-6 border border-green-100 shadow-sm rounded-lg bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 text-lg font-semibold">
                  {editingIndex !== null ? "Edit Line Item" : "Add New Line Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="productName" className="text-green-800 font-medium">Product Name *</Label>
                    <Input
                      id="productName"
                      value={newLineItem.productName}
                      onChange={(e) => setNewLineItem({ ...newLineItem, productName: e.target.value })}
                      placeholder="Enter product name"
                      className="border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-green-800 font-medium">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newLineItem.quantity}
                      onChange={(e) => setNewLineItem({ ...newLineItem, quantity: parseInt(e.target.value) || 0 })}
                      placeholder="Enter quantity"
                      className="border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedUnitPrice" className="text-green-800 font-medium">Estimated Unit Price</Label>
                    <Input
                      id="estimatedUnitPrice"
                      type="number"
                      value={newLineItem.estimatedUnitPrice || ""}
                      onChange={(e) => setNewLineItem({ ...newLineItem, estimatedUnitPrice: parseFloat(e.target.value) || undefined })}
                      placeholder="Enter estimated unit price"
                      className="border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency" className="text-green-800 font-medium">Urgency</Label>
                    <Select
                      value={newLineItem.urgency}
                      onValueChange={(value) => setNewLineItem({ ...newLineItem, urgency: value })}
                    >
                      <SelectTrigger id="urgency" className="border-green-300 focus:ring-green-500">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-green-800 font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={newLineItem.description}
                      onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                      placeholder="Enter description"
                      className="border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-green-800 font-medium">Specifications</Label>
                    <div className="space-y-3 mt-3">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            placeholder="Enter specification key (e.g., Color)"
                            value={spec.key}
                            onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                            className="border-green-300 focus:ring-green-500 focus:border-green-500"
                          />
                          <Input
                            placeholder="Enter specification value (e.g., Blue)"
                            value={spec.value}
                            onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                            className="border-green-300 focus:ring-green-500 focus:border-green-500"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSpecification(index)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddSpecification}
                        className="mt-3 border-green-500 text-green-700 hover:bg-green-100 transition-colors duration-200"
                      >
                        <PlusCircle className="w-4 h-4 mr-2 text-green-600" />
                        Add Specification
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  {editingIndex !== null && (
                    <Button
                      variant="outline"
                      onClick={handleResetForm}
                      className="border-green-500 text-green-700 hover:bg-green-100 transition-colors duration-200"
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button
                    onClick={handleAddLineItem}
                    className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                  >
                    {editingIndex !== null ? "Update Line Item" : "Add Line Item"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Rejection Reason (if rejected) */}
      {rfpData.rejectionReason && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Rejection Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{rfpData.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canApproveOrReject && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Approval Required</h3>
                <p className="text-sm text-blue-700">
                  {selectedVendors.length > 0 
                    ? `This RFP is pending your approval with ${selectedVendors.length} vendor(s) selected`
                    : "Please select at least one vendor before approving"
                  }
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowApproveDialog(true)}
                  disabled={processing || lineItems.length === 0 || selectedVendors.length === 0 || !quotationCutoffDate}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircleMore className="w-5 h-5 mr-2" />
            Message {rfpData?.createdBy?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RFPConversation rfpId={rfpData.id} />
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve RFP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this RFP? This will send it to {selectedVendors.length} vendor(s) and move it to the next stage in the approval workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Add any comments about your approval..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? "Processing..." : `Approve RFP (${selectedVendors.length} vendors)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject RFP</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this RFP. This will stop the approval workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why you are rejecting this RFP..."
              className="mt-2"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? "Processing..." : "Reject RFP"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewRFPForApproval;