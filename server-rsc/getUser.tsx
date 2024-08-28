import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export interface User {
  id: string;
  email: string;
  name: string;
}

export async function getUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = await getToken({
    req: {
      cookies: Object.fromEntries(
        cookieStore.getAll().map((c) => [c.name, c.value])
      ),
      headers: {},
    } as any,
  });

  if (!token || !token.name || !token.email || !token.sub) {
    return null;
  }

  return {
    id: token.sub,
    name: token.name,
    email: token.email,
  };
}
