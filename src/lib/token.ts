import {
  createEmailVerificationToken,
  deleteEmailVerificationToken,
  findEmailVerificationTokenByEmail,
} from "@/data/email-verification-token";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  findPasswordResetTokenByEmail,
} from "@/data/password-reset-token";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

interface IValidatedToken {
  userId: number;
  iat: number;
  exp: number;
}

export const generateToken = async (email: string, password: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    const passwordMatch = await bcrypt.compare(
      password,
      user?.password as string
    );

    if (!user || !passwordMatch) {
      throw new Error("Invalid Credentials");
    }

    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1hr",
    });
  } catch (err) {
    throw new Error((err as any)?.message);
  }
};

export const validateToken = async (
  token: string | null
): Promise<IValidatedToken | void | null> => {
  if (!token) {
    throw new Error("Invalid Token");
  }
  try {
    const decodedToken: IValidatedToken | void = jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET as string,
      function (err, payload) {
        //@ts-ignore
        if (err) {
          throw new Error(err?.message);
        } else {
          return payload;
        }
      }
    );

    return decodedToken;
  } catch (err) {
    throw new Error((err as any)?.message);
  }
};

export async function generateEmailVerificationToken(email: string) {
  // TODO:  Move this to .env file and read it from there.
  const EXPIRATION_TIME_IN_MS = 3600 * 1000; // 1 hour

  try {
    const existingToken = await findEmailVerificationTokenByEmail(email);
    if (existingToken) {
      await deleteEmailVerificationToken(existingToken.id);
    }

    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + EXPIRATION_TIME_IN_MS);
    return await createEmailVerificationToken({ email, token, expiresAt });
  } catch (error) {
    console.error(`Error generating token`, error);
  }
}

export async function generatePasswordResetToken(email: string) {
  // TODO:  Move this to .env file and read it from there.
  const EXPIRATION_TIME_IN_MS = 3600 * 1000; // 1 hour

  try {
    const existingToken = await findPasswordResetTokenByEmail(email);
    if (existingToken) {
      await deletePasswordResetToken(existingToken.id);
    }

    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + EXPIRATION_TIME_IN_MS);
    return await createPasswordResetToken({ email, token, expiresAt });
  } catch (error) {
    console.error(`Error generating token`, error);
  }
}
