import React from "react";
import tree_leaf from "../../../public/bg.png";
import green_leaf_falling from "../../../public/green_leaf_falling.gif";
import Image from "next/image";

const HeroSkeleton = () => {
  return (
    <div className="bg-primary py-40 relative max-sm:zoom-0_1">
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

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Text Section Skeleton */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Subheading Skeleton */}
            <div className="h-6 w-48 bg-green-100 rounded mb-4 mx-auto lg:mx-0"></div>
            <div className="h-6 w-48 bg-green-100 rounded mb-4 mx-auto lg:mx-0"></div>

            {/* Heading Skeleton */}
            <div className="h-12 w-full bg-green-100 rounded mb-6 mx-auto lg:mx-0"></div>

            {/* Paragraph Skeleton */}
            <div className="space-y-2 mb-8">
              <div className="h-4 bg-green-100 rounded w-full"></div>
              <div className="h-4 bg-green-100 rounded w-5/6"></div>
              <div className="h-4 bg-green-100 rounded w-4/6"></div>
              <div className="h-4 bg-green-100 rounded w-3/6"></div>
            </div>

            {/* Buttons Skeleton */}
            <div className="space-x-4">
              <div className="inline-block h-12 w-32 bg-green-100 rounded"></div>
              <div className="inline-block h-12 w-32 bg-green-100 rounded"></div>
            </div>
          </div>

          {/* Image Section Skeleton */}
          <div className="lg:w-1/2 justify-center hidden md:flex mt-10 ml-5 lg:mt-0">
            <div className="h-120 w-96 bg-green-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSkeleton;
