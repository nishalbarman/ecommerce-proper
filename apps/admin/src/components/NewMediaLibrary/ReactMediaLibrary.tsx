import { current } from "@reduxjs/toolkit";
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";

// Types that match your server response
export interface FileLibraryListItem {
  _id: string;
  title?: string;
  fileName: string;
  size?: number;
  imageLink: string;
  src: string;
  thumbnail?: string;
  createdAt?: string;
  deleteLink?: string;
  mimeType?: string;
}

interface ReactMediaLibraryProps {
  // Required props (matching original)
  isOpen: boolean;
  onClose: () => void;
  fileLibraryList?: FileLibraryListItem[];
  filesSelectCallback: (files: FileLibraryListItem[]) => void;

  // Optional props (matching original)
  modalTitle?: string;
  multiSelect?: boolean;
  defaultSelectedItemIds?: string[];
  fileUploadCallback?: (file: File) => Promise<boolean>;
  filesDeleteCallback?: (files: FileLibraryListItem[]) => void;
  selectedItemsComponent?: () => React.ReactNode;
  finishUploadCallback?: () => void;

  // New dynamic pagination props
  enablePagination?: boolean;
  itemsPerPage?: number;
  enableSearch?: boolean;
  allowedTypes?: string[];
  maxFileSize?: number;

