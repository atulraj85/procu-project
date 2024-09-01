import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

interface RequestBody {
  requirementType: string;
  dateOfOrdering: string;
  deliveryLocation: string;
  deliveryByDate: string;
  lastDateToRespond: string;
  userId: string;
  rfpProducts: RFPProduct[];
  approvers: Approver[];
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

// {
//   "requirementType": "Procurement",
//   "dateOfOrdering": "2023-05-01T00:00:00.000Z",
//   "deliveryLocation": "New Delhi, India",
//   "deliveryByDate": "2023-06-01T00:00:00.000Z",
//   "lastDateToRespond": "2023-05-15T00:00:00.000Z",
//   "userId": "user-id-123",
//   "rfpProducts": [
//     {
//       "productName": "Product A",
//       "modelNo": "A001",
//       "specification": "High-quality product",
//       "productCategory": "Electronics",
//       "quantity": 10
//     },
//     {
//       "productName": "Product B",
//       "modelNo": "B002",
//       "specification": "Durable product",
//       "productCategory": "Hardware",
//       "quantity": 20
//     }
//   ],
//   "approvers": [
//     {
//       "name": "Approver 1",
//       "email": "approver1@example.com",
//       "phone": "1234567890"
//     },
//     {
//       "name": "Approver 2",
//       "email": "approver2@example.com",
//       "phone": "0987654321"
//     }
//   ]
// }
