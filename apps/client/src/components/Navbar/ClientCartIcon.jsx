"use client";

import { CartSlice, CartApi } from "@/redux/index";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { IoCartOutline } from "react-icons/io5";
import { BsCart2, BsCart3 } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { PiShoppingCart, PiShoppingCartSimple } from "react-icons/pi";

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
            className={`animate-pulse box-content absolute z-[1] flex items-center justify-center  aspect-square right-[-5px] rounded-full p-1 absolute bottom-5 min-w-3 min-h-3 max-sm:min-w-3 max-sm:min-h-3 max-sm:w-3 max-sm:h-3 max-sm:bg-[#DB4444] bg-red-500`}>
            <span className="hidden text-[10px] max-sm:text-[8px] text-white max-sm:text-black font-semibold">
              {userCartItems?.length}
            </span>
          </div>
        )}
        {/* <BsCart3 color="white" fill={"white"} size={26} /> */}
        <PiShoppingCart color="black" fill={"black"} size={29} />
      </div>
    </Link>
  );
}

export default ClientCartIcon;
