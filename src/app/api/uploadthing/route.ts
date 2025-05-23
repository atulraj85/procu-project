import { uploadRouter } from "@/server/uploadthing";
import { createRouteHandler } from "uploadthing/next";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    logLevel: "Debug",
    // handleDaemonPromise: "await",
  },
});
