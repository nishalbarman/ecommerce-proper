import React from "react";
import TestimonialCardSkeleton from "./TestimonialCardSkeleton";
import TestimonialCard from "./TestimonialCard";
import TestimonialSlider from "./TestimonialSlider/TestimonialSlider";

import tree_leaf from "../../../public/bg.png";
import green_leaf_falling from "../../../public/green_leaf_falling.gif";
import Image from "next/image";

// Fetch data on the server
const fetchTestimonials = async () => {
  try {
    // await new Promise((res) => {
    //   setTimeout(() => {
    //     res(true);
    //   }, 10000);
    // });

    const response = await fetch(`/testimonials`);
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return null;
  }
};

const Testimonials = async () => {
  // Fetch the testimonials data
  const testimonials = await fetchTestimonials();

  console.log("Testimonials", testimonials);

  // If data is not available, show the skeleton loader
  if (!testimonials || !testimonials.length) {
    return null;
  }

  return (
    <div className="bg-primary py-20 max-sm:py-5 relative">
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
        <div className="text-center mb-12 max-sm:mb-7">
          <div className="mx-auto text-center w-2/4 max-md:w-3/4 max-sm:zoom-0_1">
            <h1 className="text-black text-4xl leading-[50px] font-bold max-md:text-base">
              Our Customer Said{" "}
              <span className="text-black font-light">About Our Products</span>
            </h1>
          </div>
        </div>
        <div className="text-black w-full relative">
          <TestimonialSlider testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
