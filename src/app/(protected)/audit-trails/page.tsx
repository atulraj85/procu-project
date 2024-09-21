"use client";

import { saveAuditTrail } from "@/actions/audit-trail";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth";
import { Role } from "@prisma/client";
import { useTransition } from "react";

function AuditTrailsPage() {
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  const savePaymentDoneAuditTrail = () => {
    const data = {
      eventName: "PAYMENT_DONE",
      details: {
        paymentReference: "PAY-2024-008",
      },
    };

    startTransition(() => {
      saveAuditTrail(data)
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.error("error", err);
        });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-1/2 mx-auto">
      {JSON.stringify(user)}
      <Button onClick={savePaymentDoneAuditTrail}>Payment Done Event</Button>
      {isPending && <h1>Pending...</h1>}
    </div>
  );
}

export default AuditTrailsPage;
