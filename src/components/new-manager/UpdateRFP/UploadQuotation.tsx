import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface QuotationUploaderProps {
  onQuotationParsed: (data: any) => void;
}

export default function QuotationUploader({
  onQuotationParsed,
}: QuotationUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/rfp/parseQuotation", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse quotation");
      }

      const data = await response.json();

      // Update form with parsed data
      if (data.data && onQuotationParsed) {
        onQuotationParsed(data.data);

        console.log("data.data", data.data);
        toast({
          title: "Success",
          description: "Quotation parsed successfully",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to parse quotation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Upload Quotation PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="flex-1 text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-green-700
                hover:file:bg-blue-100"
            />
            <Button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-32 bg-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Parse PDF
                </>
              )}
            </Button>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
