import { useState } from "react";

import MediaLibrary from "../MediaLibrary/MediaLibrary";
import { FileLibraryListItem } from "react-media-library";

type ImageManagementProps = {
  iconClassX?: string;
  classX?: string;
  htmlFor?: string;
  // inputId: string;
  // imageRequired: boolean;
  fileSelectCallback: ([key]: Array<FileLibraryListItem>) => void;
  multiSelect?: boolean;
};

const ImageManagement: React.FC<ImageManagementProps> = ({
  // htmlFor,
  // inputId,
  // imageRequired,
  iconClassX = "",
  classX = "",
  fileSelectCallback,
  multiSelect = false,
  // isOpen,
  // setIsOpen,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => {
          setIsOpen(true);
        }}
        // htmlFor={`${htmlFor}`}
        className={`cursor-pointer bg-white p-4 rounded-md border-2 border-solid border-red-600 mt-1 w-full zoom-normal w-full ${classX}`}>
        <div className="flex flex-row items-center justify-center gap-3 h-full w-full">
          <svg
            viewBox="0 0 640 512"
            className={`${iconClassX ? iconClassX : "h-5"} fill-red-600`}>
            <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
          </svg>
          {/* <p>Drag and Drop</p>
          <p>or</p> */}
          {/* <span className="bg-gray-600 text-white py-1 px-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
            Browse file
          </span> */}
        </div>
      </div>

      <MediaLibrary
        title="Asset Manager"
        fileSelectCallback={fileSelectCallback}
        multiSelect={multiSelect}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default ImageManagement;
