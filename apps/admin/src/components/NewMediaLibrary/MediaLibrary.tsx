import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import ReactMediaLibrary, {
  FileLibrarySelectedItems,
} from "./ReactMediaLibrary";
import {
  useGetPaginatedImagesQuery,
  useAddOneImageMutation,
  FileLibraryListItem,
} from "../../redux/apis/imageApi";
import convertImageToBase64 from "../../helper/convertImageToBase64";

// Export the types for compatibility
export { FileLibrarySelectedItems };
export type { FileLibraryListItem };

// Your exact MediaLibrary component interface with enhanced pagination
type MediaLibraryProps = {
  title: string;
  fileSelectCallback: (files: FileLibraryListItem[]) => void;
  multiSelect: boolean;
  isOpen: boolean;
  setIsOpen: (key: any) => void;

  // Enhanced pagination props (all optional for backward compatibility)
  enablePagination?: boolean;
  itemsPerPage?: number;
  enableSearch?: boolean;
};

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  title = "Asset Manager",
  fileSelectCallback,
  multiSelect = false,
  isOpen = false,
  setIsOpen,
  enablePagination = true, // Enable by default for better experience
  itemsPerPage = 18,
  enableSearch = true, // Enable by default
}) => {
  // State for server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageLimit, setPageLimit] = useState(itemsPerPage);

  // Use the new paginated query hook
  const {
    data: paginatedResponse,
    isLoading,
    refetch,
  } = useGetPaginatedImagesQuery(
    {
      page: currentPage,
      limit: pageLimit,
      search: searchTerm,
    },
    {
      skip: !isOpen, // Only fetch when modal is open
    }
  );

  console.log("paginatedResponse", paginatedResponse);

  const [addOneImage] = useAddOneImageMutation();

  const handlePageChangeFetchDebouncingID = useRef<any>(null);

  // Handle server-side pagination
  const handlePageChange = useCallback(
    (page: number, limit: number, search?: string) => {
      if (handlePageChangeFetchDebouncingID?.current) {
        clearTimeout(handlePageChangeFetchDebouncingID?.current);
      }

      handlePageChangeFetchDebouncingID.current = setTimeout(() => {
        setCurrentPage(page);
        setPageLimit(limit);
        if (search !== undefined) {
          setSearchTerm(search);
          // setCurrentPage(1); // Reset to first page when searching
        }
      }, 500);

      return () => {
        if (handlePageChangeFetchDebouncingID?.current) {
          clearTimeout(handlePageChangeFetchDebouncingID.current);
          handlePageChangeFetchDebouncingID.current = null;
        }
      };
    },
    []
  );

  // File upload callback with optimistic updates
  const fileUploadCallback = useCallback(
    async (imageFile: File): Promise<boolean> => {
      const base64Image = await convertImageToBase64(imageFile);
      if (!base64Image) return false;

      try {
        const response = await addOneImage({ imageData: base64Image }).unwrap();
        if (response.status) {
          // Refresh the current page data after successful upload
          refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Upload failed:", error);
        return false;
      }
    },
    [addOneImage, refetch]
  );

  // Enhanced file delete callback
  const filesDeleteCallback = useCallback(
    (files: FileLibraryListItem[]) => {
      files.forEach((file) => {
        console.log("Deleting file:", file);
        if (file?.deleteLink) {
          window.open(file.deleteLink, "_blank");
        }
      });

      // Refresh data after deletion
      setTimeout(() => {
        refetch();
      }, 1000); // Small delay to allow server processing

      setIsOpen((prev: boolean) => !prev);
    },
    [refetch, setIsOpen]
  );

  // Enhanced file select callback
  const enhancedFileSelectCallback = useCallback(
    (files: FileLibraryListItem[]) => {
      fileSelectCallback(files);
      setIsOpen((prev: boolean) => !prev);
    },
    [fileSelectCallback, setIsOpen]
  );

  // Reset pagination when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm("");
    }
  }, [isOpen]);

  const [paginatedData, setPaginatedData] = useState<any>(undefined);

  useEffect(() => {
    setPaginatedData(
      paginatedResponse
        ? {
            items: paginatedResponse.items,
            totalPages: paginatedResponse.totalPages,
            totalCount: paginatedResponse.totalCount,
            currentPage: currentPage,
          }
        : undefined
    );
  }, [paginatedResponse]);

  return (
    <ReactMediaLibrary
      // Original props (exact same interface)
      isOpen={isOpen}
      onClose={() => setIsOpen((prev: boolean) => false)}
      modalTitle={title}
      multiSelect={multiSelect}
      filesSelectCallback={enhancedFileSelectCallback}
      fileUploadCallback={fileUploadCallback}
      filesDeleteCallback={filesDeleteCallback}
      selectedItemsComponent={() => <FileLibrarySelectedItems />}
      // Enhanced features
      enablePagination={enablePagination}
      itemsPerPage={pageLimit}
      enableSearch={enableSearch}
      loading={isLoading}
      // Server-side pagination data
      paginatedData={paginatedData}
      onPageChange={handlePageChange}
    />
  );
};

export default memo(MediaLibrary);
