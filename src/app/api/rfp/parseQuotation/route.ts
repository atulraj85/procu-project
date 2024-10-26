import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create a new FormData instance for the external API
    const apiFormData = new FormData();
    apiFormData.append("file", file);

    // Send to external API
    const response = await fetch(
      "https://parsing-system.onrender.com/parse-invoice/?api_key=mangos",
      {
        method: "POST",
        body: apiFormData,
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
