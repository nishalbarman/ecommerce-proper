import React from "react";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import WishlistClientPage from "./(component)/WishlistClientPage";

export default async function Page() {
  const response = await fetch(`/wishlist`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const wishlistData = await response.json();

  return (
    <>
      <WishlistClientPage initialWishlistData={wishlistData} />
    </>
  );
}
