"use client";

import { withRole } from "@/components/auth/with-role";

async function SettingsPage() {
  return <div>Settings Page</div>;
}

// export default SettingsPage;
export default withRole({
  children: <SettingsPage />,
  // allowedRoles: ["USER", "ADMIN"],
  allowedRoles: ["ADMIN"],
});
