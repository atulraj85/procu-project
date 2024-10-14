import React from "react";
import RFPForm from "./RFPForm";

export default function Quotation({
  rfpId,
  initialData,
}: {
  rfpId: string;
  initialData: any;
}) {
  return (
    <div>
      {/* <div>{rfpId}</div>
      <div>{JSON.stringify(initialData)}</div> */}
      <RFPForm initialData={initialData} />
    </div>
  );
}
