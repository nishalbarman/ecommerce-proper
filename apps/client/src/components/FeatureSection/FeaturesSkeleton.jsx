"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";

import TitleWithBar from "../TitleWithBar/TitleWithBar";
import FeatureCardSkeleton from "./FeatureCardSkeleton";

import "swiper/css";
import "../../styles/swiper-style.css";

const FeaturesSkeleton = () => {
  return (
    <div className="container mx-auto w-full h-fit max-md:px-2">
      <TitleWithBar title={"Features"} />
      <div className="w-full flex justify-between items-center mb-12 max-[597px]:mb-6 max-sm:zoom-0_1">
        <span className="text-2xl xl:text-3xl font-bold max-[597px]:text-[20px] text-nowrap">
          Why to Order from Us
        </span>
      </div>
      {/* <CategorySlider items={categories || []} /> */}
      <div className="mx-auto">
        {/* max-w-7xl  */}
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
                spaceBetween: 5,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
            }}
            enabled={true}
            // centeredSlides={true}
            className="w-full bg-transparent mb-4">
            <SwiperSlide>
              <FeatureCardSkeleton />
            </SwiperSlide>
            <SwiperSlide>
              <FeatureCardSkeleton />
            </SwiperSlide>
            <SwiperSlide>
              <FeatureCardSkeleton />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSkeleton;
