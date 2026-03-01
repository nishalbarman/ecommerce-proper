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

import { BsHeart, BsHeartFill } from "react-icons/bs";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { AiOutlineEye } from "react-icons/ai";
import { PiEyes } from "react-icons/pi";
import { FaCartShopping, FaCheck } from "react-icons/fa6";
import Link from "next/link";
import { setLoginModalState } from "@/redux/slices/loginModalSlice";

function ProductCard({
  productDetails = {},
  addToCartText = "Add To Cart",
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
    slug: productSlug,
    previewImage,
    title,
    category: { categoryName, categoryKey } = {},
    description,
    stars,
    totalFeedbacks,
    discountedPrice,
    originalPrice,
    rentingPrice,
  } = productDetails;

  // let productIdEncoded = Buffer.from(productId.toString()).toString("base64");

  const { useAddOneToCartMutation } = CartApi;
  const { useAddWishlistMutation, useDeleteWishlistMutation } = WishlistApi;
  const { updateCart } = CartSlice;
  const { updateWishlist } = WishlistSlice;

  const cookiesStore = useCookies();
  const dispatch = useDispatch();
  const navigator = useRouter();
  const token = cookiesStore?.get("token");

  const { wishlists: wishlistIdMapped } = useSelector(
    (state) => state.wishlistSlice,
  );
  const { cart: cartIdMapped } = useSelector((state) => state.cartSlice);

  const [addWishlist] = useAddWishlistMutation();
  const [removeFromWishlist] = useDeleteWishlistMutation();
  const [addToCart] = useAddOneToCartMutation();

  const [onWishlist, setOnWishlist] = useState(false);
  const [onCart, setOnCart] = useState(false);

  useEffect(() => {
    setOnWishlist(!!wishlistIdMapped?.hasOwnProperty(productId));
    setOnCart(!!cartIdMapped?.hasOwnProperty(productId));
  }, [wishlistIdMapped, cartIdMapped]);

  const discount = useRef(
    Math.floor(((originalPrice - discountedPrice) / originalPrice) * 100),
  );

  const handleVisitProduct = (e) => {
    e.stopPropagation();
    navigator.push(`/products/view/${productSlug}`);
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

  const handleAddCartButtonClicked = (e) => {
    e.stopPropagation();
    if (!token) {
      dispatch(setLoginModalState({ modalVisible: true }));
      return toast.success("You need to be logged in first.");
    }
    handleAddToCart();
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!token) {
      dispatch(setLoginModalState({ modalVisible: true }));
      return toast.success("You need to be logged in first.");
    }

    try {
      if (onWishlist) {
        const wishlistItemID = wishlistIdMapped[productId]?.wishlistId;
        await removeFromWishlist({ wishlistItemID }).unwrap();
        const newWishlistIdMapped = { ...wishlistIdMapped };
        delete newWishlistIdMapped[productId];
        dispatch(updateWishlist(newWishlistIdMapped));
        toast.success("Removed from wishlist");
      } else {
        await addWishlist({ id: productId, productType: "buy" }).unwrap();
        toast.success("Added to wishlist");
      }
      setOnWishlist(!onWishlist);
    } catch (error) {
      toast.error(
        error?.data?.message || error?.message || "Wishlist operation failed",
      );
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
    <div className="w-full group/product_item ">
      {/* Image Section */}
      <div className="relative md:max-h-[400px] aspect-square rounded-lg overflow-hidden bg-[rgb(244,244,245)] w-full">
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
          onClick={handleAddCartButtonClicked}>
          {onCart ? (
            <FaCheck size={20} color="white" fill="white" />
          ) : (
            <FaCartShopping size={21} color="white" fill="white" />
          )}
        </button>

        {/* Action Icons */}
        <div className={`absolute top-2 right-2 z-[999] flex flex-col gap-2 items-center w-fit bg-[${previewImage?.bgColor}]`}>
          {/* Toogle Wishlist Button */}
          <div
            className={`max-sm:w-auto max-sm:h-auto max-sm:p-1 flex items-center justify-center bg-white rounded-full w-10 h-10 group-wishlist shadow-lg transition-all duration-200 hover:cursor-pointer ${
              onWishlist ? "hover:bg-red-100" : "hover:bg-gray-100"
            }`}
            onClick={handleToggleWishlist}>
            {onWishlist ? (
              <IoMdHeart size={21} color="red" fill="red" />
            ) : (
              <IoMdHeartEmpty size={21} />
            )}
          </div>

          {/* Quick View Button */}
          <div
            className="hidden md:flex items-center justify-center p-1 bg-white rounded-full w-10 h-10 group-viewproduct hover:bg-gray-100 shadow-lg transition-all duration-200 hover:cursor-pointer"
            onClick={handleVisitProduct}>
            {/* <AiOutlineEye size={21} /> */}
            <PiEyes size={20} />
          </div>
        </div>

        {/* Product Image */}
        <img
        style={{
          backgroundColor: previewImage?.bgColor,
        }}
          className={`absolute inset-0 object-contain mix-blend-multiply w-full h-full rounded-lg`}
          src={previewImage?.imageUrl}
          alt={title}
        />
      </div>

      {/* Product Info Section */}
      <div className="w-full flex flex-col gap-2 max-sm:gap-1 pt-2 bg-white">
        <div className="md:hidden">
          <button
            disabled={onCart}
            className="w-full flex items-center justify-center h-12 w-5 max-sm:h-8 max-md:h-9 rounded-lg bg-black text-white transition-all duration-200 hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed"
            onClick={handleAddCartButtonClicked}>
            {onCart ? (
              <FaCheck
                size={innerWidth < 490 ? 13 : 20}
                color="white"
                fill="white"
              />
            ) : (
              <FaCartShopping
                size={innerWidth < 490 ? 13 : 20}
                color="white"
                fill="white"
              />
            )}
          </button>
        </div>

        <Link href={`/products/view/${productSlug}`} className="block group">
          <div className="w-full rounded pt-1 px-2">
            <h5 className="max-sm:text-sm text-lg font-semibold max-sm:line-clamp-2 line-clamp-1 transition-colors duration-200">
              {title}
            </h5>
            <div className="flex flex-col gap-1 mt-2 max-sm:mt-1">
              <div className="flex items-center gap-3">
                <span className="text-black text-xl md:text-lg max-sm:text-base font-bold">
                  &#8377;{discountedPrice}
                </span>
                {!!originalPrice && (
                  <span className="line-through text-gray-400 text-sm md:text-base max-sm:tex-sm ">
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
          </div>
        </Link>

        {/* Rating */}
        {!isRatingVisible && (
          <>
            <div className=" flex items-center gap-2 px-2 -mt-0">
              <div className="flex items-center">
                <RateStar stars={stars} />
              </div>
              <span className="text-gray-500 text-sm">({totalFeedbacks})</span>
            </div>
            {/* Rating */}
            {/* <div className="flex items-center gap-1 px-1 -mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(stars)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">({totalFeedbacks})</span>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
