"use server";

import { cookies } from "next/headers";

export const clearCookiesAfterLogout = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
  } catch (error) {
    console.error(error);
  }
};
