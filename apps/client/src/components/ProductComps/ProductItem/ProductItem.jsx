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
import { IoEyeOutline } from "react-icons/io5";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";

import { MdDeleteOutline } from "react-icons/md";
import { FaCartShopping, FaCheck } from "react-icons/fa6";
import Link from "next/link";

function ProductItem({
  productDetails = {},
  addToCartText = "Add To Cart",

  wishlistItemId = null,
  cartItemId = null,

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

  // wishlistIdMapped,
  // cartIdMapped,
}) {
  const {
    _id: productId,
    previewImage,
    title,
    category: { categoryName, categoryKey } = {},
    slideImages, // images array
    description,

    stars,
    totalFeedbacks,

    buyTotalOrders,

    productType,

    shippingPrice,
    availableStocks,

    discountedPrice, // if no varient is available then default price would be this
    originalPrice, // if no varient is available then default price would be this

    isVariantAvailable,
    productVariant,
    rentingPrice,
  } = productDetails;

  const { useAddOneToCartMutation, useDeleteCartMutation, useGetCartQuery } =
    CartApi;

  const {
    useAddWishlistMutation,
    useDeleteWishlistMutation,
    useGetWishlistQuery,
  } = WishlistApi;

  const { updateCart } = CartSlice;
  const { updateWishlist } = WishlistSlice;

  const cookiesStore = useCookies();

  const dispatch = useDispatch();
  const navigator = useRouter();

  const token = cookiesStore?.get("token");

  const { wishlists: wishlistIdMapped, totalCount: totalWishlistCount } =
    useSelector((state) => state.wishlistSlice);
  const { cart: cartIdMapped, totalCount: totalCartCount } = useSelector(
    (state) => state.cartSlice
  );

  // wishlist mutations -->
  const [addWishlist] = useAddWishlistMutation();
  const [removeFromWishlist] = useDeleteWishlistMutation();

  // cart mutations -->
  const [addToCart] = useAddOneToCartMutation();
  const [removeFromCart] = useDeleteCartMutation();

  const [onWishlist, setOnWishlist] = useState(false);
  useEffect(() => {
    setOnWishlist(!!wishlistIdMapped?.hasOwnProperty(productId));
  }, [wishlistIdMapped]);

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

  const handleRemoveFromCart = async () => {
    try {
      setOnCart(false);
      const cartItemID = cartIdMapped[productId];
      const resPayload = await removeFromCart({
        productId: cartItemID,
      }).unwrap();

      const newCartIdMapped = { ...cartIdMapped };
      delete newCartIdMapped[productId];
      dispatch(updateCart(newCartIdMapped));
      toast.success("Cart removed");
    } catch (error) {
      toast.error("Cart remove failed");
      setOnCart(true);
      console.error(error);
    }
  };

  const handleAddToCart = async () => {
    try {
      setOnCart((prev) => !prev);
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

      toast.success("Cart added");
    } catch (error) {
      toast.error("Cart add failed");
      console.error(error);
    }
  };

  const handleAddCartButtonClicked = (e) => {
    e.stopPropagation();
    if (!token) {
      return toast.success("You need to be logged in first.");
    }
    if (cartIdMapped?.hasOwnProperty(productId)) {
      handleRemoveFromCart();
    } else {
      handleAddToCart();
    }
  };

  const handleRemoveFromWishlist = async () => {
    try {
      setOnWishlist(false);
      const wishlistItemID = wishlistIdMapped[productId]?.wishlistId;
      const resPayload = await removeFromWishlist({
        wishlistItemID: wishlistItemID,
      }).unwrap();

      const newWishlistIdMapped = { ...wishlistIdMapped };
      delete newWishlistIdMapped[productId];
      dispatch(updateWishlist(newWishlistIdMapped));

      toast.success(resPayload?.message);
    } catch (error) {
      console.log("Why wishlist remove failed: ", error);
      toast.error(
        error?.data?.message || error?.message || "Wishlist remove failed"
      );
      // setOnWishlist(true);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setOnWishlist((prev) => !prev);
      const resPayload = await addWishlist({
        id: productId,
        productType,
      }).unwrap();

      toast.success("Wishlist added");
    } catch (error) {
      toast.error("Wishlist add failed");
      console.log(error);
    }
  };

  const handleLoveButtonClicked = (e) => {
    e.stopPropagation();
    if (!token) {
      return toast.success("You need to be logged in first.");
    }
    if (!!wishlistIdMapped?.hasOwnProperty(productId)) {
      handleRemoveFromWishlist();
    } else {
      handleAddToWishlist();
    }
  };

  return (
    <div className="w-full group/product_item">
      {/* TOP SECTION */}
      <div className="relative md:max-h-[300px] aspect-square rounded-lg overflow-hidden bg-[rgb(244,244,245)]">
        {/* discount label */}
        {!!originalPrice && (
          <div className="z-[999] absolute top-2 left-2 max-sm:w-13 w-[60px] rounded bg-[#DB4444] flex items-center justify-center max-sm:p-1 p-1.5">
            <span className="text-white text-sm max-sm:text-[12px] font-medium">
              {discount?.current || 0}%
            </span>
          </div>
        )}

        {/* add to cart button */}
        {!deleteCartIconVisible && (
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
        )}

        {/* all interactive icons */}
        <div className="absolute top-2 right-2 z-[999] flex flex-col gap-2 items-center w-fit">
          {/* ADD TO WISHLIST */}
          {isWishlistIconVisible && (
            <div
              className={`flex items-center justify-center bg-white rounded-full w-10 h-10 group-wishlist shadow-lg transition-all duration-200 ${onWishlist ? "hover:bg-red-100" : "hover:bg-gray-100"}`}
              onClick={handleLoveButtonClicked}>
              {onWishlist ? (
                <BsHeartFill size={19} color="red" fill="red" />
              ) : (
                <BsHeart size={19} />
              )}
            </div>
          )}

          {/* VIEW PRODUCT INFORMATION */}
          {isEyeVisible && (
            <div
              className="hidden md:flex items-center justify-center p-1 bg-white rounded-full w-10 h-10 group-viewproduct hover:bg-gray-100 shadow-lg transition-all duration-200"
              onClick={handleVisitProduct}>
              <AiOutlineEye size={23} />
            </div>
          )}

          {/* DELETE ICON CART */}
          {deleteCartIconVisible && (
            <div
              className="flex items-center justify-center p-1 bg-white rounded-full w-10 h-10 group-deletecart hover:bg-gray-100 shadow-lg transition-all duration-200"
              onClick={handleCartProductRemove}>
              <AiOutlineDelete size={20} />
            </div>
          )}

          {/* DELETE ICON WISHLIST */}
          {deleteWishlistIconVisible && (
            <div
              className="flex items-center justify-center p-1 bg-white rounded-full w-10 h-10 group-deletewishlist hover:bg-gray-100 shadow-lg transition-all duration-200"
              onClick={handleRemoveFromWishlist}>
              <AiOutlineDelete size={20} />
            </div>
          )}
        </div>

        {/* preview product image */}
        <img
          className="absolute inset-0 object-contain mix-blend-multiply w-full h-full rounded-lg"
          src={previewImage}
          alt={title}
        />
      </div>

      {/* body section */}
      <div className="w-full flex flex-col gap-2 p-4 bg-white">
        <div className="md:hidden">
          <button
            disabled={onCart}
            className="w-full flex items-center justify-center h-12 rounded-lg bg-black text-white transition-all duration-200 hover:bg-gray-800"
            onClick={handleAddCartButtonClicked}>
            {onCart ? (
              <FaCheck size={20} color="white" fill="white" />
            ) : (
              <FaCartShopping size={20} color="white" fill="white" />
            )}
          </button>
        </div>

        <div className="w-full max-md:shadow rounded py-2 px-2">
          <Link href={`/products/view/${productId}`} className="block group">
            <h3 className="text-xl font-semibold line-clamp-2 transition-colors duration-200">
              {title}
            </h3>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-black text-xl md:text-lg font-bold">
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

export default ProductItem;
