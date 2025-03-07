"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import "./swiper-style.css";
import CategoryItem from "../CategoryItem";

const CategorySlider = ({ categories }) => {
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
          877: {
            slidesPerView: 3,
            spaceBetween: 3,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
        }}
        enabled={true}
        // centeredSlides={true}
        className="w-full bg-transparent mb-4">
        {/* Slider Images */}
        {categories.map((cate, index) => (
          <SwiperSlide key={index}>
            <CategoryItem {...cate} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategorySlider;
