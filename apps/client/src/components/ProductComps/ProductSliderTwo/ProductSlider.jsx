"use client";

import React from "react";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import "./swiper-style.css";
import ProductItem from "../ProductItem/ProductItem";

import { CartApi, WishlistApi } from "@/redux";

const ProductSlider = ({ products }) => {
  const navigator = useRouter();

  const { useAddWishlistMutation, useDeleteWishlistMutation } = WishlistApi;
  const { useAddOneToCartMutation, useDeleteCartMutation } = CartApi;

  const wishlistIdMapped = useSelector(
    (state) => state.wishlistSlice?.wishlists
  );

  const cartIdMapped = useSelector((state) => state.cartSlice?.cart);

  const [addNewWishlist, { isLoading, isError }] = useAddWishlistMutation();
  const [
    removeOneWishlist,
    { isLoading: isLoadingRmWishlist, isError: isErrorRmWishlist },
  ] = useDeleteWishlistMutation();

  const [addOneToCart, { isLoading: isCartLoading, isError: isCartError }] =
    useAddOneToCartMutation();
  const [
    removeOneFromCart,
    { isLoading: isCartRemoveLoading, isError: isCartRemoveError },
  ] = useDeleteCartMutation();

  return (
    <div>
      <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        navigation={true}
        spaceBetween={10}
        slidesPerView={3}
        height={"auto"}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          288: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          580: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          900: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 10,
          },
        }}
        enabled={true}
        // centeredSlides={true}
        className="w-full bg-transparent mb-4">
        {/* Slider Images */}
        {products?.map((productItem, index) => (
          <SwiperSlide key={index}>
            <ProductItem
              productDetails={{ ...productItem }}
              options={{
                isRatingVisible: false,
                isEyeVisible: true,
                isWishlistIconVisible: true,
                deleteCartIconVisible: false,
                deleteWishlistIconVisible: false,
              }}
              wishlistIdMapped={wishlistIdMapped}
              cartIdMapped={cartIdMapped}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductSlider;
