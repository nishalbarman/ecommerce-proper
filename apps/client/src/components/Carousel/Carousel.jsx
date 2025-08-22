"use client";

import React, { useRef } from "react";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";

const CustomArrow = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute top-1/2 ${
        direction === "prev" ? "left-3" : "right-3"
      } transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white 
      rounded-md p-3 cursor-pointer z-20 transition-all duration-300 shadow-lg`}>
      {direction === "prev" ? "‹" : "›"}
    </div>
  );
};

const Carousel = ({ items = [] }) => {
  const sliderRef = useRef();
  const router = useRouter();

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3500,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
  };

  return (
    <Slider {...settings} ref={sliderRef}>
      {items?.map((item, index) => (
        <div
          key={index}
          style={{
            backgroundColor: item.bgColor,
          }}
          onClick={() => item.redirectUrl && router.push(item.redirectUrl)}
          className={`cursor-pointer px-2 bg-[${item.bgColor}]`}>
          <div
            className={`relative rounded-2xl overflow-hidden shadow-lg group bg-[${item.bgColor}]`}>
            {/* Image with smooth zoom effect */}
            <div
              style={{
                backgroundColor: item.bgColor,
              }}
              className={`relative w-full h-64 md:h-[450px] lg:h-[540px] bg-[${item.bgColor}]`}>
              <Image
                src={item.imageUrl}
                alt={item.altText || item.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Text Content */}
            <div className="absolute bottom-5 text-center md:text-left w-fit max-sm:w-full md:right-5 max-sm:px-5">
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-md">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                )}
                <p className="text-blue-600 text-sm mt-2 font-semibold">
                  Shop now →
                </p>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md">
              <span className="text-xs font-semibold text-blue-600">
                Popular
              </span>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default Carousel;
