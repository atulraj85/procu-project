import { generateRFPId } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("API: Starting RFP ID generation request");
    const rfpid = await generateRFPId();
    console.log("API: Successfully generated RFP ID:", rfpid);
    return NextResponse.json(rfpid);
  } catch (error) {
    console.error("API: Error generating RFP id", error);
    return NextResponse.json(
      { error: "Error generating RFP id", details: (error as Error).message },
      { status: 500 }
    );
  }
}
