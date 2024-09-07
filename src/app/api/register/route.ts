import { db } from "@/lib/db";
import { error_response, success_response } from "@/lib/response";
import { CreateUserInputValidation } from "@/lib/validations";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, name, password, company, mobile } = body;

    const inputValidation = CreateUserInputValidation.safeParse(body);

    if (!inputValidation.success) {
      return error_response(
        "Input validation failed",
        400,
        inputValidation.error
      );
    }

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return error_response("User with this email already exists", 400);
    }

    // Retrieve companyId from the company table using findFirst
    const companyRecord = await db.company.findFirst({
      where: {
        name: company, // Assuming the company table has a 'name' field
      },
    });

    if (!companyRecord) {
      return error_response("Company not found", 400);
    }

    const companyId = companyRecord.id; // Assuming the company table has an 'id' field

    const hashedUserPassword = await hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        companyId,
        name,
        mobile,
        password: hashedUserPassword,
      },
    });

    return success_response(
      newUser,
      "User created successfully, kindly proceed to login",
      201
    );
  } catch (err) {
    return error_response((err as any)?.message, 400);
  }
}
