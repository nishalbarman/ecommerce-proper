"use client";

import React from "react";
import { FaStar } from "react-icons/fa";

function RateStar({ stars = 0, size = 16 }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`max-sm:w-3 max-sm:h-3 w-4 h-4 ${i < Math.round(stars) ? "text-yellow-400" : "text-gray-300"}`}
          // style={{
          //   width: size,
          //   height: size,
          // }}
          // color={`${i < Math.round(stars) ? "#DA4445" : "gray"}`}
          // fill={`${i < Math.round(stars) ? "#DA4445" : "gray"}`}
        />
      ))}
    </div>
  );
}

export default RateStar;
