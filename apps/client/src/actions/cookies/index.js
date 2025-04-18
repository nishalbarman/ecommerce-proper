"use server";

import { cookies } from "next/headers";

export async function setLoginCookies(token) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 60, // 1 hour
  });
}
