"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import { useRef } from "react"; // Add useRef
import Image from "next/image";
import TestimonialCard from "../TestimonialsSection/TestimonialCard";
import "./swiper-style.css";

const CustomSlider = ({ testimonials }) => {
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
            slidesPerView: 2,
            spaceBetween: 5,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
        }}
        enabled={true}
        centeredSlides={true}
        className="w-full bg-transparent mb-4">
        {/* Slider Images */}
        {testimonials?.map((testi, index) => (
          <SwiperSlide key={index}>
            <TestimonialCard {...testi} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CustomSlider;
