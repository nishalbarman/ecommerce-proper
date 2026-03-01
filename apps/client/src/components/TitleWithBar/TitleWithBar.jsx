import React from "react";
import Image from "next/image";

function TitleWithBar({ title }) {
  return (
    <div className="w-full flex max-md:gap-1 gap-2 items-center max-sm:mb-1 max-md:mb-2 mb-2">
      {/* mb-7 */}
      {/* <Image
        className="max-[597px]:w-3 h-[23px] "
        src="/assets/red_bar.svg"
        height={23}
        width={13}
        alt="red bar"
      /> */}
      <div className="max-md:w-2 max-md:h-5 w-3 h-6 rounded-sm bg-[#DA4544]"></div>
      <span className="max-sm:text-sm text-md text-[#DB4444] font-semibold">
        {title}
      </span>
    </div>
  );
}

export default TitleWithBar;
