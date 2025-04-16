import React from "react";
import TitleWithBar from "../TitleWithBar/TitleWithBar";
// import CategorySlider from "../Categories/CategorySlider";
import { cookies } from "next/headers";
import CategorySlider from "./CategorySlider/CategorySlider";

async function getCategories() {
  try {

    const url = new URL(`/categories`, process.env.NEXT_PUBLIC_SERVER_URL);

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

  console.log(categories);

  return (
    <div className="container mx-auto w-full h-fit mt-10 lg:mt-[3rem] max-md:px-2">
      <TitleWithBar title={"Browse By Category"} />
      <div className="w-full flex justify-between items-center mb-12 max-[597px]:mb-6 max-sm:zoom-0_1">
        <span className="text-2xl xl:text-3xl font-bold max-[597px]:text-[20px] text-nowrap">
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
