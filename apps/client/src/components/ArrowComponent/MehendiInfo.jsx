import React from "react";

const MehendiInfo = () => {
  return (
    <div className="relative w-[500px] mx-auto">
      {/* Mehendi Image */}
      <img
        src="https://i.ibb.co/rf59HXKs/3e46f922794d.png"
        alt="Mehendi Product"
        className="w-full rounded-lg shadow-md"
      />

      {/* Label 1 - Top Left */}
      <div className="absolute top-5 left-2 flex items-center bg-orange-100 text-sm font-semibold px-2 py-1 rounded shadow">
        <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-orange-500 mr-2"></div>
        <span>Natural Ingredients</span>
      </div>

      {/* Label 2 - Bottom Left */}
      <div className="absolute bottom-10 left-4 flex items-center bg-green-100 text-sm font-semibold px-2 py-1 rounded shadow">
        <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-green-500 mr-2"></div>
        <span>Long-lasting Color</span>
      </div>

      {/* Label 3 - Top Right */}
      <div className="absolute top-10 right-2 flex items-center bg-red-100 text-sm font-semibold px-2 py-1 rounded shadow">
        <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-red-500 mr-2"></div>
        <span>No Chemicals</span>
      </div>
    </div>
  );
};

export default MehendiInfo;
