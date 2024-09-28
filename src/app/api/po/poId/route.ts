import { generatePOId } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const poid = await generatePOId();
    return NextResponse.json(poid);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}
