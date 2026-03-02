"use server";

import { cookies } from "next/headers";

export async function setLoginCookies(token) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    sameSite: "none",
    secure: true,
    httpOnly: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 60 * 60, // 1 hour
  });
}
