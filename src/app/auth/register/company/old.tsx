// app/companies/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CompanyForm } from "@/components/admin/CompanyForm";

interface Company {
  id: string;
  name: string;
  // Add other fields as needed
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    const response = await fetch("/api/company");
    const data = await response.json();
    setCompanies(data);
  }

  async function handleSubmit(data: any) {
    // const formData = new FormData();

    // // Append the company data to FormData
    // for (const key in data) {
    //   formData.append(key, data[key]);
    // }

    console.log("From page", data);
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

    fetchCompanies(); // Refresh the list of companies
    setSelectedCompany(null); // Reset the selected company
  }

  async function handleDelete(id: string) {
    await fetch("/api/company", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCompanies();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Company Details</h1>
      <CompanyForm
        initialData={selectedCompany || undefined}
        onSubmit={handleSubmit}
      />
      {/* <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Company List</h2>
        <ul>
          {companies.map((company) => (
            <li key={company.id} className="mb-2 flex items-center">
              <span>{company.name}</span>
              <Button
                onClick={() => setSelectedCompany(company)}
                className="ml-2"
                variant="outline"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(company.id)}
                className="ml-2"
                variant="destructive"
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
