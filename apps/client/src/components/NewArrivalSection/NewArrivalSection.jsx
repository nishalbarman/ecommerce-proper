import React from "react";
import TitleWithBar from "../TitleWithBar/TitleWithBar";
import NewArrivalProducts from "./NewArrivalProducts";
import { fetchNewArrivals } from "@/lib/newArrival";
import { cookies } from "next/headers";

async function NewArrivalSection() {
  const cookieStore = await cookies();

  const newArrivalData = await fetchNewArrivals({
    page: 1,
    limit: 4,
    cookies: cookieStore,
  });

  console.log("newArrivalData Data", newArrivalData);
  return (
    <div className="container mx-auto w-full h-fit mt-10 lg:mt-[3rem]">
      <TitleWithBar title={"Featured"} />
      <div className="w-full flex justify-between items-center mb-10 max-[597px]:mb-6">
        <span className="text-2xl xl:text-3xl font-bold max-[597px]:text-[20px]">
          New Arrival
        </span>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newArrivalData.newArrivals.slice(0, 4).map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-4">{item.shortDescription}</p>
              <p className="text-sm text-gray-500">
                Product ID: {item.productId}
              </p>
            </div>
          </div>
        ))}
      </div> */}

      <NewArrivalProducts newArrivalData={newArrivalData.newArrivals || []} />
    </div>
  );
}

export default NewArrivalSection;
