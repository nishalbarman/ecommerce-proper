import React from "react";
import TitleWithBar from "../TitleWithBar/TitleWithBar";

// import ProductSlider from "../ProductComps/ProductSlider/ProductSlider";
import Link from "next/link";
import ProductSlider from "../ProductComps/ProductSliderTwo/ProductSlider";

async function BestSelling() {
  const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;

  const url = new URL(`/api/proxy/products`, backendUrl);

  url.searchParams.append("page", 1);
  url.searchParams.append("limit", 11);

  url.searchParams.append("sort", "popularity");

  const res = await fetch(url.href, {
    credentials: "include",
    headers: {
      method: "GET",
    },
    cache: "no-store",
  });
  const productData = await res.json();

  console.log("Product Data", productData);

  return (
    <div className="container bestselling mx-auto w-full h-fit max-md:px-2 px-4 max-sm:mt-8 max-md:mt-10 mt-15">
      <TitleWithBar title={"Our Products"} />
      <div className="w-full flex justify-between items-center max-sm:mb-4 max-md:mb-6 mb-8">
        <span className="font-bold align-center max-sm:text-base max-md:text-md max-lg:text-2xl text-2xl">
          {/* Best Selling Products */}
          Collection of Products
        </span>

        <Link
          href="/products"
          className="pt-3 pb-3 pl-8 pr-8 text-sm rounded-lg bg-[#DB4444] text-white font-semibold cursor-poiner hover:scale-[1.05] max-[597px]:p-[8px_25px] max-sm:hidden">
          View All
        </Link>
      </div>
      {/* <ProductSlider items={productData?.data} /> */}
      <ProductSlider products={productData?.data} />

      <Link
        href="/products"
        className="mx-auto mt-5 py-3 w-fit pb-3 px-8 max-sm:py-3 max-sm:px-5 max-sm:text-xs text-sm rounded-lg bg-[#DB4444] text-white font-semibold cursor-pointer hover:scale-[1.05] max-sm:block hidden">
        View All
      </Link>
    </div>
  );
}

export default BestSelling;
