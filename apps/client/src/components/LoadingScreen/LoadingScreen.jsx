"use client";

import { FaRocket } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useRef } from "react";
import axios from "axios";

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] bg-transparent w-full overflow-hidden">
      <div className="self-center w-[800px]">
        <DotLottieReact
          src="/assets/lottie/hand_loading_red.lottie"
          loop={true}
          autoplay={true}
          // mode="reverse"
          backgroundColor={"transparent"}
          renderConfig={{ autoResize: true }}
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;
