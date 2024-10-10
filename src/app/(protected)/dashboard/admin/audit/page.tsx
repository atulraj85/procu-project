"use client"
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock function to simulate backend response for RFP search
const mockSearchRfp = (rfpId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (rfpId === "RFP123") {
        resolve({
          rfpId: "RFP123",
          title: "Software Development Project",
          createdAt: "2024-10-04",
        });
      } else {
        resolve(null);
      }
    }, 300);
  });
};

// Mock function to simulate backend response for RFP log data
const mockGetRfpLogData = (rfpId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (rfpId === "RFP123") {
        resolve([
          {
            logId: 1,
            logTitle: "RFP Created",
            creatorName: "John Doe",
            creatorRole: "Admin",
            creatorEmail: "john.doe@example.com",
            createdAt: "2024-10-04 09:00:00",
            additionalInfo: "Initial RFP creation"
          },
          {
            logId: 2,
            logTitle: "RFP Updated",
            creatorName: "Jane Smith",
            creatorRole: "Manager",
            creatorEmail: "jane.smith@example.com",
            createdAt: "2024-10-04 14:30:00",
            additionalInfo: "Updated project scope"
          },
          {
            logId: 3,
            logTitle: "Vendor Added",
            creatorName: "Mike Johnson",
            creatorRole: "Procurement",
            creatorEmail: "mike.johnson@example.com",
            createdAt: "2024-10-05 10:15:00",
            additionalInfo: "Added 3 new vendors"
          },
        ]);
      } else {
        resolve([]);
      }
    }, 500);
  });
};

const Page = () => {
  const [rfpId, setRfpId] = useState("");
  const [rfp, setRfp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logData, setLogData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setRfp(null);
      setRfpId("");
      setLogData([]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await mockSearchRfp(searchTerm);
      setRfp(result);
      setRfpId(searchTerm);
      const data = await mockGetRfpLogData(searchTerm);
      setLogData(data || []); // Ensure logData is always an array
    } catch (error) {
      console.error("Error searching RFP:", error);
      setRfp(null);
      setLogData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter RFP ID"
          className="w-60"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {rfp && (
        <Alert>
          <AlertTitle>RFP Found</AlertTitle>
          <AlertDescription>
            RFP ID: {rfp.rfpId}, Title: {rfp.title}, Created At: {rfp.createdAt}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && rfpId.trim() !== "" && !rfp && (
        <Alert variant="destructive">
          <AlertTitle>No RFP Found</AlertTitle>
          <AlertDescription>
            No RFP found with the ID: {rfpId}
          </AlertDescription>
        </Alert>
      )}

      {logData.length > 0 ? (
        <Table>
          <TableCaption>RFP Log Data</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Log Title</TableHead>
              <TableHead>Creator Name</TableHead>
              <TableHead>Creator Role</TableHead>
              <TableHead>Creator Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Additional Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logData.map((log) => (
              <TableRow key={log.logId}>
                <TableCell>{log.logTitle}</TableCell>
                <TableCell>{log.creatorName}</TableCell>
                <TableCell>{log.creatorRole}</TableCell>
                <TableCell>{log.creatorEmail}</TableCell>
                <TableCell>{log.createdAt}</TableCell>
                <TableCell>{log.additionalInfo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        rfpId && <Alert>No log data available for this RFP.</Alert>
      )}
    </div>
  );
};

export default Page;