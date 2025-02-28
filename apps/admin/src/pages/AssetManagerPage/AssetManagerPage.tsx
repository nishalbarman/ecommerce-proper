import { useState } from "react";

import MediaLibrary from "../../components/MediaLibrary/MediaLibrary";

const ImageManagement: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Asset Manager
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="mt-1 flex items-center justify-center w-fit h-fit w-full">
            <div
              onClick={() => {
                setIsOpen(true);
              }}
              className="cursor-pointer bg-white p-8 rounded-md border-2 border-dashed border-gray-600 shadow-md mt-1 w-full">
              <div className="flex flex-col items-center justify-start gap-3 w-full">
                <svg viewBox="0 0 640 512" className="h-12 fill-gray-600">
                  <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                </svg>
                {/* <p>Drag and Drop</p>
                                                <p>or</p> */}
                <span className="bg-gray-600 text-white py-1 px-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
                  View All Images
                </span>
              </div>
            </div>
          </div>

          <MediaLibrary
            title="Asset Manager"
            fileSelectCallback={() => {}}
            multiSelect={false}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>
    </>
  );
};

export default ImageManagement;
