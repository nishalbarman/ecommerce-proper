"use client";

import React from "react";
import { useSelector } from "react-redux";

import { WishlistApi, CartApi } from "@/redux";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import Loading from "../../../components/LoadingScreen/LoadingScreen";
import WishlistItem from "@/components/WishlistComps/WishlistItem/WishlistItem";

export default function WishlistClientPage({ initialWishlistData }) {
  const { useDeleteWishlistMutation, useGetWishlistQuery } = WishlistApi;
  const { useAddOneToCartMutation } = CartApi;

  const {
    data: wishlistData,
    isLoading: isWishlistLoading,
    error: wishlistRtkError,
  } = useGetWishlistQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      data: result.data || initialWishlistData,
    }),
    refetchOnMountOrArgChange: true,
  });

  const wishlist = useSelector((state) => state.wishlistSlice.wishlistItems);
  const wishlistCount = useSelector((state) => state.wishlistSlice.totalItems);

  const [
    removeOneWishlist,
    { isLoading: isLoadingRmWishlist, isError: isErrorRmWishlist },
  ] = useDeleteWishlistMutation();

  const [addOneToCart, { isLoading: isCartLoading, isError: isCartError }] =
    useAddOneToCartMutation();

  // if (isWishlistLoading) return <Loading />;

  return (
    <>
      <main className="min-h-[100vh] container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex justify-between items-center mb-6 max-sm:mb-4 md:flex-col md:items-start md:gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Wishlist{" "}
                <span className="text-gray-500">({wishlistData?.length})</span>
              </h1>
            </div>
          )}

          {wishlistData?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl-grid-cols-5 gap-5 items-center space-x-4 max-sm:my-1 w-full z-1">
              {wishlistData?.map((item) => {
                return (
                  <div key={item._id || index} className="w-full h-full">
                    <WishlistItem
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
      </main>
    </>
  );
}
