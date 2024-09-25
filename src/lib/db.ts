import { neon } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export const db = prisma;

const sql = neon(process.env.DATABASE_URL!); // use neon driver instead of pg Pool
export const drizzleDB = drizzle(sql, { schema, logger: true });
