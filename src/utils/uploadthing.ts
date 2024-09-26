import { OurFileRouter } from "@/server/uploadthing";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

//For frontend