"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import toast from "react-hot-toast";

import RateStar from "../../RatingStart";
import { WishlistApi, CartApi, CartSlice, WishlistSlice } from "@/redux";
import { useSelector } from "react-redux";

import { BsHeartFill } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { FaCartShopping, FaCheck } from "react-icons/fa6";
import Link from "next/link";

function WishlistItem({
  productDetails = {},
  wishlistItemId,
  options: {
    isRatingVisible,
    isEyeVisible,
    isWishlistIconVisible,
    deleteCartIconVisible,
    deleteWishlistIconVisible,
  } = {
    isRatingVisible: true,
    isEyeVisible: true,
    isWishlistIconVisible: true,
    deleteCartIconVisible: false,
    deleteWishlistIconVisible: false,
  },
}) {
  const {
    _id: productId,
    previewImage,
    title,
    category: { categoryName, categoryKey, slug } = {},
    description,
    stars,
    totalFeedbacks,
    discountedPrice,
    originalPrice,
    rentingPrice,
  } = productDetails;

  const { useAddOneToCartMutation } = CartApi;
  const { useDeleteWishlistMutation } = WishlistApi;
  const { updateWishlist } = WishlistSlice;

  const cookiesStore = useCookies();
  const dispatch = useDispatch();
  const navigator = useRouter();
  const token = cookiesStore?.get("token");

  const { cart: cartIdMapped } = useSelector((state) => state.cartSlice);

  const [removeFromWishlist] = useDeleteWishlistMutation();
  const [addToCart] = useAddOneToCartMutation();

  const [onCart, setOnCart] = useState(false);

  useEffect(() => {
    setOnCart(!!cartIdMapped?.hasOwnProperty(productId));
  }, [cartIdMapped]);

  const discount = useRef(
    Math.floor(((originalPrice - discountedPrice) / originalPrice) * 100)
  );

  const handleVisitProduct = (e) => {
    e.stopPropagation();
    navigator.push(`/products/view/${productId}`);
  };

  const handleAddToCart = async () => {
    try {
      setOnCart(true);
      const resPayload = await addToCart({
        variant: undefined,
        productId: productId,
        rentDays: undefined,
        productType: "buy",
        quantity: 1,
        originalPrice,
        discountedPrice,
        rentingPrice,
      }).unwrap();

      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      const resPayload = await removeFromWishlist({
        wishlistItemID: wishlistItemId,
      }).unwrap();

      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to remove from wishlist"
      );
      console.error(error);
    }
  };

  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
    const handleResize = () => setInnerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full group/product_item">
      {/* Image Section */}
      <div style={{
        backgroundColor: previewImage?.bgColor,
      }} className={`relative md:max-h-[300px] aspect-square rounded-lg overflow-hidden bg-[${previewImage?.bgColor}]`}>
        {!!originalPrice && (
          <div className="z-[999] absolute top-2 left-2 max-sm:w-13 w-[60px] rounded bg-[#DB4444] flex items-center justify-center max-sm:p-1 p-1.5">
            <span className="text-white text-sm max-sm:text-[12px] font-medium">
              {discount?.current || 0}%
            </span>
          </div>
        )}

        {/* Add to cart button */}
        <button
          disabled={onCart}
          className="w-full justify-center items-center overflow-hidden bottom-0 translate-y-[55px] transition-all duration-300 ease-in-out md:group-hover/product_item:flex md:group-hover/product_item:translate-y-0 cursor-pointer absolute z-[1] h-12 flex items-center justify-center rounded-b bg-[rgba(0,0,0,0.8)] text-white hover:bg-black"
          onClick={handleAddToCart}>
          {onCart ? (
            <FaCheck size={20} color="white" fill="white" />
          ) : (
            <FaCartShopping size={21} color="white" fill="white" />
          )}
        </button>

        {/* Action Icons */}
        <div className="absolute top-2 right-2 z-[999] flex flex-col gap-2 items-center w-fit">
          {/* Remove from Wishlist Button */}
          <div
            className="flex items-center justify-center p-1 bg-white rounded-full w-10 h-10 group-deletewishlist hover:bg-gray-100 shadow-lg transition-all duration-200 hover:cursor-pointer"
            onClick={handleRemoveFromWishlist}>
            <AiOutlineDelete size={20} />
          </div>

          {/* Quick View Button */}
          <div
            className="hidden md:flex items-center justify-center p-1 bg-white rounded-full w-10 h-10 group-viewproduct hover:bg-gray-100 shadow-lg transition-all duration-200 hover:cursor-pointer"
            onClick={handleVisitProduct}>
            <AiOutlineEye size={23} />
          </div>
        </div>

        {/* Product Image */}
        <img
          className="absolute inset-0 object-contain w-full h-full rounded-lg"
          src={previewImage?.imageUrl}
          alt={title}
        />
      </div>

      {/* Product Info Section */}
      <div className="w-full flex flex-col gap-2 py-4 max-sm:py-3 bg-white">
        <div className="md:hidden">
          <button
            disabled={onCart}
            className="w-full flex items-center justify-center h-12 max-sm:h-9 rounded-lg bg-black text-white transition-all duration-200 hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed"
            onClick={handleAddToCart}>
            {onCart ? (
              <FaCheck
                size={innerWidth < 490 ? 17 : 20}
                color="white"
                fill="white"
              />
            ) : (
              <FaCartShopping
                size={innerWidth < 490 ? 17 : 20}
                color="white"
                fill="white"
              />
            )}
          </button>
        </div>

        <div className="w-full rounded py-2 max-sm:pt-1 px-2">
          <Link href={`/products/view/${productId}`} className="block group">
            <h3 className="text-lg max-md:text-lg max-sm:text-base font-semibold line-clamp-2 transition-colors duration-200">
              {title}
            </h3>
            <div className="flex flex-col gap-1 mt-2 max-sm:mt-1">
              <div className="flex items-center gap-3">
                <span className="text-black text-lg max-md:text-lg max-sm:text-base  font-bold">
                  &#8377;{discountedPrice}
                </span>
                {!!originalPrice && (
                  <span className="line-through text-gray-400 text-sm md:text-base">
                    &#8377;{originalPrice}
                  </span>
                )}
              </div>
              {!!originalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">You save</span>
                  <span className="text-green-600 text-sm font-medium">
                    &#8377;{originalPrice - discountedPrice}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Rating */}
        {isRatingVisible && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <RateStar stars={stars} />
            </div>
            <span className="text-gray-500 text-sm">({totalFeedbacks})</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistItem;
