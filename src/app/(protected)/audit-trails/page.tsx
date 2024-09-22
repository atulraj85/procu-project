"use client";

import { saveAuditTrail } from "@/actions/audit-trail";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";

const events = [
  { name: "PAYMENT_DONE", label: "Payment Done" },
  { name: "SIGN_OFF_RECEIVED", label: "Sign Off Received" },
  { name: "INVOICE_RECEIVED", label: "Invoice Received" },
  { name: "GRN_RECEIVED", label: "GRN Received" },
  { name: "PO_CREATED", label: "PO Created" },
  { name: "QUERY_RAISED", label: "Query Raised" },
  { name: "QUERY_RESPONSE", label: "Query Response" },
  { name: "RFP_CREATED", label: "RFP Created" },
];

function AuditTrailsPage() {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const handleSaveAuditTrail = (eventName: string) => {
    const details: Record<string, any> = generateDummyDetails(eventName);

    const data = {
      eventName,
      details,
    };

    startTransition(() => {
      saveAuditTrail(data)
        .then((response) => {
          if ("success" in response) {
            setMessage(response.success);
          } else if ("error" in response) {
            setMessage(response.error);
          }
        })
        .catch((err) => {
          console.error("Error saving audit trail:", err);
          setMessage("An unexpected error occurred.");
        });
    });
  };

  const generateDummyDetails = (eventName: string): Record<string, any> => {
    switch (eventName) {
      case "RFP_CREATED":
        return {
          rfpId: "RFP-2024-001",
          rfpDescription: "Supply of Office Equipment",
        };
      case "QUERY_RAISED":
        return {
          rfpQueryId: "uuid-query-001",
        };
      case "QUERY_RESPONSE":
        return {
          rfpQueryResponseId: "uuid-response-001",
        };
      case "PO_CREATED":
        return {
          poId: "PO-2024-007",
        };
      case "GRN_RECEIVED":
        return {
          grnId: "GRN-2024-003",
        };
      case "INVOICE_RECEIVED":
        return {
          invoiceNumber: "INV-2024-012",
        };
      case "SIGN_OFF_RECEIVED":
        return {};
      case "PAYMENT_DONE":
        return {
          paymentReference: "PAY-2024-008",
        };
      default:
        return {};
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-1/2 mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Trails Demo</h1>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <div className="grid grid-cols-1 gap-2 w-full">
        {events.map((event) => (
          <Button
            key={event.name}
            onClick={() => handleSaveAuditTrail(event.name)}
          >
            {event.label}
          </Button>
        ))}
      </div>
      {isPending && <p className="mt-4">Saving audit trail...</p>}
    </div>
  );
}

export default AuditTrailsPage;
