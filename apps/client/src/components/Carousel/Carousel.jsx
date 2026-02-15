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
          onClick={() => item.redirectUrl && router.push(item.redirectUrl)}
          className="cursor-pointer px-2 sm:px-3 md:px-4">
          <div className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-md group bg-[${item?.bgColor}]`}>
            {/* Image Section */}
            <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[500px]">
              <Image
                src={item.imageUrl}
                alt={item.altText || item.title}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                priority
              />

              {/* Desktop Overlay ONLY */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="hidden md:flex absolute inset-0 items-end justify-end p-5">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-md max-w-xs">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}

                  <p className="text-red-600 text-sm mt-2 font-semibold">
                    Shop now →
                  </p>
                </div>
              </div> 

              {/* Badge (all screens) */}
              {/* <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                <div className="bg-white/90 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full shadow">
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-600">
                    Popular
                  </span>
                </div>
              </div> */}
            </div>

            {/* Mobile & Tablet Text BELOW */}
            <div className="md:hidden bg-white p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}

              <p className="text-[rgb(219,69,69)] text-sm mt-2 font-semibold">
                Shop now →
              </p>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default Carousel;
