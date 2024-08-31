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

  try {
    // Check if the user exists
    const existingUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    // Create product categories and products if they don't exist
    const products = await Promise.all(
      rfpProducts.map(async (rFProduct) => {
        const productCategory = await prisma.productCategory.findFirst({
          where: { name: rFProduct.productCategory },
        });
        if (!productCategory) {
          const newProductCategory = await prisma.productCategory.create({
            data: { name: rFProduct.productCategory },
          });
          return {
            productCategory: newProductCategory,
            product: await prisma.product.create({
              data: {
                name: rFProduct.productName,
                modelNo: rFProduct.modelNo,
                specification: rFProduct.specification,
                productCategoryId: newProductCategory.id,
              },
            }),
          };
        } else {
          const product = await prisma.product.findFirst({
            where: { name: rFProduct.productName },
          });
          if (!product) {
            return {
              productCategory,
              product: await prisma.product.create({
                data: {
                  name: rFProduct.productName,
                  modelNo: rFProduct.modelNo,
                  specification: rFProduct.specification,
                  productCategoryId: productCategory.id,
                },
              }),
            };
          } else {
            return { productCategory, product };
          }
        }
      })
    );

    // Create approvers if they don't exist
    const approversList = await Promise.all(
      approvers.map(async (approver) => {
        const existingApprover = await prisma.approver.findFirst({
          where: { email: approver.email },
        });
        if (!existingApprover) {
          return await prisma.approver.create({
            data: {
              name: approver.name,
              email: approver.email,
              phone: approver.phone,
            },
          });
        } else {
          return existingApprover;
        }
      })
    );

    // Create RFP products
    const rfpProductData = products.map((product) => ({
      productId: product.product.id,
      quantity:
        rfpProducts.find((p) => p.productName === product.product.name)
          ?.quantity || 0, // Use optional chaining to handle undefined values
    }));

    // Create RFP
    const newRFP = await prisma.rFP.create({
      data: {
        requirementType,
        dateOfOrdering,
        deliveryLocation,
        deliveryByDate,
        lastDateToRespond,
        userId: userId,
        rfpProducts: {
          create: rfpProductData,
        },

        approversList: {
          create: approversList.map((approver) => ({
            approverId: approver.id,
            approved: false,
          })),
        },
      },
    });

    return NextResponse.json({ response: { data: newRFP } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Failed to create RFP, Error: ${error.message}`,
      },
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
