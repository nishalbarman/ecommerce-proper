"use client";

import { CartSlice, CartApi } from "@/redux/index";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { IoCartOutline } from "react-icons/io5";

function ClientCartIcon() {
  const dispatch = useDispatch();

  const { useGetCartQuery } = CartApi;
  const { updateCart } = CartSlice;

  const { data: { cart: userCartItems } = {} } = useGetCartQuery({
    productType: "buy",
  });

  console.log("userCartItems", userCartItems);

  useEffect(() => {
    if (userCartItems?.length > 0) {
      const cartDataForStore = {};

      userCartItems?.forEach((item) => {
        cartDataForStore[item.product._id] = {
          ...item.product, // to fix the override _id issue we should place this line in 2nd place
          ...item, //will override the previouse product _id
          _id: item.product._id, // we can also manually add the _id field to fix the issue
          cartId: item._id,
          product: null,
        };
      });

      dispatch(
        updateCart({
          totalCount: userCartItems.length || 0,
          cartItems: cartDataForStore,
        })
      );
    }
  }, [userCartItems]);

  return (
    <Link href="/cart">
      <div className="h-fit w-fit relative cursor-pointer">
        {!!userCartItems?.length && (
          <div
            className={`box-content absolute z-[1] flex items-center justify-center  aspect-square right-[-5px] rounded-full p-1 absolute bottom-5 bg-[#DB4444] min-w-4 min-h-4`}>
            <span className="text-[10px] text-white font-semibold">
              {userCartItems?.length}
            </span>
          </div>
        )}
        <IoCartOutline size={30} />
      </div>
    </Link>
  );
}

export default ClientCartIcon;
