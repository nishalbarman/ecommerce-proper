import { useCallback } from "react";
import {
  FileLibraryListItem,
  FileLibrarySelectedItems,
  ReactMediaLibrary,
} from "react-media-library";

import convertImageToBase64 from "../../helper/convertImageToBase64";
import {
  useAddOneImageMutation,
  useGetImagesQuery,
} from "../../redux/apis/imageApi";

import "./image-asset-style.css";

type MediaLibraryProps = {
  title: string;
  fileSelectCallback: ([key]: Array<FileLibraryListItem>) => void;
  multiSelect: boolean;
  isOpen: boolean;
  setIsOpen: (key: any) => void;
};

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  title = "Asset Manager",
  fileSelectCallback,
  multiSelect = false,
  isOpen = false,
  setIsOpen,
}) => {
  // const [listOfImages, setListOfImages] = useState<FileLibraryListItem[]>([]);

  const { data: listOfImages } = useGetImagesQuery("this");
  const [addOneImage] = useAddOneImageMutation();

  const fileUploadCallback = useCallback(async (imageFile: File) => {
    const base64Image = await convertImageToBase64(imageFile);
    if (!base64Image) return false;

    try {
      const response = await addOneImage({ imageData: base64Image }).unwrap();
      if (response.status) return true;
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, []);

  return (
    <>
      <ReactMediaLibrary
        defaultSelectedItemIds={[listOfImages && listOfImages[0]?._id]}
        fileLibraryList={listOfImages}
        modalTitle={title}
        fileUploadCallback={fileUploadCallback}
        filesDeleteCallback={undefined}
        filesSelectCallback={(files) => {
          fileSelectCallback(files);
          setIsOpen((prev: boolean) => !prev);
        }}
        // finishUploadCallback={function noRefCheck() {}}
        isOpen={isOpen}
        multiSelect={multiSelect}
        onClose={() => {
          setIsOpen((prev: boolean) => !prev);
        }}
        selectedItemsComponent={() => <FileLibrarySelectedItems />}
      />
    </>
  );
};

export default MediaLibrary;
