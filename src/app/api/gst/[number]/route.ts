// src/app/api/vendor/gst/[number]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { number: string } }
) {
  const debug = true; // Set this to true for debugging
  const gstinNumber = params.number;
  const apiKey = process.env.GST_API;

  if (debug) console.log("Received GSTIN number:", gstinNumber);
  if (debug) console.log("API Key:", apiKey);

  if (!apiKey) {
    if (debug) console.log("API key is missing");
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  if (!gstinNumber) {
    if (debug) console.log("GST number is required");
    return NextResponse.json(
      { error: "GST number is required" },
      { status: 400 }
    );
  }

  try {
    if (debug) console.log("Fetching data from external source...");
    const response = await fetch(
      `http://sheet.gstincheck.co.in/check/${apiKey}/${gstinNumber}`
    );

    if (!response.ok) {
      if (debug) console.log("Failed to fetch data, status:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch data from external source" },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (debug) console.log("Fetched data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.log("Error", error);
    if (debug) console.log("An error occurred while fetching data");
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
