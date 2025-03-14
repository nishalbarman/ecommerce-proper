import { FaRocket } from "react-icons/fa";

// components/SpaceshipLoading.js
const SpaceshipLoading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white overflow-hidden">
      {/* Redirecting Text */}

      <div className="self-center w-20 animate-speeder">
        <FaRocket
          color="#DB4444"
          fill="#DB4444"
          colorRendering={"#DB4444"}
          size={50}
          className="rotate-[45deg]"
        />
      </div>

      {/* Spaceship Body */}
      <div className="relative flex justify-center items-center w-20 h-20">
        {/* Laser Beams */}

        <h1 className="text-sm font-sans font-semibold uppercase animate-speeder_slow whitespace-nowrap">
          Getting The Data
        </h1>

        <div className="absolute w-full h-full">
          <span className="absolute w-1/5 h-[2px] bg-black top-[20%] animate-lf"></span>
          <span className="absolute w-1/5 h-[2px] bg-black top-[40%] animate-lf2"></span>
          <span className="absolute w-1/5 h-[2px] bg-black top-[60%] animate-lf3"></span>
          <span className="absolute w-1/5 h-[2px] bg-black top-[80%] animate-lf4"></span>
        </div>
      </div>
    </div>
  );
};

export default SpaceshipLoading;
