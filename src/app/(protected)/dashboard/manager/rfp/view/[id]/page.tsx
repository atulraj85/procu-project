"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  MessageCircleMore
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Updated interfaces to match new API structure
interface LineItem {
  productName: string;
  description: string;
  quantity: number;
  specifications?: any;
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
  lineItems: LineItem[];
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

const ViewRFPForApproval: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;
  
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Approval/Rejection state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const response = await fetch(`/api/rfp/${rfpId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RFP data");
        }
        const data: RFPData = await response.json();
        setRfpData(data);
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

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/rfp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rfpId,
          updatedBy: 'current-user-id', // Replace with actual current user ID
          approvalAction: 'approve',
          approvalComments: approvalComments || 'Approved for next stage',
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "RFP Approved",
          description: data.message,
        });
        // Refresh data
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
      const response = await fetch('/api/rfp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rfpId,
          updatedBy: 'current-user-id', // Replace with actual current user ID
          approvalAction: 'reject',
          rejectionReason: rejectionReason,
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "RFP Rejected",
          description: data.message,
        });
        // Refresh data
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

  const canApproveOrReject = rfpData?.status === 'PENDING_APPROVAL' || rfpData?.status === 'DRAFT';

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
                <p className="text-sm text-blue-700">This RFP is pending your approval</p>
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
                  disabled={processing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Line Items ({rfpData.lineItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rfpData.lineItems.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="font-medium">Product:</Label>
                    <p className="text-sm">{item.productName}</p>
                    {item.urgency && (
                      <Badge variant={item.urgency === 'High' ? 'destructive' : 'secondary'} className="mt-1">
                        {item.urgency}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <Label className="font-medium">Quantity:</Label>
                    <p className="text-sm">{item.quantity}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Est. Unit Price:</Label>
                    <p className="text-sm">{item.estimatedUnitPrice ? formatCurrency(item.estimatedUnitPrice) : 'Not specified'}</p>
                  </div>
                  {item.description && (
                    <div className="md:col-span-3">
                      <Label className="font-medium">Description:</Label>
                      <p className="text-sm mt-1">{item.description}</p>
                    </div>
                  )}
                  {item.specifications && (
                    <div className="md:col-span-3">
                      <Label className="font-medium">Specifications:</Label>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>


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
              Are you sure you want to approve this RFP? This will move it to the next stage in the approval workflow.
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
              {processing ? "Processing..." : "Approve RFP"}
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
