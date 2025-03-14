import React from "react";

function ProductItemSkeleton() {
  return (
    <div className="w-full group/product_item animate-pulse">
      {/* TOP SECTION */}
      <div className="relative rounded flex items-center justify-center w-full h-[200px] md:h-[250px] bg-gray-300">
        {/* Discount label skeleton */}
        <div className="z-[999] absolute top-0 left-0 w-[80px] rounded bg-gray-300 h-6"></div>

        {/* Add to cart button skeleton */}
        {/* <button className="w-full justify-center items-center overflow-hidden bottom-0 translate-y-[55px] transition duration-300 ease-in-out min-[593px]:group-hover/product_item:flex min-[593px]:group-hover/product_item:translate-y-0 absolute z-[1] max-sm:h-[40px] max-sm:text-[15px] flex items-center justify-center h-[48px] rounded-b bg-gray-300"></button> */}

        {/* Interactive icons skeleton */}
        <div className="absolute top-3 right-3 z-1 flex flex-col gap-2 items-center w-fit">
          {/* Wishlist icon skeleton */}
          <div className="flex items-center justify-center p-1 bg-white rounded-full w-[40px] h-[40px] max-[597px]:w-[33px] max-[597px]:h-[33px] bg-gray-300"></div>

          {/* View product icon skeleton */}
          <div className="flex items-center justify-center p-1 bg-white rounded-full w-[40px] h-[40px] max-[597px]:w-8 max-[597px]:h-8 bg-gray-300"></div>

          {/* Delete icon skeleton */}
          {/* <div className="flex items-center justify-center p-1 bg-white rounded-full w-[40px] h-[40px] bg-gray-300"></div> */}
        </div>

        {/* Product image skeleton */}
        <div className="h-full w-full rounded aspect-square bg-gray-300"></div>
      </div>

      {/* BODY SECTION */}
      <div className="relative w-full flex flex-col items-left md:items-center gap-1 pt-[16px] pb-[16px] bg-white z-2 overflow-hidden">
        {/* Product title skeleton */}
        <div className="h-6 w-full bg-gray-300 rounded"></div>

        {/* Price section skeleton */}
        <div className="flex gap-[16px] justify-left md:justify-center w-full">
          <div className="h-6 w-full bg-gray-300 rounded"></div>
          <div className="h-6 w-full bg-gray-300 rounded"></div>
        </div>

        {/* Rating section skeleton */}
        <div className="flex justify-left md:justify-center gap-4 w-full overflow-hidden">
          <div className="h-6 w-full bg-gray-300 rounded"></div>
          <div className="h-6 w-full bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default ProductItemSkeleton;