  // Server-side data props
  paginatedData?: {
    items: FileLibraryListItem[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
  };
  onPageChange?: (page: number, limit: number, search?: string) => void;
  loading?: boolean;
}

const ReactMediaLibrary: React.FC<ReactMediaLibraryProps> = ({
  isOpen,
  onClose,
  fileLibraryList = [],
  filesSelectCallback,
  modalTitle = "Media Library",
  multiSelect = false,
  defaultSelectedItemIds = [],
  fileUploadCallback,
  filesDeleteCallback,
  selectedItemsComponent,
  finishUploadCallback,
  enablePagination = false,
  itemsPerPage = 20,
  enableSearch = false,
  allowedTypes = ["image/*"],
  maxFileSize = 10,
  paginatedData,
  onPageChange,
  loading = false,
}) => {
  // State management
  const [selectedItems, setSelectedItems] = useState<FileLibraryListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  // Determine data source
  const isServerPaginated = Boolean(paginatedData && onPageChange);
  const displayData = isServerPaginated
    ? paginatedData!.items
    : fileLibraryList;
  const totalPages = isServerPaginated
    ? paginatedData!.totalPages
    : Math.ceil(fileLibraryList.length / itemsPerPage);
  const totalCount = isServerPaginated
    ? paginatedData!.totalCount
    : fileLibraryList.length;

  // Initialize selected items with defaults
  useEffect(() => {
    if (defaultSelectedItemIds.length > 0) {
      const defaultSelected = displayData.filter((item) =>
        defaultSelectedItemIds.includes(item._id)
      );
      setSelectedItems(defaultSelected);
    }
  }, [defaultSelectedItemIds, displayData]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm("");
      setActiveTab("library");
    } else {
      setSelectedItems([]);
      setUploadProgress(null);
    }
  }, [isOpen]);

  // Handle page changes for server-side pagination
  useEffect(() => {
    if (isServerPaginated && onPageChange && isOpen) {
      onPageChange(currentPage, itemsPerPage, searchTerm);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    isServerPaginated,
    onPageChange,
    isOpen,
  ]);

  // Client-side filtered data for non-server pagination
  const clientFilteredData = useMemo(() => {
    if (isServerPaginated) return displayData;

    let filtered = [...fileLibraryList];

    // Apply search filter if enabled
    if (enableSearch && searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item.fileName &&
            item.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.title &&
            item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply client-side pagination
    if (enablePagination) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      filtered = filtered.slice(startIndex, endIndex);
    }

    return filtered;
  }, [
    fileLibraryList,
    searchTerm,
    currentPage,
    itemsPerPage,
    enableSearch,
    enablePagination,
    isServerPaginated,
    displayData,
  ]);

  const finalDisplayData = isServerPaginated ? displayData : clientFilteredData;

  // Handle item selection
  const handleItemSelect = useCallback(
    (item: FileLibraryListItem) => {
      setSelectedItems((prev) => {
        if (multiSelect) {
          const isSelected = prev.some((selected) => selected._id === item._id);
          if (isSelected) {
            return prev.filter((selected) => selected._id !== item._id);
          } else {
            return [...prev, item];
          }
        } else {
          return [item];
        }
      });
    },
    [multiSelect]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!fileUploadCallback) return;

      const fileArray = Array.from(files);

      for (const file of fileArray) {
        // Validate file type
        if (
          !allowedTypes.some((type) => file.type.match(type.replace("*", ".*")))
        ) {
          alert(`File type ${file.type} is not allowed`);
          continue;
        }

        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(
            `File ${file.name} is too large. Maximum size is ${maxFileSize}MB`
          );
          continue;
        }

        try {
          setUploadProgress(0);

          // Simulate upload progress
          const uploadTimer = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev === null || prev >= 90) return prev;
              return prev + 10;
            });
          }, 100);

          const success = await fileUploadCallback(file);

          clearInterval(uploadTimer);
          setUploadProgress(success ? 100 : null);

          if (success) {
            setTimeout(() => {
              setUploadProgress(null);
              finishUploadCallback?.();
            }, 1000);
          }
        } catch (error) {
          console.error("Upload failed:", error);
          setUploadProgress(null);
        }
      }
    },
    [fileUploadCallback, allowedTypes, maxFileSize, finishUploadCallback]
  );

  // Drag and drop handlers
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Handle selection confirmation
  const handleConfirmSelection = useCallback(() => {
    filesSelectCallback(selectedItems);
  }, [selectedItems, filesSelectCallback]);

  // Handle deletion
  const handleDelete = useCallback(() => {
    if (filesDeleteCallback && selectedItems.length > 0) {
      filesDeleteCallback(selectedItems);
    }
  }, [filesDeleteCallback, selectedItems]);

  // Handle search with debouncing
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle page navigation
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4 md:p-5">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            {modalTitle}
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition-all duration-200 text-2xl md:text-3xl"
            onClick={onClose}
            aria-label="Close">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            className={`px-4 md:px-6 py-3 font-medium text-sm md:text-base border-b-2 transition-all duration-200 ${
              activeTab === "library"
                ? "text-blue-600 border-blue-600 bg-white"
                : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("library")}>
            Media Library
          </button>
          {fileUploadCallback && (
            <button
              className={`px-4 md:px-6 py-3 font-medium text-sm md:text-base border-b-2 transition-all duration-200 ${
                activeTab === "upload"
                  ? "text-blue-600 border-blue-600 bg-white"
                  : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("upload")}>
              Upload Files
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "library" && (
            <>
              {/* Search */}
              {enableSearch && (
                <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm md:text-base"
                    required={false}
                  />
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading media...</p>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              {!loading && (
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {finalDisplayData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                      {finalDisplayData.map((item) => {
                        const isSelected = selectedItems.some(
                          (selected) => selected._id === item._id
                        );

                        return (
                          <div
                            key={item._id}
                            className={`relative aspect-square rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg border-2 overflow-hidden ${
                              isSelected
                                ? "border-blue-500 shadow-lg shadow-blue-500/25"
                                : "border-transparent hover:border-blue-300"
                            }`}
                            onClick={() => handleItemSelect(item)}>
                            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={
                                  item.thumbnail || item.imageLink || item.src
                                }
                                alt={item.title || item.fileName}
                                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                                }}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-600 bg-opacity-80 flex items-center justify-center">
                                  <div className="bg-white rounded-full p-2">
                                    <svg
                                      className="w-6 h-6 text-blue-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <div className="text-white text-xs font-medium truncate">
                                {item.title || item.fileName}
                              </div>
                              {item.size && (
                                <div className="text-white/70 text-xs">
                                  {formatFileSize(item.size)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📁</div>
                        <p className="text-gray-600 text-lg">
                          No media files found
                        </p>
                        {enableSearch && searchTerm && (
                          <button
                            onClick={() => handleSearch("")}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            Clear Search
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {enablePagination && totalPages > 1 && !loading && (
                <div className="flex items-center justify-between p-4 md:p-6 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}{" "}
                    to {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                    {totalCount} results
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              type="button"
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-100"
                              }`}>
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!(currentPage >= totalPages)) {
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          );
                        }
                      }}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "upload" && (
            <div
              className={`flex-1 m-4 md:m-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 relative ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}>
              <div className="p-8 space-y-4">
                <div className="text-6xl opacity-60">📁</div>
                <div>
                  <p className="text-lg text-gray-700 mb-2">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Allowed: {allowedTypes.join(", ")} | Max size: {maxFileSize}
                    MB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept={allowedTypes.join(",")}
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files)
                  }
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer font-medium">
                  Select Files
                </label>
              </div>

              {uploadProgress !== null && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm font-medium text-gray-600">
                  {selectedItems.length} item
                  {selectedItems.length !== 1 ? "s" : ""} selected
                </span>
                {selectedItemsComponent && selectedItemsComponent()}
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {selectedItems.length > 0 && filesDeleteCallback && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm">
                Delete Selected
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm">
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm">
              Select
              {selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ReactMediaLibrary);

// Component that matches the exact same interface as react-media-library's FileLibrarySelectedItems
export const FileLibrarySelectedItems: React.FC = memo(() => {
  return <div className="w-2 h-2 bg-blue-600 rounded-full"></div>;
});
