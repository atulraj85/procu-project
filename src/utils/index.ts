import { POTable, RFPTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { desc, like } from "drizzle-orm";

export function isValidUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

export async function generateRFPId() {
  console.log("=== Starting RFP ID Generation Process ===");
  const today = new Date();
  console.log("1. Current date:", today);
  const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const prefix = `RFP-${dateString}-`;
  console.log("2. Date components:", dateString);

  // Get the last RFP_ID for today
  const lastRFP = await db.query.RFPTable.findFirst({
    where: like(RFPTable.rfpId, `${prefix}%`),
    orderBy: desc(RFPTable.rfpId),
  });
  console.log("2. Last RFP components:", lastRFP);

  let nextNumber = 0;
  if (lastRFP && lastRFP.rfpId) {
    const lastId = lastRFP.rfpId;
    const lastNumber = parseInt(lastId.split("-").pop() || "0", 10); // Default to "0" if undefined
    nextNumber = lastNumber + 1;
  }

  // Format the next number to be 4 digits
  const formattedNumber = String(nextNumber).padStart(4, "0");

  const finalResult = `${prefix}${formattedNumber}`;

  console.log("4. Generated RFP ID:", finalResult);
  console.log("=== RFP ID Generation Process Complete ===");

  return finalResult;
}

export async function generatePOId() {
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const prefix = `PO-${dateString}-`;

  // Get the last RFP_ID for today
  let lastPO = await db.query.POTable.findFirst({
    where: like(POTable.poId, `${prefix}%`),
    orderBy: desc(POTable.poId),
  });

  let nextNumber = 0;
  if (lastPO && lastPO.poId) {
    const lastId = lastPO.poId;
    const lastNumber = parseInt(lastId.split("-").pop() || "0", 10); // Default to "0" if undefined
    nextNumber = lastNumber + 1;
  }

  // Format the next number to be 4 digits
  const formattedNumber = String(nextNumber).padStart(4, "0");
  return `${prefix}${formattedNumber}`;
}
