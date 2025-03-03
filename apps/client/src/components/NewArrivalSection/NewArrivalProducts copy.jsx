import Link from "next/link";
import React from "react";

function NewArrivalProducts({ newArrivalData }) {
  if (!newArrivalData || newArrivalData.length <= 0) {
    return null;
  }

  return (
    <div className="grid  grid-rows-2 grid-col-8 grid-flow-row gap-2 grid-cols-4 h-[600px] text-white">
      <div className="relative rounded-lg row-start-1 row-end-3 max-xl:row-end-2 col-start-1 col-end-3 bg-black shadow-lg border border-gray-400">
        <div className="flex justify-center items-center h-full p-[10px] ">
          <img
            className="w-[400px] h-[400px]"
            src={newArrivalData[0]?.imageUrl}
          />
        </div>
        <div className="absolute bottom-0 m-5">
          <p className="text-xl font-semibold font-andika text-white">
            {newArrivalData[0]?.title}
          </p>
          <p className="mt-2 mb-2 text-gray-800 font-andika text-white">
            {newArrivalData[0]?.shortDescription}
          </p>
          <Link
            className="text-md underline underline-offset-2 font-andika text-white"
            href="">
            Shop Now
          </Link>
        </div>
      </div>
      <div className="relative rounded-lg row-start-1 row-end-2 col-start-3 col-end-5 bg-black shadow-lg border border-gray-400">
        <div className="flex justify-end items-center h-full p-[10px] w-full px-10">
          <img
            className="w-[250px] aspect-[1/1]"
            src={newArrivalData[1]?.imageUrl}
          />
        </div>
        <div className="absolute bottom-0 m-5">
          <p className="text-xl font-semibold font-andika text-white">
            {newArrivalData[1]?.title}
          </p>
          <p className="mt-2 mb-2 text-gray-800 font-andika text-white">
            {newArrivalData[1]?.shortDescription}
          </p>
          <Link
            className=" text-md underline underline-offset-2 font-andika text-white"
            href="">
            Shop Now
          </Link>
        </div>
      </div>
      <div className="relative rounded-lg row-start-2 col-start-3 max-xl:col-start-1 max-xl:col-end-3 bg-black shadow-lg border border-gray-400 text-white">
        <div className="flex justify-center items-center h-full p-[10px]">
          <img
            className="w-[200px] aspect-[1/1]"
            src={newArrivalData[2]?.imageUrl}
          />
        </div>
        <div className="absolute bottom-0 m-5">
          <p className="text-xl font-semibold font-andika  text-white">
            {newArrivalData[2]?.title}
          </p>
          <p className="mt-2 mb-2 text-gray-800 font-andika  text-white">
            {newArrivalData[2]?.shortDescription}
          </p>
          <Link
            className=" text-md underline underline-offset-2 font-andika text-white"
            href="">
            Shop Now
          </Link>
        </div>
      </div>
      <div className="relative rounded-lg row-start-2 col-start-4 max-xl:col-start-3 max-xl:col-end-5 bg-black shadow-lg border border-gray-400">
        <div className="flex justify-center items-center h-full p-[10px]">
          <img
            className="w-[200px] aspect-[1/1]"
            src={newArrivalData[3]?.imageUrl}
          />
        </div>
        <div className="absolute bottom-0 m-5">
          <p className="text-xl font-semibold font-andika text-white">
            {newArrivalData[3]?.title}
          </p>
          <p className="mt-2 mb-2 text-gray-800 font-andika text-white">
            {newArrivalData[3]?.shortDescription}
          </p>
          <Link
            className=" text-md underline underline-offset-2 font-andika text-white"
            href="">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NewArrivalProducts;
