import { POTable, RFPTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { desc, like } from "drizzle-orm";

export function isValidUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

function makePrefix(d = new Date()) {
  const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
  return `RFP-${dateString}-`;
}

export async function generateRFPId() {
  const prefix = makePrefix();

  // Get the latest RFP for today by rfpId
  const lastRFP = await db.query.RFPTable.findFirst({
    where: like(RFPTable.rfpId, `${prefix}%`),
    orderBy: desc(RFPTable.rfpId),
  });

  let nextNumber = 0;
  if (lastRFP?.rfpId) {
    const lastNumber = parseInt(lastRFP.rfpId.split("-").pop() || "0", 10);
    nextNumber = isNaN(lastNumber) ? 0 : lastNumber + 1;
  }

  const formatted = String(nextNumber).padStart(4, "0");
  return `${prefix}${formatted}`;
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
