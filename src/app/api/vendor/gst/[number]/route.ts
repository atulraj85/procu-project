// src/app/api/vendor/gst/[number]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { number: string } }
) {
  const gstinNumber = params.number;
  const apiKey = process.env.GST_API;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  if (!gstinNumber) {
    return NextResponse.json(
      { error: "GST number is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `http://sheet.gstincheck.co.in/check/${apiKey}/${gstinNumber}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from external source" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
