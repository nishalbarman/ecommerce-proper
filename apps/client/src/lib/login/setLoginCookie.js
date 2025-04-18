"use server";

import { cookies } from "next/headers";

export const setCookiesAfterLogin = async ({ token } = {}) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", token);
  } catch (error) {
    console.error(error);
  }
};
