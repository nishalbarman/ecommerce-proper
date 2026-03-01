"use client";

import "swiper/css";
import CategoryItem from "../CategoryItem";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CustomArrow = ({ direction, onClick }) => {
  return (
    <div
      onClick={onClick}
      disabled
      className={`absolute top-1/2 ${
        direction === "prev" ? "left-3" : "right-3"
      } transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white 
      rounded-md p-3 cursor-pointer z-20 transition-all duration-300 shadow-lg disabled:cursor-not-allowed`}>
      {direction === "prev" ? "‹" : "›"}
    </div>
  );
};

const CategorySlider_New = ({ categories }) => {
  const sliderRef = useRef();
  const router = useRouter();

  const settings = {
    dots: false,
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3500,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 2,
    arrows: true,
    swipeToSlide: true,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }
    ],

    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
  };

  return (
    <div>
      <Slider {...settings} ref={sliderRef}>
        {categories.map((cate, index) => (
          <CategoryItem {...cate} />
        ))}
      </Slider>
    </div>
  );
};

export default CategorySlider_New;
