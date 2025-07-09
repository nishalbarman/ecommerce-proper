import React from "react";
import Carousel from "../Carousel/Carousel";
import axios from "axios";
import { getBackendUrl } from "../../helpter/utils";

// import CategoryLink from "../CategoryLink/CategoryLink";

const getBanners = async () => {
  try {
    const backendUrl = getBackendUrl();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/banner`
    );
    return response.data.data;
  } catch (error) {
    return [];
  }
};

async function TopSlider() {
  const bannerList = await getBanners();

  const categoryLinks = [
    {
      categoryName: "Woman’s Fashion",
      categoryPath: "/",
      isRightArrowVisible: true,
      categoryExtraLinks: [
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
      ],
    },
    {
      categoryName: "Men’s Fashion",
      categoryPath: "/",
      isRightArrowVisible: true,
      categoryExtraLinks: [
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
      ],
    },
    {
      categoryName: "Electronics",
      categoryPath: "/",
      isRightArrowVisible: false,
    },
    {
      categoryName: "Home & Lifestyle",
      categoryPath: "/",
      isRightArrowVisible: false,
    },
    {
      categoryName: "Medicine",
      categoryPath: "/",
      isRightArrowVisible: false,
    },
    {
      categoryName: "Sports & Outdoor",
      categoryPath: "/",
      isRightArrowVisible: true,
      categoryExtraLinks: [
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
      ],
    },
    {
      categoryName: "Baby’s & Toys",
      categoryPath: "/",
      isRightArrowVisible: true,
      categoryExtraLinks: [
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
        { title: "Hi I am an link" },
      ],
    },
    {
      categoryName: "Groceries & Pets",
      categoryPath: "/",
      isRightArrowVisible: false,
    },
    {
      categoryName: "Health & Beauty",
      categoryPath: "/",
      isRightArrowVisible: false,
    },
  ];

  return (
    <div className="flex justify-between gap-[6%] mt-[4px] lg:mt-10">
      {/* <div className="hidden flex-col items-center justify-center xl:flex gap-[30px] justify-start items-center w-[400px]">
        {categoryLinks.map((item) => (
          <CategoryLink {...item} />
        ))}
      </div> */}

      <div
        className={`pl-[2%] pr-[2%] lg:p-0 h-fit rounded-md border-0 outline-0 border-none outline-none focus:border-none focus:outline-none peer-focus-visible:border-none peer-focus-visible:outline-none mt-[3%] lg:mt-0 w-[100%] xl:w-[100%] container mx-auto`}>
        <Carousel
          items={
            [
              {
                imageUrl:
                  "https://img.freepik.com/free-vector/stylish-glowing-digital-red-lines-banner_1017-23964.jpg",
                title: "Mehendi Design 1",
                description: "Beautiful Mehendi Design 1",
                altText: "Mehendi Design 1",
              },
              {
                imageUrl:
                  "https://www.shutterstock.com/image-photo/sunrise-back-lit-ocean-wave-260nw-2167455831.jpg",
                title: "Mehendi Design 1",
                description: "Beautiful Mehendi Design 1",
                altText: "Mehendi Design 1",
              },
              {
                imageUrl:
                  "https://plus.unsplash.com/premium_photo-1701590725747-ac131d4dcffd?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vic2l0ZSUyMGJhbm5lcnxlbnwwfHwwfHx8MA%3D%3D",
                title: "Mehendi Design 1",
                description: "Beautiful Mehendi Design 1",
                altText: "Mehendi Design 1",
              },
            ] || []
          }
        />
      </div>
    </div>
  );
}

// xl:w-[80%]

export default TopSlider;
