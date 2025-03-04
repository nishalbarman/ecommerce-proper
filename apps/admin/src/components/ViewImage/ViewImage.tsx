function ViewImage({
  imageUrl,
  clearItem,
}: {
  imageUrl: string;
  clearItem: () => void;
}) {
  if (!imageUrl) return null;

  return (
    <>
      {
        <div className="fixed inset-0 z-50 w-full h-full flex justify-center overflow-x-hidden overflow-y-hidden outline-none focus:outline-none md:p-10">
          <div className="fixed bg-black inset-0 opacity-50"></div>
          <div className="border border-gray-200 shadow-lg relative flex flex-col max-xl:w-full w-1/2 bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-between px-3 p-2 border-b border-solid border-gray-300 rounded-t w-full">
              <h3 className="text-lg font-semibold">View Image</h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-gray-700 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => {
                  clearItem();
                }}>
                <span className="text-4xl">×</span>
              </button>
            </div>
            <div className="relative md:p-6 flex-auto overflow-auto flex items-center justify-center w-full bg-gray-100">
              <img
                src={imageUrl}
                className="h-full bg-white w-full object-contain select-none rounded border border-black-200"
              />
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default ViewImage;
