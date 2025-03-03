"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Thumbs,
} from "swiper/modules";
import "swiper/css";

import Image from "next/image";
import TestimonialCard from "../TestimonialsSection/TestimonialCard";

import "./swiper-style.css";

const CustomPrevArrow = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="absolute flex items-center justify-center text-white rounded-full h-[25px] w-[25px] bg-[#F5F5F5] backdrop-blur-[10px] flex items-center justify-center left-0 scale-[2] top-[40%] transform translate-y-[-50%] cursor-pointer z-10 max-[597px]:w-4 max-[597px]:h-4 hover:invert group/rightarrow shadow">
      <Image
        className="group-hover/rightarrow:invert-1 max-[597px]:w-2 max-[597px]:h-2"
        src={"/assets/leftarrow.svg"}
        width={10}
        height={10}
        alt="left arrow"
      />
    </div>
  );
};

const CustomNextArrow = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="absolute flex items-center justify-center text-white rounded-full h-[25px] w-[25px] bg-[#F5F5F5] backdrop-blur-[10px] flex items-center justify-center right-0 scale-[2] top-[40%] transform translate-y-[-50%] cursor-pointer z-10 max-[597px]:w-4 max-[597px]:h-4 hover:invert group/rightarrow shadow">
      <Image
        className="group-hover/rightarrow:invert-1 max-[597px]:w-2 max-[597px]:h-2"
        src={"/assets/rightarrow.svg"}
        width={10}
        height={10}
        alt="right arrow"
      />
    </div>
  );
};

const CustomSlider = ({ testimonials }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Thumbs]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={10}
      slidesPerView={3}
      height={"auto"}
      className="my-swiper w-full bg-transparent mb-4">
      {/* Slider Images */}

      {testimonials.map((testi, index) => (
        <SwiperSlide>
          <TestimonialCard key={index} {...testi} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CustomSlider;
