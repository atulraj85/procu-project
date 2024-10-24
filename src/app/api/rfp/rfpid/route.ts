import { generateRFPId } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("=== RFP ID Generation API Start ===");

  try {
    console.log("1. Initiating RFP ID generation");

    // Generate RFP ID
    const rfpid = await generateRFPId();
    console.log("2. Generated RFP ID:", rfpid);

    // Create response
    const response = NextResponse.json(rfpid);
    console.log("3. Created response object");

    // Log the full response for debugging
    console.log("4. Response details:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: rfpid,
    });

    console.log("=== RFP ID Generation API End ===");

    return response;
  } catch (error) {
    console.error("!!! API Error in RFP ID generation:", error);

    // Create error response
    const errorResponse = NextResponse.json(
      { error: "Error generating RFP id", details: (error as Error).message },
      { status: 500 }
    );

    console.log("Error response details:", {
      status: errorResponse.status,
      statusText: errorResponse.statusText,
      headers: Object.fromEntries(errorResponse.headers.entries()),
      error: (error as Error).message,
    });

    return errorResponse;
  }
}
