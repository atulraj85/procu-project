import { sendEmailVerificationEmail } from "@/lib/mail";
import { generateEmailVerificationToken } from "@/lib/token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  const verificationToken = await generateEmailVerificationToken(email);
  if (verificationToken) {
    await sendEmailVerificationEmail(email, verificationToken?.token);
    return NextResponse.json({}, { status: 200 });
  } else {
    NextResponse.json({ error: "Error on sending mail!" }, { status: 500 });
  }
}
