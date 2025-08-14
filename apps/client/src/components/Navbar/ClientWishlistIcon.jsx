"use client";

import { WishlistApi, WishlistSlice } from "@/redux";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { IoIosHeartEmpty } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa";
import { LuHeart } from "react-icons/lu";
import { BsHeart } from "react-icons/bs";

function ClientWishlistIcon() {
  const cookieStore = useCookies();
  const token = cookieStore.get("token");

  const { useGetWishlistQuery } = WishlistApi;
  const { updateWishlist } = WishlistSlice;

  const dispatch = useDispatch();

  const { data: userWishlistItems } = useGetWishlistQuery({
    productType: "buy",
  });

  useEffect(() => {
    if (token && userWishlistItems?.length > 0) {
      const wishlistData = {};

      console.log("User Wishlist Items", userWishlistItems);

      userWishlistItems?.forEach((item) => {
        wishlistData[item.product._id] = {
          ...item.product, // to fix the override _id issue we should place this line in 2nd place
          ...item, //will override the previouse product _id
          _id: item.product._id, // we can also manually add the _id field to fix the issue
          wishlistId: item._id,
          product: null,
        };
      });
      dispatch(
        updateWishlist({
          totalCount: userWishlistItems.length || 0,
          wishlists: wishlistData,
        })
      );
    }
  }, [userWishlistItems]);

  return (
    <Link href={"/wishlist"}>
      <div className="h-fit w-fit relative cursor-pointer">
        {!!userWishlistItems?.length && (
          <div
            className={`box-content absolute z-[1] flex items-center justify-center aspect-square right-[-5px] rounded-full p-1 absolute bottom-5 bg-[#DB4444] min-w-4 min-h-4 w-4 h-4 flex items-center`}>
            <span className="text-[10px] text-white font-semibold">
              {userWishlistItems?.length || 0}
            </span>
          </div>
        )}
        <FaRegHeart color="black" fill={"black"} size={23} />
      </div>
    </Link>
  );
}

export default ClientWishlistIcon;
