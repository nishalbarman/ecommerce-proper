import React from "react";
import Image from "next/image";

function TitleWithBar({ title }) {
  return (
    <div className="w-full flex max-md:gap-1 gap-2 items-center mb-3 max-[597px]:mb-[13px]">
      {/* mb-7 */}
      {/* <Image
        className="max-[597px]:w-3 h-[23px] "
        src="/assets/red_bar.svg"
        height={23}
        width={13}
        alt="red bar"
      /> */}
      <div className="max-md:w-2 max-md:h-5 w-3 h-6 rounded-sm bg-[#DA4544]"></div>
      <span className="text-[18px] max-sm:text-sm text-[#DB4444] font-semibold max-sm:text-xs">
        {title}
      </span>
    </div>
  );
}

export default TitleWithBar;
