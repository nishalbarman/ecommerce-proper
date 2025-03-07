import React from "react";
import Image from "next/image";

function TitleWithBar({ title }) {
  return (
    <div className="w-full flex gap-2 items-center mb-3 max-[597px]:mb-[13px] max-sm:zoom-0_1">
      {/* mb-7 */}
      <Image
        className="max-[597px]:w-3 h-[23px] "
        src="/assets/red_bar.svg"
        height={23}
        width={13}
        alt="red bar"
      />
      <span className="text-[18px] text-[#DB4444] font-semibold max-[597px]:text-[18px]">
        {title}
      </span>
    </div>
  );
}

export default TitleWithBar;
