import React from "react";
import TitleWithBar from "../TitleWithBar/TitleWithBar";
// import CategorySlider from "../Categories/CategorySlider";
import { cookies } from "next/headers";
import CategorySlider from "./CategorySlider/CategorySlider";

async function getCategories() {
  try {
    const url = new URL(
      `/api/proxy/categories`,
      process.env.NEXT_PUBLIC_DOMAIN_URL,
    );

    console.log(url.href);

    const response = await fetch(url.href);
    const data = await response.json();

    console.log("What is our categories", data);

    return data.categories;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export default async function Category() {
  const categories = await getCategories();

  console.log("What are categories", categories);

  return (
    <div className="container mx-auto w-full h-fit mt-10 lg:mt-[3rem] max-md:px-2">
      <TitleWithBar title={"Browse By Category"} />
      <div className="w-full flex justify-between items-center mb-12 max-[597px]:mb-6  max-sm:-mt-2">
        <span className="text-2xl xl:text-3xl font-bold max-[597px]:text-[20px] text-nowrap max-sm:text-base">
          See Our Categories
        </span>
      </div>
      {/* <CategorySlider items={categories || []} /> */}
      <div className="mx-auto">
        {/* max-w-7xl  */}
        <CategorySlider categories={categories || []} />
      </div>
    </div>
  );
}

// the reason I am not using react slick because of the behavior, it does not respond to user cliks properly.
