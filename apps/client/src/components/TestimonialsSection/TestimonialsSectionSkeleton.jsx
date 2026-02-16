"use client";

import React from "react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";

import TestimonialCardSkeleton from "../TestimonialsSection/TestimonialCardSkeleton";

import tree_leaf from "../../../public/bg.png";
import green_leaf_falling from "../../../public/green_leaf_falling.gif";

import "../../styles/swiper-style.css";

import "swiper/css";

const TestimonialsSkeleton = () => {
  return (
    <div className="bg-primary py-20 relative">
      <div className="h-full w-full absolute top-0 left-0">
        <Image
          className="select-none drag-none"
          src={tree_leaf}
          alt=""
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="h-full absolute top-0 left-[45%] opacity-[0.1]">
        <Image
          className="select-none drag-none"
          src={green_leaf_falling}
          alt=""
          width={500}
          height={500}
          objectFit="contain"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="mx-auto text-center w-2/4 max-sm:zoom-0_1">
            <div className="inline-flex items-center mb-5">
              <div className="flex-grow flex flex-col pl-4">
                <div className="h-4 w-24 bg-green-100 rounded mb-2"></div>
              </div>
            </div>

            {/* Quote Icon Skeleton */}
            <div className="w-full h-5 bg-green-100 mb-4"></div>
            {/* <h1 className="text-white text-4xl leading-11 font-bold">
              Our Customer Said{" "}
              <span className="text-black font-light">
                About Our Mehendi Products
              </span>
            </h1>
            <p className="my-10 font-andika">
              Hear from our happy customers about their experiences.
            </p> */}
          </div>
        </div>
        <div className="text-black w-full relative">
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
              className="w-full bg-transparent mb-4">
              <SwiperSlide>
                <TestimonialCardSkeleton />
              </SwiperSlide>
              <SwiperSlide>
                <TestimonialCardSkeleton />
              </SwiperSlide>
              <SwiperSlide>
                <TestimonialCardSkeleton />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSkeleton;
