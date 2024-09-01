import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { modelMap } from "@/lib/prisma";
import { serializePrismaModel } from "../[tablename]/route";

const prisma = new PrismaClient();

interface RFPProduct {
  productName: string;
  modelNo: string;
  specification: string;
  productCategory: string;
  quantity: number;
}

interface Approver {
  name: string;
  email: string;
  phone: string;
}

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
  rfpProducts: RFPProduct[];
  approvers: Approver[];
}

const rfp = {
  model: prisma.rFP,
  attributes: [
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
  ],
};

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

    // Create RFP with all related data in a single transaction
    const newRFP = await prisma.$transaction(async (prisma) => {
      // Create product categories and products if they don't exist
      const productsData = await Promise.all(
        rfpProducts.map(async (rfpProduct) => {
          let productCategory = await prisma.productCategory.findUnique({
            where: { name: rfpProduct.productCategory },
          });

          if (!productCategory) {
            productCategory = await prisma.productCategory.create({
              data: { name: rfpProduct.productCategory },
            });
          }

          let product = await prisma.product.findFirst({
            where: {
              name: rfpProduct.productName,
              productCategoryId: productCategory.id,
            },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                name: rfpProduct.productName,
                modelNo: rfpProduct.modelNo,
                specification: rfpProduct.specification,
                productCategoryId: productCategory.id,
              },
            });
          }

          return { product, quantity: rfpProduct.quantity };
        })
      );

      // Create approvers if they don't exist
      const approversData = await Promise.all(
        approvers.map(async (approver) => {
          let existingApprover = await prisma.approver.findUnique({
            where: { email: approver.email },
          });

          if (!existingApprover) {
            existingApprover = await prisma.approver.create({
              data: {
                name: approver.name,
                email: approver.email,
                phone: approver.phone,
              },
            });
          }

          return existingApprover;
        })
      );

      // Create RFP
      return prisma.rFP.create({
        data: {
          requirementType,
          dateOfOrdering: new Date(dateOfOrdering),
          deliveryLocation,
          deliveryByDate: new Date(deliveryByDate),
          lastDateToRespond: new Date(lastDateToRespond),
          userId,
          rfpStatus,
          rfpProducts: {
            create: productsData.map((data) => ({
              productId: data.product.id,
              quantity: data.quantity,
            })),
          },
          approversList: {
            create: approversData.map((approver) => ({
              approverId: approver.id,
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
              approver: true,
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
    const validAttributes = rfp.attributes;

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
        } else if (key === "state_id") {
          const stateIds = value.split(",").map((id) => parseInt(id, 10));
          whereClause.state_id =
            stateIds.length > 1 ? { in: stateIds } : stateIds[0];
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

    // console.log("Where clause:", whereClause);

    const records = await rfp.model.findMany({
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
