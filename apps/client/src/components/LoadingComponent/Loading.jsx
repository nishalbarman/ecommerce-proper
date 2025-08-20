import LoadingAnimation from "../LoadingScreen/LoadingScreen";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-110px)] bg-transparent w-full overflow-hidden">
      {/* <img
        draggable={false}
        className="mx-auto mix-blend-multiply select-none user-drag-none w-20 mb-2 animate-pulse drop-shadow-lg"
        src="https://i.ibb.co/Q3FPrQQm/64c844d378e5.png"
        alt="heart-mehendi"
      />
      <p className="">Loading ...</p> */}
      <LoadingAnimation />
    </div>
  );
};

export default Loading;
