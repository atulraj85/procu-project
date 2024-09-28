import { findCompanyByName } from "@/data/company";
import { createUser, deleteUser, findUserByEmail } from "@/data/user";
import { UserTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { RegisterUserSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { and, asc, desc, eq, InferSelectModel, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Type Definitions
type SortBy = keyof InferSelectModel<typeof UserTable>;
type SortDirection = "asc" | "desc";
type WhereField = keyof InferSelectModel<typeof UserTable>;

const DEFAULT_SORTING_FIELD: SortBy = "id";
const DEFAULT_SORTING_DIRECTION: SortDirection = "desc";

// /api/users?role=USER&name=Ravi&sortBy=name&order=asc
// /api/users?sortBy=email&order=desc
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const sortBy: SortBy =
      (searchParams.get("sortBy") as SortBy) || DEFAULT_SORTING_FIELD;
    const sortingOrder: SortDirection =
      (searchParams.get("order") as SortDirection) || DEFAULT_SORTING_DIRECTION;

    if (!["asc", "desc"].includes(sortingOrder)) {
      return NextResponse.json(
        { error: "Invalid order value" },
        { status: 400 }
      );
    }

    // Construct where conditions
    const whereConditions: SQL<unknown>[] = [];
    searchParams.forEach((value, key) => {
      if (key !== "sortBy" && key !== "order") {
        if (key in UserTable) {
          whereConditions.push(eq(UserTable[key as WhereField], value));
        }
      }
    });

    // Combine conditions using 'and'
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Fetch filtered and sorted users
    const users = await db.query.UserTable.findMany({
      where: whereClause,
      orderBy:
        sortingOrder === "asc"
          ? [asc(UserTable[sortBy])]
          : [desc(UserTable[sortBy])],
    });

    console.log(`Found ${users.length} records`);

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Error fetching records", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// const userModel = {
//   model: prisma.user,
//   attributes: [
//     "id",
//     "email",
//     "password",
//     "name",
//     "mobile",
//     "role",
//     "companyId",
//     "created_at",
//     "updated_at",
//   ],
// };
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = request.nextUrl;
//     const whereClause: Record<string, any> = {};
//     let orderByClause: Record<string, "asc" | "desc"> | undefined = undefined;
//     const validAttributes = [...userModel.attributes, "orderBy"];

//     console.log("Received search params:", Object.fromEntries(searchParams));

//     searchParams.forEach((value, key) => {
//       console.log(`Processing parameter: ${key} = ${value}`);
//       if (validAttributes.includes(key)) {
//         if (key === "orderBy") {
//           const parts = value.split(",");
//           let orderByField: string = userModel.attributes[0]; // Default to first attribute
//           let orderByDirection: "asc" | "desc" = "asc"; // Default to ascending

//           if (parts.length === 2) {
//             orderByField = parts[0];
//             orderByDirection =
//               parts[1].toLowerCase() === "desc" ? "desc" : "asc";
//           } else if (parts.length === 1) {
//             orderByDirection =
//               parts[0].toLowerCase() === "desc" ? "desc" : "asc";
//           }

//           console.log(
//             `OrderBy field: ${orderByField}, direction: ${orderByDirection}`
//           );

//           if (userModel.attributes.includes(orderByField)) {
//             orderByClause = {
//               [orderByField]: orderByDirection,
//             };
//             console.log(`Set orderByClause:`, orderByClause);
//           } else {
//             console.log(`Invalid orderBy field: ${orderByField}`);
//           }
//         } else if (key === "id") {
//           const ids = value.split(",").map((id) => id);
//           whereClause.id = ids.length > 1 ? { in: ids } : ids[0];
//         } else if (key === "state_id") {
//           const stateIds = value.split(",").map((id) => parseInt(id, 10));
//           whereClause.state_id =
//             stateIds.length > 1 ? { in: stateIds } : stateIds[0];
//         } else {
//           whereClause[key] = value;
//         }
//       } else {
//         console.log(`Ignoring invalid parameter: ${key}`);
//       }
//     });

//     const records = await prisma.user.findMany({
//       where: whereClause,
//       orderBy: orderByClause,
//     });

//     // const formattedData = formatRFPData(records);
//     // console.log("formattedData", formattedData);

//     console.log(`Found ${records.length} records`);

//     if (Object.keys(whereClause).length > 0 && records.length === 0) {
//       return NextResponse.json(
//         { error: `No records found matching the criteria` },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(serializePrismaModel(records));
//   } catch (error: unknown) {
//     console.error("Detailed error:", error);
//     return NextResponse.json(
//       { error: "Error fetching records", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = RegisterUserSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    const {
      name,
      email,
      password,
      mobile,
      role,
      company: companyName,
    } = validation.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    const company = await findCompanyByName(companyName);
    if (!company) {
      return NextResponse.json({ error: "Invalid compnay" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: role || "USER",
      companyId: company.id,
    });

    return NextResponse.json({ response: { data: newUser } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Failed to create user, Error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { id, email, password, name, role } = await request.json();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const results = await db
      .update(UserTable)
      .set({
        email,
        password: hashedPassword,
        name,
        role,
        updatedAt: new Date(),
      })
      .where(eq(UserTable.id, id))
      .returning();
    const updatedUser = results[0] || null;
    return NextResponse.json({ response: { data: updatedUser } });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  try {
    await deleteUser(id as string);
    return NextResponse.json({
      response: { message: "User deleted successfully" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
