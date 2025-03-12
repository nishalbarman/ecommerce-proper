"use server";

import { cookies } from "next/headers";

export async function setLoginCookies(token) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    sameSite: "none",
    secure: true,
  });
}
