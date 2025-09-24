"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Package,
  MessageSquare,
  MessageCircleMore
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
import RFPConversation from "@/components/shared/RFPConversation";
import { useCurrentUser } from "@/hooks/auth";

// Interfaces remain the same
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
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const user = useCurrentUser();

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
          updatedBy: user?.id,
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
          updatedBy: user?.id,
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
      'DRAFT': 'bg-gray-200 text-gray-800',
      'PENDING_APPROVAL': 'bg-yellow-200 text-yellow-800',
      'APPROVED': 'bg-green-200 text-green-800',
      'REJECTED': 'bg-red-200 text-red-800',
      'SENT_TO_VENDORS': 'bg-blue-200 text-blue-800',
    };
    return statusColors[status] || 'bg-gray-200 text-gray-800';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const canApproveOrReject = rfpData?.status === 'DRAFT';

  if (loading) return <Loader />;
  if (error) return <div className="text-red-600 p-6 text-center font-medium">Error: {error}</div>;
  if (!rfpData) return <div className="p-6 text-center font-medium text-gray-600">No RFP data found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-green-50 border-b border-gray-200">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-green-900">{rfpData.title}</CardTitle>
                  <div className="flex gap-3 mt-3">
                    <Badge variant="outline" className="border-green-300 text-green-700 font-medium">
                      {rfpData.rfpNumber}
                    </Badge>
                    <Badge className={`${getStatusColor(rfpData.status)} font-medium`}>
                      {rfpData.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </CardHeader>
            {rfpData.description && (
              <CardContent className="pt-6 px-6">
                <p className="text-gray-700 leading-relaxed">{rfpData.description}</p>
              </CardContent>
            )}
          </Card>

          {rfpData.rejectionReason && (
            <Card className="shadow-lg border border-red-100 bg-red-50">
              <CardHeader className="bg-red-100 border-b border-red-200">
                <CardTitle className="text-red-900 font-semibold flex items-center">
                  <XCircle className="mr-2 h-5 w-5" /> Rejection Reason
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <p className="text-red-700 leading-relaxed">{rfpData.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          <Card id="request-details" className="shadow-lg border border-gray-200">
            <CardHeader className="bg-green-50 border-b border-gray-200">
              <CardTitle className="text-green-900 font-semibold flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-green-600" /> Request Details & Justification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Usage Type", value: rfpData.questionAnswers.usage_type },
                  { label: "Request Type", value: rfpData.questionAnswers.request_type },
                  { label: "Required Date", value: new Date(rfpData.questionAnswers.required_date).toLocaleDateString() },
                  { label: "Client Related", value: rfpData.questionAnswers.client_related },
                  { label: "Request Reason", value: rfpData.questionAnswers.request_reason },
                  { label: "Quantity Needed", value: rfpData.questionAnswers.quantity_needed },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-base text-gray-700 font-bold">{item.label}</Label>
                    <p className="text-gray-900  bg-gray-50 p-0 rounded-md">{item.value}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6 bg-gray-200" />
              <div className="space-y-6">
                {[
                  { label: "Specific Request", value: rfpData.questionAnswers.specific_request },
                  ...(rfpData.questionAnswers.replacement_reason
                    ? [{ label: "Replacement Reason", value: rfpData.questionAnswers.replacement_reason }]
                    : []),
                  ...(rfpData.questionAnswers.business_justification
                    ? [{ label: "Business Justification", value: rfpData.questionAnswers.business_justification }]
                    : []),
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-base text-gray-700 font-bold">{item.label}</Label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-md border border-gray-200 leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="delivery-info" className="shadow-lg border border-gray-200">
            <CardHeader className="bg-green-50 border-b border-gray-200">
              <CardTitle className="text-green-900 font-semibold flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-green-600" /> Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Location</Label>
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md">{rfpData.deliveryLocation}</p>
              </div>
            </CardContent>
          </Card>

          <Card id="line-items" className="shadow-lg border border-gray-200">
            <CardHeader className="bg-green-50 border-b border-gray-200">
              <CardTitle className="text-green-900 font-semibold flex items-center">
                <Package className="mr-2 h-5 w-5 text-green-600" /> Line Items ({rfpData.lineItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <div className="space-y-6">
                {rfpData.lineItems.map((item, index) => (
                  <Card key={index} className="p-5 bg-white border border-gray-200 shadow-sm rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-base font-bold text-gray-700">Product</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-medium">{item.productName}</p>
                          {item.urgency && (
                            <Badge
                              className={`${
                                item.urgency === 'High' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              } font-medium`}
                            >
                              {item.urgency}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-bold text-gray-700">Quantity</Label>
                        <p className="text-gray-900 font-medium">{item.quantity}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-bold text-gray-700">Est. Unit Price</Label>
                        <p className="text-gray-900 font-medium">
                          {item.estimatedUnitPrice ? formatCurrency(item.estimatedUnitPrice) : 'Not specified'}
                        </p>
                      </div>
                      {item.description && (
                        <div className="md:col-span-3 space-y-2">
                          <Label className="text-base font-bold text-gray-700">Description</Label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      )}
                      {item.specifications && (
                        <div className="md:col-span-3 space-y-2">
                          <Label className="text-base font-bold text-gray-700">Specifications</Label>
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {Object.entries(item.specifications).map(([key, value]) => (
                                <div key={key} className="flex justify-start gap-2  ">
                                  <span className="text-gray-600 capitalize font-medium">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span className="text-gray-900">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="conversation" className="shadow-lg border border-gray-200">
            <CardHeader className="bg-green-50 border-b border-gray-200">
              <CardTitle className="text-green-900 font-semibold flex items-center">
                <MessageCircleMore className="mr-2 h-5 w-5 text-green-600" /> Message {rfpData?.createdBy?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              <RFPConversation rfpId={rfpData.id} />
            </CardContent>
          </Card>
        </div>
      </main>

      {canApproveOrReject && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 flex gap-4">
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setShowApproveDialog(true)} disabled={processing}>
            <CheckCircle className="mr-2 h-4 w-4" /> Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            onClick={() => setShowRejectDialog(true)}
            disabled={processing}
          >
            <XCircle className="mr-2 h-4 w-4" /> Reject
          </Button>
        </div>
      )}

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-900">Approve RFP</AlertDialogTitle>
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
            <AlertDialogAction onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? "Processing..." : "Approve RFP"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-900">Reject RFP</AlertDialogTitle>
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
              required
              className="mt-2"
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