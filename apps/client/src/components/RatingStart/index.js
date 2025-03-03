"use client";

import Image from "next/image";
import React from "react";

function RateStar({ stars = 0 }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, index) =>
        index + 1 <= stars ? (
          <Image
            key={index}
            src={"/assets/star-filled.svg"}
            width={20}
            height={20}
            alt="star icon"
          />
        ) : (
          <Image
            key={index}
            src={"/assets/star.svg"}
            width={20}
            height={20}
            alt="star icon"
          />
        )
      )}
    </div>
  );
}

export default RateStar;
