import React from "react";
import Image from "next/image";

const NeutralCard = ({
  _id: categoryId,
  categoryImageUrl,
  categoryName,
  categoryKey,
}) => {
  return (
    <div className="relative w-auto h-60 rounded-lg shadow-md overflow-hidden p-5 bg-[#8CD29A]">
      {/* Diagonal split background */}
      <div className="absolute inset-0 flex">
        {/* Light green half (top-left to bottom-right) */}
        <div className="w-full h-full bg-[#87CF9B] clip-path-diagonal-left"></div>
        {/* Dark green half (top-right to bottom-left) */}
        <div className="w-full h-full bg-[#87CF9B] clip-path-diagonal-right"></div>
      </div>

      {/* Semi-transparent border */}
      <div className="absolute inset-2 border-2 border-white/30 rounded-md"></div>

      <div className="flex flex-col items-center -mt-2 justify-center h-full p-5 border-1 border-black">
        {/* Icon */}
        {categoryImageUrl && (
          <Image
            src={`${categoryImageUrl}`}
            alt={categoryName}
            width={90}
            height={90}
            className="relative inset-0 mb-2 object-cover select-none"
            draggable={false}
          />
        )}

        {/* Text */}
        <div className="relative inset-0 text-xl font-bold text-white text-center">
          {categoryName}
        </div>
      </div>
    </div>
  );
};

export default NeutralCard;
