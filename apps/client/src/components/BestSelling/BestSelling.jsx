import React from "react";
import TitleWithBar from "../TitleWithBar/TitleWithBar";
import { cookies } from "next/headers";
import { fetchProducts } from "@/lib/product";
// import ProductSlider from "../ProductComps/ProductSlider/ProductSlider";
import Link from "next/link";
import ProductSlider from "../ProductComps/ProductSliderTwo/ProductSlider";

async function BestSelling() {
  const cookieStore = await cookies();

  const productData = await fetchProducts({
    page: 0,
    limit: 10,
    cookies: cookieStore,
  });

  console.log("Product Data", productData);

  return (
    <div className="container mx-auto w-full h-fit mt-10 lg:mt-[3rem] max-md:px-2">
      <TitleWithBar title={"Our Mehendi Products"} />
      <div className="w-full flex justify-between items-center mb-10 max-[597px]:mb-6">
        <span className="text-2xl xl:text-3xl font-bold align-center max-[597px]:text-[20px] max-sm:-mt-2">
          {/* Best Selling Products */}
          Collection of Mehendi Products
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
        className="mx-auto mt-4 py-3 w-fit pb-3 px-8 text-sm rounded-lg bg-[#DB4444] text-white font-semibold cursor-pointer hover:scale-[1.05] max-sm:block hidden">
        View All
      </Link>
    </div>
  );
}

export default BestSelling;
