import React from "react";

const FeaturesSkeleton = () => {
  return (
    <div className="relative w-auto h-60 rounded-lg shadow-md overflow-hidden p-5 animate-pulse">
      {/* Diagonal split background */}
      <div className="absolute inset-0 flex">
        {/* Light green half (top-left to bottom-right) */}
        <div className="w-full h-full bg-[#91BC78] clip-path-diagonal-left"></div>
        {/* Dark green half (top-right to bottom-left) */}
        <div className="w-full h-full bg-[#9BC387] clip-path-diagonal-right"></div>
      </div>

      {/* Semi-transparent border */}
      <div className="absolute inset-2 border-2 border-white/30 rounded-md"></div>

      <div className="flex flex-col items-center justify-center h-full p-5">
        {/* Leaf icon placeholder */}
        <div className="relative inset-0 mb-5 w-10 h-10 bg-[#87B66D] rounded-full"></div>

        {/* Text placeholder */}
        <div className="relative inset-0 w-3/4 h-6 bg-[#87B66D] rounded"></div>
      </div>
    </div>
  );
};

export default FeaturesSkeleton;
