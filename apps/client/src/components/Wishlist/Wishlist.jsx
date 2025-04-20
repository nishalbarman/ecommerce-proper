"use client";

import React from "react";
import { useSelector } from "react-redux";

import { WishlistApi, CartApi } from "@/redux";

import ProductItem from "../ProductComps/ProductItem/ProductItem";
import Link from "next/link";
import Image from "next/image";
import { FiShoppingBag } from "react-icons/fi";

function Wishlist() {
  const { useDeleteWishlistMutation, useGetWishlistQuery } = WishlistApi;
  const { useAddOneToCartMutation } = CartApi;

  const { data: wishlistData, error: wishlistError } = useGetWishlistQuery();

  const wishlist = useSelector((state) => state.wishlistSlice.wishlistItems);
  const wishlistCount = useSelector((state) => state.wishlistSlice.totalItems);

  const [
    removeOneWishlist,
    { isLoading: isLoadingRmWishlist, isError: isErrorRmWishlist },
  ] = useDeleteWishlistMutation();

  const [addOneToCart, { isLoading: isCartLoading, isError: isCartError }] =
    useAddOneToCartMutation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <>
        {/* empty wishlist display */}
        {wishlistData?.length <= 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <FiShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your wihslist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your wishlist yet
            </p>
            <Link
              href="/products"
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-8 rounded-lg transition-colors">
              Continue Shopping
            </Link>
          </div>
        )}

        {wishlistData?.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-xl font-andika">
              Wishlist ({wishlistData?.length})
            </p>
            <button className="rounded-[4px] border-[1px] border-[black] h-[45px] p-[0px_20px]">
              Move All to Bag
            </button>
          </div>
        )}

        {wishlistData?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl-grid-cols-6 gap-5 items-center m-[40px_0] w-[100%] z-1">
            {wishlistData?.map((item) => {
              return (
                <div className="min-md:w-[250px]">
                  <ProductItem
                    // {...item}
                    wishlistItemId={item._id}
                    productDetails={item.product}
                    options={{
                      wishlistItems: wishlist,
                      isEyeVisible: true,
                      isWishlistIconVisible: false,
                      deleteCartIconVisible: false,
                      deleteWishlistIconVisible: true,
                      removeOneWishlist: removeOneWishlist,
                      addOneToCart: addOneToCart,
                      addToCartText: "Move to Cart",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </>
    </div>
  );
}

export default Wishlist;
