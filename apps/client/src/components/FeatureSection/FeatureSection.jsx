import React from "react";
import FeaturesSlider from "./FeaturesSlider/FeaturesSlider";
import TitleWithBar from "../TitleWithBar/TitleWithBar";
import { cookies } from "next/headers";

// Fetch data on the server
const fetchFeatures = async (page, limit) => {
  try {
    // await new Promise((res) => {
    //   setTimeout(() => {
    //     res(true);
    //   }, 10000);
    // });

    const cookieStore = await cookies();
    const response = await fetch(`/features?page=${page}&limit=${limit}`, {
      headers: {
        Cookie: cookieStore,
      },
    });
    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error("Error fetching features:", error);
    return null;
  }
};

const Features = async () => {
  // Fetch the features data
  const features = await fetchFeatures(1, 4);

  console.log("Features", features);

  // If data is not available, show the skeleton loader
  if (!features) {
    return null;
  }

  return (
    <div className="container mx-auto w-full h-fit max-md:px-2">
      <TitleWithBar title={"Features"} />
      <div className="w-full flex justify-between items-center mb-12 max-[597px]:mb-6 max-sm:zoom-0_1">
        <span className="text-2xl xl:text-3xl font-bold max-[597px]:text-[20px] text-nowrap">
          Why to Order from Us
        </span>
      </div>
      {/* <CategorySlider items={categories || []} /> */}
      <div className="mx-auto">
        {/* max-w-7xl  */}
        <FeaturesSlider features={features || []} />
      </div>
    </div>
  );
};

export default Features;
