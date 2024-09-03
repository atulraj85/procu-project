import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { serializePrismaModel } from "../[tablename]/route";
import { generateRFPId } from "@/lib/prisma";

const prisma = new PrismaClient();

enum RFPStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  GRN_NOT_RECEIVED = "GRN_NOT_RECEIVED",
  INVOICE_NOT_RECEIVED = "INVOICE_NOT_RECEIVED",
  PAYMENT_NOT_DONE = "PAYMENT_NOT_DONE",
  COMPLETED = "COMPLETED",
}

interface RequestBody {
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  userId: string;
  rfpStatus: RFPStatus; // Use the enum here
  rfpProducts: { productId: string; quantity: number }[]; // Array of product IDs and quantities
  approvers: { approverId: string }[]; // Array of approver IDs
  vendorId: string; // Vendor ID
}


export async function POST(request: Request) {
  try {
    const {
      requirementType,
      dateOfOrdering,
      deliveryLocation,
      deliveryByDate,
      lastDateToRespond,
      userId,
      rfpProducts,
      approvers,
      rfpStatus,
      vendorId,
    }: RequestBody = await request.json();

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    // Validate the status
    if (!Object.values(RFPStatus).includes(rfpStatus)) {
      return NextResponse.json(
        { error: `Invalid status value: ${rfpStatus}` },
        { status: 400 }
      );
    }

    // Generate RFP ID
    const rfpId = await generateRFPId();

    // Create RFP inside the transaction
    const newRFP = await prisma.$transaction(async () => {
      return prisma.rFP.create({
        data: {
          rfpId, // Use the generated RFP ID
          requirementType,
          dateOfOrdering: new Date(dateOfOrdering),
          deliveryLocation,
          deliveryByDate: new Date(deliveryByDate),
          lastDateToRespond: new Date(lastDateToRespond),
          userId,
          rfpStatus,
          rfpProducts: {
            create: rfpProducts.map((rfpProduct) => ({
              quantity: rfpProduct.quantity,
              product: {
                connect: { id: parseInt(rfpProduct.productId, 10) }, // Convert productId to number
              },
            })),
          },
          approversList: {
            create: approvers.map((approver) => ({
              userId: approver.approverId, // Use the userId directly
              approved: false,
            })),
          },
        },
        include: {
          rfpProducts: {
            include: {
              product: {
                include: {
                  productCategory: true,
                },
              },
            },
          },
          approversList: {
            include: {
              user: true, // Change to user to include the User model
            },
          },
        },
      });
    });
    return NextResponse.json({ data: newRFP }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating RFP:", error);
    return NextResponse.json(
      { error: `Failed to create RFP: ${error.message}` },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const whereClause: Record<string, any> = {};
    const orderByClause: Record<string, "asc" | "desc"> = {};
    const validAttributes = [
      "id",
      "requirementType",
      "dateOfOrdering",
      "deliveryLocation",
      "deliveryByDate",
      "lastDateToRespond",
      "rfpStatus",
      "userId",
      "created_at",
      "updated_at",
      "rfpId", // Include rfpId in valid attributes
    ];

    searchParams.forEach((value, key) => {
      if (validAttributes.includes(key)) {
        if (key === "orderBy") {
          const [orderByField, orderByDirection] = value.split(",");
          if (validAttributes.includes(orderByField)) {
            orderByClause[orderByField] =
              orderByDirection === "asc" ? "asc" : "desc";
          }
        } else if (key === "id") {
          const ids = value.split(",").map((id) => parseInt(id, 10));
          whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
        } else if (key === "rfpId") {
          whereClause.rfpId = value; // Handle rfpId search
        } else {
          whereClause[key] = value;
        }
      } else {
        return NextResponse.json(
          { error: `Invalid attribute: ${key}` },
          { status: 400 }
        );
      }
    });

    const records = await prisma.rFP.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });

    if (Object.keys(whereClause).length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: `Not found matching the criteria` },
        { status: 404 }
      );
    }

    return NextResponse.json(serializePrismaModel(records));
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}
