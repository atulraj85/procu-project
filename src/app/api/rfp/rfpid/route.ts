import { NextRequest, NextResponse } from "next/server";
import { serializePrismaModel } from "../../[tablename]/route";
import { generateRFPId } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const rfpid = await generateRFPId();

    return NextResponse.json(rfpid);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}
