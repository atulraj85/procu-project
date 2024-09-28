import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(databaseUrl);
const db = drizzle(sql);
const migrationsFolder = "./src/drizzle/migrations";

const main = async () => {
  try {
    console.log(`Starting migration using folder: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log(`Migration completed at ${new Date().toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error(`Migration failed at ${new Date().toISOString()}:`, error);
    process.exit(1);
  }
};

// Handle unhandled rejections globally
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

main();
