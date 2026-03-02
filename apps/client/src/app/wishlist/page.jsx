import React from "react";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import WishlistClientPage from "./(component)/WishlistClientPage";

export default async function Page() {
  let wishlistData = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/wishlist`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    wishlistData = await response.json();
  } catch (error) {
    wishlistData = [];
    console.error("Wishlist fetch error from server component: ", error);
  }

  return (
    <>
      <WishlistClientPage initialWishlistData={wishlistData} />
    </>
  );
}
