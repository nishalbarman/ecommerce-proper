import React from "react";
import Image from "next/image";

const NeutralCard = ({ title, icon }) => {
  return (
    <div className="relative w-auto h-60 rounded-lg shadow-md overflow-hidden p-5">
      {/* Diagonal split background */}
      <div className="absolute inset-0 flex">
        {/* Light green half (top-left to bottom-right) */}
        <div className="w-full h-full bg-[#90BD78] clip-path-diagonal-left"></div>
        {/* Dark green half (top-right to bottom-left) */}
        <div className="w-full h-full bg-[#9AC386] clip-path-diagonal-right"></div>
      </div>

      {/* Semi-transparent border */}
      <div className="absolute inset-2 border-2 border-white/30 rounded-md"></div>

      <div className="flex flex-col items-center justify-center h-full p-5 border-1 border-black">
        {/* Icon */}
        {icon?.url && (
          <Image
            src={`http://localhost:1337${icon.url}`}
            alt={icon.caption || "Feature Icon"}
            width={40}
            height={40}
            className="relative inset-0 mb-5 object-scale-down"
          />
        )}

        {/* Text */}
        <div className="relative inset-0 text-xl font-bold text-white text-center">
          {title}
        </div>
      </div>
    </div>
  );
};

export default NeutralCard;