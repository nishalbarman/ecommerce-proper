// "use client";

import React from "react";
import ProductItemSkeleton from "../ProductItem/ProductSkeleton";

const ProductSliderSkel = () => {
  return (
    <div className="container mx-auto mt-20 px-2 flex gap-5 overflow-hidden">
      <ProductItemSkeleton />
      <ProductItemSkeleton />
      <ProductItemSkeleton />
      <ProductItemSkeleton />
    </div>
  );
};

export default ProductSliderSkel;
