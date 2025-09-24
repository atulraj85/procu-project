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
  unitPrice: number;
  gstPercentage: number;
  totalPrice: number;
  brand?: string;
  model?: string;
  specifications?: string;
}

interface OtherCharge {
  id: string;
  name: string;
  amount: number;
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
      const response = await fetch(`/api/rfp/${rfpId}`);
      const data = await response.json();
      
      setRfpDetails(data);
      
      // Initialize line item quotes
      const initialQuotes = data.lineItems.map((item: LineItem) => ({
        lineItemId: item.id,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: 0,
        gstPercentage: 18,
        totalPrice: 0,
        brand: "",
        model: "",
        specifications: ""
      }));
      
      setLineItemQuotes(initialQuotes);
      
      // Set default quotation number
      setQuotationNumber(`QUO-${Date.now()}`);
      
      // Set default valid till (30 days)
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 30);
      setValidTill(validDate.toISOString().split('T')[0]);

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
      const unitPrice = field === 'unitPrice' ? value : updated[index].unitPrice;
      const gstPercentage = field === 'gstPercentage' ? value : updated[index].gstPercentage;
      updated[index].totalPrice = unitPrice * updated[index].quantity * (1 + gstPercentage / 100);
    }
    
    setLineItemQuotes(updated);
  };

  const addOtherCharge = () => {
    setOtherCharges([...otherCharges, {
      id: `charge_${Date.now()}`,
      name: "",
      amount: 0,
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
    const lineItemSubtotal = lineItemQuotes.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const lineItemGst = lineItemQuotes.reduce((sum, item) => sum + ((item.unitPrice * item.quantity) * (item.gstPercentage / 100)), 0);
    
    const otherChargesSubtotal = otherCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const otherChargesGst = otherCharges.reduce((sum, charge) => sum + (charge.amount * (charge.gstPercentage / 100)), 0);
    
    const subtotal = lineItemSubtotal + otherChargesSubtotal;
    const gstAmount = lineItemGst + otherChargesGst;
    const total = subtotal + gstAmount;
    
    return { subtotal, gstAmount, total };
  };

  const handleSubmit = async () => {
    // Validation
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
      const formData = new FormData();
      
      const quotationData = {
        rfpId,
        quotationNumber,
        lineItemQuotes,
        otherCharges,
        validTill,
        deliveryTimeline,
        notes,
        termsConditions
      };

      formData.append('quotationData', JSON.stringify(quotationData));

      // Append files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch('/api/vendor/quotation', {
        method: 'POST',
        body: formData
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
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin" />
        <span className="ml-2">Loading RFP details...</span>
      </div>
    );
  }

  if (!rfpDetails) {
    return <div className="text-center py-8">RFP not found</div>;
  }

  if (!rfpDetails.canSubmitQuotation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Quotation Period Ended</h2>
          <p className="text-gray-600 mb-4">
            The quotation cutoff date for this RFP has passed.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* RFP Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Submit Quotation - {rfpDetails.rfpNumber}</span>
            <Badge variant="outline">
              Cutoff: {new Date(rfpDetails.quotationCutoffDate).toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Title:</Label>
              <p>{rfpDetails.title}</p>
            </div>
            <div>
              <Label className="font-semibold">Delivery Location:</Label>
              <p>{rfpDetails.deliveryLocation}</p>
            </div>
            <div>
              <Label className="font-semibold">Delivery Date:</Label>
              <p>{new Date(rfpDetails.deliveryDate).toLocaleDateString()}</p>
            </div>
          </div>
          {rfpDetails.description && (
            <div className="mt-4">
              <Label className="font-semibold">Description:</Label>
              <p className="text-sm text-gray-600">{rfpDetails.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quotationNumber">Quotation Number *</Label>
              <Input
                id="quotationNumber"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                placeholder="Enter quotation number"
              />
            </div>
            <div>
              <Label htmlFor="validTill">Valid Till *</Label>
              <Input
                id="validTill"
                type="date"
                value={validTill}
                onChange={(e) => setValidTill(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price (₹)</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>Total (₹)</TableHead>
                  <TableHead>Brand/Model</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItemQuotes.map((item, index) => (
                  <TableRow key={item.lineItemId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItemQuote(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.gstPercentage}
                        onChange={(e) => updateLineItemQuote(index, 'gstPercentage', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      {(item.unitPrice * item.quantity * (1 + item.gstPercentage / 100)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Brand/Model"
                        value={item.brand || ''}
                        onChange={(e) => updateLineItemQuote(index, 'brand', e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Other Charges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Other Charges</h3>
              <Button type="button" variant="outline" size="sm" onClick={addOtherCharge}>
                <Plus className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>
            {otherCharges.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead>GST %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherCharges.map((charge, index) => (
                    <TableRow key={charge.id}>
                      <TableCell>
                        <Input
                          value={charge.name}
                          onChange={(e) => updateOtherCharge(index, 'name', e.target.value)}
                          placeholder="Charge description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={charge.amount}
                          onChange={(e) => updateOtherCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={charge.gstPercentage}
                          onChange={(e) => updateOtherCharge(index, 'gstPercentage', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOtherCharge(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
              <Input
                id="deliveryTimeline"
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
                placeholder="e.g., 15-20 working days"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="termsConditions">Terms & Conditions</Label>
            <Textarea
              id="termsConditions"
              value={termsConditions}
              onChange={(e) => setTermsConditions(e.target.value)}
              placeholder="Terms and conditions"
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Supporting Documents</Label>
            <div className="mt-2">
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
              <div>
                <Label className="font-semibold">Subtotal:</Label>
                <p className="text-lg">₹{totals.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <Label className="font-semibold">GST Amount:</Label>
                <p className="text-lg">₹{totals.gstAmount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="font-semibold text-lg">Total Amount:</Label>
                <p className="text-xl font-bold text-green-600">₹{totals.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
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
  );
};

export default VendorQuotationForm;
