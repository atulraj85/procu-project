"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/auth";

interface LineItem {
  id: string; 
  productName: string;
  description: string;
  quantity: number;
  specifications?: any;
}

interface LineItemQuote {
  lineItemId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: string; // Changed to string to allow empty input
  gstPercentage: number;
  totalPrice: number;
  brand?: string;
  model?: string;
  specifications?: string;
}

interface OtherCharge {
  id: string;
  name: string;
  amount: string; // Changed to string to allow empty input
  gstPercentage: number;
  description?: string;
}

interface RFPDetails {
  id: string;
  rfpNumber: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  deliveryLocation: string;
  deliveryDate: string;
  quotationCutoffDate: string;
  selectionCriteria: any;
  canSubmitQuotation: boolean;
}

const VendorQuotationForm = () => {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.rfpId as string;
  const user = useCurrentUser();
  const [rfpDetails, setRfpDetails] = useState<RFPDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [quotationNumber, setQuotationNumber] = useState("");
  const [lineItemQuotes, setLineItemQuotes] = useState<LineItemQuote[]>([]);
  const [otherCharges, setOtherCharges] = useState<OtherCharge[]>([]);
  const [validTill, setValidTill] = useState("");
  const [deliveryTimeline, setDeliveryTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [termsConditions, setTermsConditions] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchRFPDetails();
  }, [rfpId]);

  const fetchRFPDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rfp/958de10f-b1e8-4d52-af8e-8e5418c6a6ac`);
      const data = await response.json();
      
      setRfpDetails(data);
      
      // Initialize line item quotes
      const initialQuotes = data.lineItems.map((item: LineItem) => ({
        lineItemId: item.id,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: "", // Initialize as empty string
        gstPercentage: 18,
        totalPrice: 0,
        brand: "",
        model: "",
        specifications: ""
      }));
      
      setLineItemQuotes(initialQuotes);
      
      // Set default quotation number
      setQuotationNumber(`QUO-${Date.now()}`);
      
      // Set valid till to quotationCutoffDate
      if (data.quotationCutoffDate) {
        setValidTill(new Date(data.quotationCutoffDate).toISOString().split('T')[0]);
      } else {
        console.error("quotationCutoffDate is missing in API response");
        toast({
          title: "Error",
          description: "Invalid RFP data: Quotation cutoff date is missing",
          variant: "destructive"
        });
        // Fallback: Set to 30 days from now
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + 30);
        setValidTill(validDate.toISOString().split('T')[0]);
      }

    } catch (error) {
      console.error("Error fetching RFP details:", error);
      toast({
        title: "Error",
        description: "Failed to load RFP details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLineItemQuote = (index: number, field: keyof LineItemQuote, value: any) => {
    const updated = [...lineItemQuotes];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total price
    if (field === 'unitPrice' || field === 'gstPercentage') {
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updated[index].unitPrice) || 0;
      const gstPercentage = field === 'gstPercentage' ? value : updated[index].gstPercentage;
      updated[index].totalPrice = unitPrice * updated[index].quantity * (1 + gstPercentage / 100);
    }
    
    setLineItemQuotes(updated);
  };

  const addOtherCharge = () => {
    setOtherCharges([...otherCharges, {
      id: `charge_${Date.now()}`,
      name: "",
      amount: "", // Initialize as empty string
      gstPercentage: 18,
      description: ""
    }]);
  };

  const removeOtherCharge = (index: number) => {
    setOtherCharges(otherCharges.filter((_, i) => i !== index));
  };

  const updateOtherCharge = (index: number, field: keyof OtherCharge, value: any) => {
    const updated = [...otherCharges];
    updated[index] = { ...updated[index], [field]: value };
    setOtherCharges(updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const lineItemSubtotal = lineItemQuotes.reduce((sum, item) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (unitPrice * item.quantity);
    }, 0);
    const lineItemGst = lineItemQuotes.reduce((sum, item) => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + ((unitPrice * item.quantity) * (item.gstPercentage / 100));
    }, 0);
    
    const otherChargesSubtotal = otherCharges.reduce((sum, charge) => {
      const amount = parseFloat(charge.amount) || 0;
      return sum + amount;
    }, 0);
    const otherChargesGst = otherCharges.reduce((sum, charge) => {
      const amount = parseFloat(charge.amount) || 0;
      return sum + (amount * (charge.gstPercentage / 100));
    }, 0);
    
    const subtotal = lineItemSubtotal + otherChargesSubtotal;
    const gstAmount = lineItemGst + otherChargesGst;
    const total = subtotal + gstAmount;
    
    return { subtotal, gstAmount, total };
  };

  // const handleSubmit = async () => {
  //   // Validation
  //   if (!quotationNumber.trim()) {
  //     toast({
  //       title: "Validation Error",
  //       description: "Quotation number is required",
  //       variant: "destructive"
  //     });
  //     return;
  //   }

  //   const hasInvalidLineItems = lineItemQuotes.some(item => item.unitPrice <= 0);
  //   if (hasInvalidLineItems) {
  //     toast({
  //       title: "Validation Error", 
  //       description: "All line items must have valid unit prices",
  //       variant: "destructive"
  //     });
  //     return;
  //   }

  //   setSubmitting(true);

  //   try {
  //     const formData = new FormData();
      
  //     const quotationData = {
  //       rfpId,
  //       quotationNumber,
  //       lineItemQuotes,
  //       otherCharges,
  //       validTill,
  //       deliveryTimeline,
  //       notes,
  //       termsConditions
  //     };

  //     formData.append('quotationData', JSON.stringify(quotationData));

  //     // Append files
  //     files.forEach((file, index) => {
  //       formData.append(`file_${index}`, file);
  //     });

  //     const response = await fetch(`/api/vendor/quotation?vendorId=${user?.vendorId}`, {
  //       method: 'POST',
  //       body: formData
  //     });

  //     if (response.ok) {
  //       toast({
  //         title: "Success",
  //         description: "Quotation submitted successfully"
  //       });
  //       router.push('/dashboard/vendor/rfp');
  //     } else {
  //       const error = await response.json();
  //       throw new Error(error.error);
  //     }

  //   } catch (error) {
  //     console.error("Error submitting quotation:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to submit quotation",
  //       variant: "destructive"
  //     });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async () => {
  // Validation (keep as is)
  if (!quotationNumber.trim()) {
    toast({
      title: "Validation Error",
      description: "Quotation number is required",
      variant: "destructive"
    });
    return;
  }

  const hasInvalidLineItems = lineItemQuotes.some(item => item.unitPrice <= 0);
  if (hasInvalidLineItems) {
    toast({
      title: "Validation Error", 
      description: "All line items must have valid unit prices",
      variant: "destructive"
    });
    return;
  }

  setSubmitting(true);

  try {
    // Prepare JSON payload (no FormData)
    const quotationData = {
      rfpId,
      quotationNumber,
      lineItemQuotes,
      otherCharges,
      validTill,
      deliveryTimeline,
      notes,
      termsConditions,
      supportingDocuments: files.map(file => ({
        fileName: file.name,
        fileUrl: file.url, // Assume you have pre-generated URLs (e.g., from S3 presigned URLs)
        fileSize: file.size,
        mimeType: file.type
      })) // If no files, this will be empty array
    };

    // Send as JSON
    const response = await fetch(`/api/vendor/quotation?vendorId=${user?.vendorId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Crucial for server to parse as JSON
      },
      body: JSON.stringify(quotationData) // Stringify the object
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Quotation submitted successfully"
      });
      router.push('/dashboard/vendor/rfp');
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }

  } catch (error) {
    console.error("Error submitting quotation:", error);
    toast({
      title: "Error",
      description: "Failed to submit quotation",
      variant: "destructive"
    });
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="flex items-center bg-white rounded-lg shadow-lg px-6 py-4 border border-emerald-200">
          <Loader2 className="animate-spin text-emerald-600 h-6 w-6" />
          <span className="ml-3 text-gray-700 font-medium">Loading RFP details...</span>
        </div>
      </div>
    );
  }

  if (!rfpDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">RFP Not Found</h2>
            <Button 
              onClick={() => router.back()} 
              className="bg-green-600 text-white"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rfpDetails.canSubmitQuotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="shadow-xl border-0 bg-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quotation Period Ended</h2>
            <p className="text-gray-600 mb-6">
              The quotation cutoff date for this RFP has passed.
            </p>
            <Button 
              onClick={() => router.back()} 
              className="bg-green-500 text-white"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* RFP Header */}
        <Card className="shadow-xl border-0 bg-white overflow-hidden">
          <CardHeader className="bg-green-600">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">Submit Quotation - {rfpDetails.rfpNumber}</span>
              <Badge className="bg-emerald-50 text-emerald-800 border-0 font-semibold">
                Cutoff: {new Date(rfpDetails.quotationCutoffDate).toLocaleDateString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white border border-emerald-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="font-semibold text-emerald-700 text-sm">Title</Label>
                <p className="text-gray-800 font-medium">{rfpDetails.title}</p>
              </div>
              <div>
                <Label className="font-semibold text-emerald-700 text-sm">Delivery Location</Label>
                <p className="text-gray-800">{rfpDetails.deliveryLocation}</p>
              </div>
              <div>
                <Label className="font-semibold text-emerald-700 text-sm">Delivery Date</Label>
                <p className="text-gray-800">{new Date(rfpDetails.deliveryDate).toLocaleDateString()}</p>
              </div>
            </div>
            {rfpDetails.description && (
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <Label className="font-semibold text-emerald-700 text-sm">Description</Label>
                <p className="text-gray-700 text-sm mt-1">{rfpDetails.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotation Form */}
        <Card className="shadow-xl border-0 bg-white overflow-hidden">
          <CardHeader className="bg-green-600">
            <CardTitle className="text-xl font-bold text-white">Quotation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 bg-white border border-emerald-200">
            {/* Basic Info - 2 fields per row */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <h4 className="font-semibold text-emerald-800 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quotationNumber" className="text-emerald-700 font-medium text-sm">Quotation Number *</Label>
                  <Input
                    id="quotationNumber"
                    value={quotationNumber}
                    readOnly
                    className="mt-1 border-emerald-300 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="validTill" className="text-emerald-700 font-medium text-sm">Valid Till *</Label>
                  <Input
                    id="validTill"
                    type="date"
                    value={validTill}
                    readOnly
                    className="mt-1 border-emerald-300 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <h3 className="text-lg font-semibold mb-4 text-emerald-800">Line Items</h3>
              <div className="border border-emerald-200 rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-600 border-b border-emerald-200 hover:bg-green-600">
                      <TableHead className="text-white font-semibold">Product</TableHead>
                      <TableHead className="text-white font-semibold">Qty</TableHead>
                      <TableHead className="text-white font-semibold">Unit Price (₹)</TableHead>
                      <TableHead className="text-white font-semibold">GST %</TableHead>
                      <TableHead className="text-white font-semibold">Total (₹)</TableHead>
                      <TableHead className="text-white font-semibold">Brand/Model</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItemQuotes.map((item, index) => (
                      <TableRow key={item.lineItemId} className="border-b border-emerald-100">
                        <TableCell className="p-3">
                          <div>
                            <div className="font-medium text-gray-800">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium">{item.quantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItemQuote(index, 'unitPrice', e.target.value)}
                            className="w-24 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.gstPercentage}
                            onChange={(e) => updateLineItemQuote(index, 'gstPercentage', parseFloat(e.target.value) || 0)}
                            className="w-20 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </TableCell>
                        <TableCell className="text-gray-800 font-semibold">
                          ₹{(parseFloat(item.unitPrice) * item.quantity * (1 + item.gstPercentage / 100) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Brand/Model"
                            value={item.brand || ''}
                            onChange={(e) => updateLineItemQuote(index, 'brand', e.target.value)}
                            className="w-32 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Other Charges */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-800">Additional Charges</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addOtherCharge}
                  className="border-emerald-300 text-emerald-700 bg-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charge
                </Button>
              </div>
              <div className="border border-emerald-200 rounded-lg overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-600 border-b border-emerald-200 hover:bg-green-600">
                      <TableHead className="text-white font-semibold">Description</TableHead>
                      <TableHead className="text-white font-semibold">Amount (₹)</TableHead>
                      <TableHead className="text-white font-semibold">GST %</TableHead>
                      <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherCharges.map((charge, index) => (
                      <TableRow key={charge.id} className="border-b border-emerald-100">
                        <TableCell>
                          <Input
                            value={charge.name}
                            onChange={(e) => updateOtherCharge(index, 'name', e.target.value)}
                            placeholder="Charge description"
                            className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={charge.amount}
                            onChange={(e) => updateOtherCharge(index, 'amount', e.target.value)}
                            className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={charge.gstPercentage}
                            onChange={(e) => updateOtherCharge(index, 'gstPercentage', parseFloat(e.target.value) || 0)}
                            className="w-20 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeOtherCharge(index)}
                            className="bg-red-50 text-red-700 border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {otherCharges.length === 0 && (
                      <TableRow className="border-b border-emerald-100">
                        <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                          No additional charges added
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Additional Details - 3 fields in 2 rows */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <h4 className="font-semibold text-emerald-800 mb-3">Additional Information</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="deliveryTimeline" className="text-emerald-700 font-medium text-sm">Delivery Timeline</Label>
                    <Input
                      id="deliveryTimeline"
                      value={deliveryTimeline}
                      onChange={(e) => setDeliveryTimeline(e.target.value)}
                      placeholder="e.g., 15-20 working days"
                      className="mt-1 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notes" className="text-emerald-700 font-medium text-sm">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes or comments"
                      rows={3}
                      className="mt-1 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="termsConditions" className="text-emerald-700 font-medium text-sm">Terms & Conditions</Label>
                    <Textarea
                      id="termsConditions"
                      value={termsConditions}
                      onChange={(e) => setTermsConditions(e.target.value)}
                      placeholder="Terms and conditions"
                      rows={3}
                      className="mt-1 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <Label className="text-emerald-800 font-semibold">Supporting Documents</Label>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 bg-white flex items-center"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <span className="text-sm text-gray-500">
                    {files.length > 0 ? `${files.length} file(s) selected` : "No files selected"}
                  </span>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-emerald-200">
                        <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quotation Summary */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <h4 className="font-medium text-emerald-800 mb-3 text-base">Quotation Summary</h4>
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-600 border-b border-emerald-200 hover:bg-green-600">
                    <TableHead className="text-white font-semibold text-sm">Description</TableHead>
                    <TableHead className="text-white font-semibold text-sm text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-gray-700 font-medium">Subtotal</TableCell>
                    <TableCell className="text-gray-800 font-semibold text-right">₹{totals.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700 font-medium">GST Amount</TableCell>
                    <TableCell className="text-gray-800 font-semibold text-right">₹{totals.gstAmount.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-500 text-white hover:bg-green-600">
                    <TableCell className="font-semibold">Total Amount</TableCell>
                    <TableCell className="font-semibold text-right">₹{totals.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="border-emerald-300 text-emerald-700 bg-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-green-600 text-white shadow-lg px-8 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quotation'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorQuotationForm;