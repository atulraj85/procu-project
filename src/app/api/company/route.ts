// app/api/company/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the input data
    if (!body.name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Create the company along with its addresses
    const company = await prisma.company.create({
      data: {
        name: body.name,
        GST: body.GST,
        email: body.email,
        phone: body.phone,
        website: body.website,
        industry: body.industry,
        foundedDate: body.foundedDate,
        status: body.status,
        addresses: {
          create: body.addresses, // Assuming addresses is an array of address objects
        },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error creating company" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        addresses: true, // Include related addresses
        users: true, // Include related users
        PO: true, // Include related purchase orders (if needed)
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      { error: "Error fetching companies" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const company = await prisma.company.update({
      where: { id },
      data,
    });
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating company" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.company.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 }
    );
  }
}
