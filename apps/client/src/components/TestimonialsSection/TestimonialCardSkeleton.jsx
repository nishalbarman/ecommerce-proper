import React from "react";

function TestimonialCardSkeleton() {
  return (
    <div className="p-4 w-full mt-5">
      <div className="bg-transparent p-8 rounded-lg h-full">
        {/* Avatar and Name Skeleton */}
        <div className="inline-flex items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-green-100 flex-shrink-0"></div>
          <div className="flex-grow flex flex-col pl-4">
            <div className="h-4 w-24 bg-green-100 rounded mb-2"></div>
            <div className="h-3 w-16 bg-green-100 rounded"></div>
          </div>
        </div>

        {/* Quote Icon Skeleton */}
        <div className="w-5 h-5 bg-green-100 mb-4"></div>

        {/* Review Text Skeleton */}
        <div className="space-y-2 mt-3">
          <div className="h-4 bg-green-100 rounded w-full"></div>
          <div className="h-4 bg-green-100 rounded w-5/6"></div>
          <div className="h-4 bg-green-100 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCardSkeleton;
