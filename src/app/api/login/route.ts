import { db } from "@/lib/db";
import { error_response, success_response } from "@/lib/response";
import { generateToken } from "@/lib/token";
import { LoginUserInputValidation } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    
    const inputValidation = LoginUserInputValidation.safeParse(body);
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
      select: {
        id: true,
        role: true,  // Make sure to select the role
      },
    });
    
    if (!existingUser) {
      return error_response("User with this email does not exist", 400);
    }
    
    const token = await generateToken(email, password);
    
    const response = {
      userId: existingUser.id,
      role: existingUser.role,  // Include the role in the response
      token,
    };
    
    return success_response(response, "User logged in successfully", 200);
  } catch (err) {
    return error_response((err as any)?.message, 400);
  }
}