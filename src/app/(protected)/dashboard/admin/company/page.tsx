// app/companies/page.tsx
"use client";

import { CompanyForm } from "@/components/admin/CompanyForm";
import { useState } from "react";

interface Company {
  id: string;
  name: string;
  // Add other fields as needed
}

export default function CompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  async function handleSubmit(data: any) {
    // console.log("From page", data);
    const formData = data;

    if (selectedCompany) {
      // Update existing company
      formData.append("id", selectedCompany.id); // Append the company ID for updating
      await fetch("/api/company", {
        method: "PUT",
        body: formData, // Use FormData directly
      });
    } else {
      // Create new company
      await fetch("/api/company", {
        method: "POST",
        body: formData, // Use FormData directly
      });
    }
  }

  return (
    <div className="container mx-auto ">
      
      <CompanyForm
        initialData={selectedCompany || undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
