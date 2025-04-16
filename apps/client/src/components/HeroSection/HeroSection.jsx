import React from "react";

import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";

import tree_leaf from "../../../public/bg.png";
import green_leaf_falling from "../../../public/green_leaf_falling.gif";

const fetchHeroProduct = async (cookieStore) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/hero-products`
    );
    const data = await response.json();

    console.log("Hero data", data);

    return data[0];
  } catch (error) {
    console.error("Error fetching hero product:", error);
  }
};

const HeroProduct = async () => {
  const cookieStore = await cookies();

  const heroProduct = (await fetchHeroProduct(cookieStore)) || null;

  return (
    <>
      {heroProduct && (
        <div className="bg-primary py-20 relative max-sm:zoom-0_1">
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
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 text-center lg:text-left z-2">
                <h3 className="text-white text-lg font-light mb-6 drop-shadow-lg">
                  {heroProduct.category || "Demo"}
                </h3>

                <div
                  className="text-white mb-10 prose-lg drop-shadow-lg"
                  dangerouslySetInnerHTML={{
                    __html: `${heroProduct.shortDescription}`,
                  }}></div>
                {/* <div className="flex max-lg:justify-center gap-4">
                  <Link
                    href={`/products/${heroProduct.productId}`}
                    className="cursor-pointer bg-black text-white px-6 py-3 rounded">
                    View
                  </Link>
                  <Link
                    href="/products"
                    className="cursor-pointer border border-black text-black px-6 py-3 rounded">
                    Explore
                  </Link>
                </div> */}
              </div>
              <div className="lg:w-1/2 justify-center hidden md:flex mt-10 ml-5 lg:mt-0 animate-zoomInOut">
                <Image
                  className="h-[600px] w-auto object-contain select-none drag-none drop-shadow-lg"
                  src={`${heroProduct?.imageUrl || ""}`}
                  alt={heroProduct?.title}
                  objectFit="contain"
                  width={500}
                  height={400}
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroProduct;
