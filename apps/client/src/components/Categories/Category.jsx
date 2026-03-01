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
    <div className="container bestselling mx-auto w-full h-fit max-md:px-2 px-4 max-sm:mt-8 max-md:mt-10 mt-15">
      <TitleWithBar title={"Browse By Category"} />
      <div className="w-full flex justify-between items-center max-sm:mb-4 max-md:mb-6 mb-8">
        <span className="font-bold  max-sm:text-base max-md:text-md max-lg:text-2xl text-2xl text-nowrap ">
          See Our Categories
        </span>
      </div>
      {/* <CategorySlider items={categories || []} /> */}
      <div className="">
        {/* max-w-7xl  */}
        <CategorySlider categories={categories || []} />
      </div>
    </div>
  );
}

// the reason I am not using react slick because of the behavior, it does not respond to user cliks properly.
