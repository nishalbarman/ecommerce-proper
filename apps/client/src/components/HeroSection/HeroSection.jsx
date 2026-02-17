import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";

import tree_leaf from "../../../public/bg.png";
import green_leaf_falling from "../../../public/green_leaf_falling.gif";

const fetchHeroProduct = async (cookieStore) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/hero-products`,
    );
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching hero product:", error);
    return null;
  }
};

const HeroProduct = async () => {
  const cookieStore = await cookies();
  const heroProduct = (await fetchHeroProduct(cookieStore)) || null;

  if (!heroProduct) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-500 to-emerald-500 py-24 max-md:pt-5">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src={tree_leaf}
          alt="Decorative leaf background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="select-none pointer-events-none"
        />
      </div>

      {/* <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 animate-float">
        <Image
          src={green_leaf_falling}
          alt="Falling leaves"
          width={600}
          height={600}
          className="select-none pointer-events-none"
        />
      </div> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text content */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-100 text-sm font-medium border border-white/20">
              {heroProduct.category || "Featured Product"}
            </span>

            <div
              className="text-white mb-10 prose-lg drop-shadow-lg max-md:prose-sm"
              dangerouslySetInnerHTML={{
                __html: `${heroProduct.shortDescription}`,
              }}></div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
              {/* <Link
                href={`/products/${heroProduct.productId}`}
                className="px-8 py-3 bg-white text-emerald-800 font-medium rounded-lg hover:bg-emerald-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                View Product
              </Link> */}
              <Link
                href="/products"
                className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Explore
              </Link>
            </div>
          </div>

          {/* Product image */}
          <div className="max-md:hidden lg:w-1/2 flex justify-center mt-10 lg:mt-0">
            <div className="relative w-full max-w-md aspect-square group">
              <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-md transform rotate-6 scale-95 group-hover:rotate-3 group-hover:scale-100 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-md transform rotate-8 scale-100 group-hover:rotate-5 group-hover:scale-105 transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:-translate-y-2 transition-all duration-500">
                <Image
                  src={heroProduct.imageUrl}
                  alt={heroProduct.title}
                  width={600}
                  height={600}
                  className="object-contain w-full h-[500px]"
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroProduct;
