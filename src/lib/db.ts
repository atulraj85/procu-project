import * as schema from "@/drizzle/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const isProduction = process.env.NODE_ENV === "production";

const sql = neon(process.env.DATABASE_URL!); // use neon driver instead of pg Pool
export const db = drizzle(sql, {
  schema,
  logger: !isProduction,
});
