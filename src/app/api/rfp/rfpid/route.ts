import { generateRFPId } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const rfpid = await generateRFPId();
    return NextResponse.json(rfpid);
  } catch (error) {
    console.error("Error generating RFP id", error);
    return NextResponse.json(
      { error: "Error generating RFP id", details: (error as Error).message },
      { status: 500 }
    );
  }
}
