import React from "react";
import Carousel from "../Carousel/Carousel";
import axios from "axios";
import { getBackendUrl } from "../../helpter/utils";
import CategoryLink from "../SliderTopLinks/CategoryLink";

const getBanners = async () => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
    const response = await axios.get(`${backendUrl}/api/proxy/banners`);
    console.log("Array Data:", response.data);
    return response.data.banners;
    // const items = [
    //   {
    //     imageUrl:
    //       "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/765095ed-122d-4d06-a685-ce08ee3ba31e.png",
    //     title: "Mehendi Design 1",
    //     description: "Beautiful Mehendi Design 1",
    //     altText: "Mehendi Design 1",
    //   },
    //   {
    //     imageUrl:
    //       "https://sdmntprwestus3.oaiusercontent.com/files/00000000-2644-61fd-b4fd-1992a4e02a10/raw?se=2025-08-20T09%3A58%3A46Z&sp=r&sv=2024-08-04&sr=b&scid=dabe6875-dd5f-51a4-a8b6-3b5e29e83cda&skoid=c953efd6-2ae8-41b4-a6d6-34b1475ac07c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-08-19T22%3A11%3A24Z&ske=2025-08-20T22%3A11%3A24Z&sks=b&skv=2024-08-04&sig=ZTc6%2BHZ7GaR4uFVTGdtGBHBTgH3CVsJJwjtQjRazxP0%3D",
    //     title: "Mehendi Design 1",
    //     description: "Beautiful Mehendi Design 1",
    //     altText: "Mehendi Design 1",
    //   },
    // ];

    // if (
    //   items &&
    //   (items[0]?.bgColor === undefined || items[0]?.bgColor === null)
    // ) {
    //   const calculateAverageColor = async () => {
    //     try {
    //       const itemsWithBGColorPromises = items.map(async (item) => {
    //         const response = await axios.post(
    //           `/image-bg-color`,
    //           {
    //             imageUrl: `${item.imageUrl}`,
    //           }
    //         );

    //         const { averageColor } = await response.data;

    //         return { ...item, bgColor: `rgba(${averageColor}, 0.8)` };
    //       });

    //       const itemsWithColors = await Promise.all(itemsWithBGColorPromises);

    //       return itemsWithColors;
    //     } catch (error) {
    //       console.error("Error fetching average color:", error);
    //       return [];
    //     }
    //     // dispatch(updateBanner(itemsWithColors));
    //   };

    //   return calculateAverageColor();
    // }
    // return [];
  } catch (error) {
    console.log("Error fetching banners:", error);
    // Handle error appropriately, e.g., return an empty array or a default value
    return [];
  }
};

async function TopSlider() {
  const bannerList = await getBanners();
  console.log("banner list", bannerList);

  // const [bannerItems, setBannerItems] = useState(items);

  // const navigator = useRouter();

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

  if (!bannerList?.length) return null;

  return (
    <>
      <div className="flex justify-between gap-[6%] mt-[4px] lg:mt-10">
        {/* <div className="hidden flex-col items-center justify-center xl:flex gap-[30px] justify-start items-center w-[400px]">
        {categoryLinks.map((item) => (
          <CategoryLink {...item} />
        ))}
      </div> */}

        <div
          className={`lg:p-0 h-fit rounded-md border-0 outline-0 border-none outline-none focus:border-none focus:outline-none peer-focus-visible:border-none peer-focus-visible:outline-none mt-[3%] lg:mt-0 w-[100%] xl:w-[100%] container mx-auto`}>
          <Carousel items={bannerList || []} />
        </div>
      </div>

      {/* <div className="w-full h-[1px] bg-black opacity-[0.1] mt-0"></div> */}
    </>
  );
}

// xl:w-[80%]

export default TopSlider;
