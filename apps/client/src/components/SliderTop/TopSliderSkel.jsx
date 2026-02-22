import React from "react";

const TopSliderSkeleton = () => {
  return (
    <div className="container mx-auto px-2 sm:px-3 md:px-4 my-5">
      <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md animate-pulse">
        {/* Image Section */}
        <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[500px] bg-red-100" />

        {/* Desktop Overlay Skeleton */}
        <div className="hidden md:flex absolute inset-0 items-end justify-end p-5">
          <div className="bg-white/70 rounded-xl p-4 shadow-md max-w-xs space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Mobile & Tablet Text */}
        <div className="md:hidden bg-white p-3 sm:p-4 space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-52 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default TopSliderSkeleton;
