import { generatePOId } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const poid = await generatePOId();
    return NextResponse.json(poid);
  } catch (error) {
    console.error("Error generating PO id", error);
    return NextResponse.json(
      { error: "Error generating PO id", details: (error as Error).message },
      { status: 500 }
    );
  }
}
