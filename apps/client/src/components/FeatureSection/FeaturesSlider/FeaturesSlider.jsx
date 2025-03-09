"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import "./swiper-style.css";
import FeatureItem from "@/components/Features/FeatureItem";
import NeutralCard from "../NeutralCard";

const FeaturesSlider = ({ features }) => {
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
        {/* Slider Images */}
        {features.map((feat, index) => (
          <SwiperSlide key={index}>
            <NeutralCard
              key={index}
              title={feat.featureName}
              description={feat.featureDescription}
              icon={feat.featureImageUrl}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturesSlider;
