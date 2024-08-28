import { headers } from "next/headers";

export function getRequestStorage<T>(): T {
  return headers() as unknown as T;
}

export const asyncStorage = {
  getStore: getRequestStorage,
};

function throwError(msg: string): never {
  throw new Error(msg);
}
