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
    <div className="w-[100%] group/product_item">
      {/* TOP SECTION */}
      <div className="relative rounded flex items-center justify-center w-full h-[200px] md:h-[250px] bg-[rgb(244,244,245)]">
        {/* discount label */}
        {!!originalPrice && (
          <div className="z-[999] absolute top-0 left-0 w-[80px] rounded bg-[#DB4444] flex items-center justify-center max-[591px]:w-[60px] p-[3px_5px] ">
            <span className="text-white text-[14px] max-[591px]:text-[12px]">
              {discount?.current || 0}%
            </span>
          </div>
        )}

        {/* add to cart button */}
        {!deleteCartIconVisible && (
          <button
            disabled={onCart}
            className="w-[100%] justify-center items-center overflow-hidden bottom-0 translate-y-[55px] transition duration-300 ease-in-out min-[593px]:group-hover/product_item:flex min-[593px]:group-hover/product_item:translate-y-0 cursor-pointer absolute z-[1] max-sm:h-[40px] max-sm:text-[15px] flex items-center justify-center h-[48px] rounded-b bg-[rgba(0,0,0,0.7)] text-white "
            onClick={handleAddCartButtonClicked}>
            {onCart ? (
              <Image
                className="invert"
                alt="check_add_to_cart"
                src={"/assets/check.svg"}
                width={20}
                height={20}
              />
            ) : (
              <Image
                alt="add to cart"
                className="invert"
                src={"/assets/addcart.svg"}
                width={25}
                height={30}
              />
            )}
          </button>
        )}

        {/* all interactive icons */}
        <div className="cursor-pointer absolute top-3 right-3 z-[999] flex flex-col gap-2 items-center w-fit">
          {/* ADD TO WISHLIST */}
          {isWishlistIconVisible && (
            <div
              className={`flex items-center justify-center bg-white rounded-full w-[40px] h-[40px] max-[597px]:w-[33px] max-[597px]:h-[33px] group-wishlist shadow ${onWishlist ? "hover:bg-black " : "hover:invert"}`}
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
              className="cursor-pointer flex items-center justify-center  p-1 bg-white rounded-full w-[40px] h-[40px] max-[597px]:w-8 max-[597px]:h-8 group-viewproduct hover:invert shadow"
              onClick={handleVisitProduct}>
              <AiOutlineEye size={23} />
            </div>
          )}

          {/* DELETE ICON CART */}
          {deleteCartIconVisible && (
            <div
              className="cursor-pointer flex items-center justify-center p-1 bg-white rounded-full w-[40px] h-[40px] group-deletecart hover:invert shadow"
              onClick={handleCartProductRemove}>
              <Image
                className="group-hover/deletecart:invert"
                src="/assets/delete.svg"
                width={17}
                height={17}
                alt="delete cart icon"
              />
            </div>
          )}

          {/* DELETE ICON WISHLIST */}
          {deleteWishlistIconVisible && (
            <div
              className="cursor-pointer flex items-center justify-center  p-1 bg-white rounded-full w-[40px] h-[40px] group-deletewishlist hover:invert shadow"
              onClick={handleRemoveFromWishlist}>
              <AiOutlineDelete size={20} />
            </div>
          )}

          {/* ADD TO CART BUTTON */}
          {!deleteCartIconVisible && (
            <div
              className="cursor-pointer hidden items-center justify-center p-1 bg-white rounded-full w-[40px] h-[40px] hover:scale-[1.18] max-[597px]:flex max-[597px]:w-[33px] max-[597px]:h-[33px]"
              onClick={handleAddToCart}>
              {cartIdMapped?.hasOwnProperty(productId) ? (
                <Image src={"/assets/addcart.svg"} width={22} height={22} />
              ) : (
                <Image
                  src="/assets/add_to_cart_icon.svg"
                  width={21}
                  height={21}
                  alt="add to cart icon"
                />
              )}
            </div>
          )}
        </div>

        {/* preview product image */}
        {/* <div className="box-border p-2 h-[100%] w-[100%]"> */}
        <img
          className="absolute object-contain mix-blend-multiply h-[100%] w-[100%] rounded aspect-sqaure"
          src={previewImage}
          alt={title}
        />
        {/* </div> */}
      </div>

      {/* body section */}
      <div className="relative w-[100%] flex flex-col items-left md:items-center gap-1 pt-[16px] pb-[16px] bg-white z-[999] overflow-hidden">
        <span className="text-lg md:text-[19px] font-semibold line-clamp-1">
          {title}
        </span>
        <div className="flex gap-[16px] justify-left md:justify-center w-[100%]">
          <span className="text-[#DB4444] text-[16px] md:text-[18px]">
            &#8377;{discountedPrice} INR
          </span>
          {!!originalPrice && (
            <span className="line-through text-[#000] text-[16px] md:text-[18px] opacity-[0.6]">
              &#8377;{originalPrice} INR
            </span>
          )}
        </div>
        {isRatingVisible && (
          <div className="flex justify-left md:justify-center gap-4 w-[100%] overflow-hidden">
            <div className="flex items-center gap-[2px] mt-[5px] h-full w-fit">
              <RateStar stars={stars} />
            </div>
            <div className="flex items-center h-full max-sm:hidden">
              <span className="text-[#000] text-[18px] font-semibold opacity-[0.5]">
                ({totalFeedbacks})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductItem;
