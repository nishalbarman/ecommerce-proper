import React from "react";
import { cookies } from "next/headers";
import CartClientPage from "./(component)/CartClientPage";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/cart?productType=buy`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const cartData = await response.json();

  console.log("Cart Items Server", cartData);

  return (
    <>
      <CartClientPage initialCartData={cartData} />
    </>
  );
}
