import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileLibraryListItem } from "react-media-library";
import AssetPicker from "../../components/AssetPicker/AssetPicker";
import { useAppSelector } from "../../redux/index";
import { DynamicPage } from "../../types";
import cAxios from "../../axios/cutom-axios";
import no_image from "../../assets/no-image.svg";
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaChevronUp } from "react-icons/fa";
import CustomCKE from "../CustomCKE/CustomCKE";

const DynamicPageAdd = () => {
  const [dynamicPageData, setDynamicPageData] = useState<DynamicPage>({
    title: "",
    description: "",
    shortDescription: "",
    avatar: "",
    cover: "",
    slug: "",
  });

  console.log(dynamicPageData);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { jwtToken } = useAppSelector((state) => state.auth);

  const [dynamicPageList, setDynamicPageList] = useState<DynamicPage[]>([]);
  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [isDynamicPagesLoading, setIsDynamicPagesLoading] = useState(true);

  const [deleteDynamicPageId, setDeleteDynamicPageId] = useState<string | null>(
    null
  );
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const [updateDynamicPageId, setUpdateDynamicPageId] = useState<
    string | undefined
  >(undefined);

  // Fetch dynamic pages
  const getDynamicPages = async (page = 1, limit = 10) => {
    try {
      setIsDynamicPagesLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/dynamic-pages?page=${page}&limit=${limit}`
      );
      setDynamicPageList(response.data?.dynamicPages);
      setTotalPages(response.data?.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsDynamicPagesLoading(false);
    }
  };

  useEffect(() => {
    getDynamicPages(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  // Validate form fields
  useEffect(() => {
    const isEverythingOk =
      !!dynamicPageData?.title &&
      dynamicPageData.title.length >= 3 &&
      !!dynamicPageData?.shortDescription &&
      dynamicPageData.shortDescription.length >= 10 &&
      !!dynamicPageData?.slug &&
      dynamicPageData.slug.length >= 3 &&
      !!dynamicPageData?.description &&
      dynamicPageData.description.length >= 10 &&
      !!dynamicPageData?.avatar &&
      !!dynamicPageData?.cover;
    setIsSubmitDisabled(!isEverythingOk);
  }, [dynamicPageData]);

  // Handle form submission (add or update)
  const handleDynamicPageSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    try {
      setIsFormSubmitting(true);

      if (updateDynamicPageId) {
        // Update existing dynamic page
        const response = await cAxios.patch(
          `${process.env.VITE_APP_API_URL}/dynamic-pages/${updateDynamicPageId}`,
          { dynamicPageData }
        );
        toast.success(response?.data?.message);
      } else {
        // Add new dynamic page
        const response = await cAxios.post(
          `${process.env.VITE_APP_API_URL}/dynamic-pages`,
          { dynamicPageData }
        );
        toast.success(response?.data?.message);
      }

      //   // Reset form after successful submission
      //   setDynamicPageData({
      //     title: "",
      //     description: "",
      //     shortDescription: "",
      //     avatar: "",
      //     cover: "",
      //     slug: "",
      //   });
      //   setUpdateDynamicPageId(undefined);
      getDynamicPages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle delete dynamic page
  const handleDeleteDynamicPage = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/dynamic-pages/${deleteDynamicPageId}`
      );
      toast.success(response?.data?.message);
      setDeleteDynamicPageId(null);
      getDynamicPages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dynamic Pages</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)} // Toggle form collapse
            >
              <h2 className="text-lg font-semibold mb-2">
                {!updateDynamicPageId
                  ? "Add Dynamic Page"
                  : "Update Dynamic Page"}
              </h2>
              <span>
                {isFormCollapsed ? <FaChevronDown /> : <FaChevronUp />}{" "}
                {/* Toggle icon */}
              </span>
            </div>

            {/* Collapsible Form */}
            {!isFormCollapsed && (
              <form onSubmit={handleDynamicPageSubmit} className="mt-4">
                <div className="flex justify-between w-full gap-3">
                  {/* Title */}
                  <div className="mb-4 w-1/2">
                    <label htmlFor="title" className="block font-semibold mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      placeholder="Enter Title"
                      value={dynamicPageData.title}
                      onChange={(e) =>
                        setDynamicPageData({
                          ...dynamicPageData,
                          title: e.target.value,
                        })
                      }
                      minLength={3}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Slug */}
                  <div className="mb-4 w-1/2">
                    <label htmlFor="slug" className="block font-semibold mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="slug"
                      placeholder="Enter Slug"
                      value={dynamicPageData.slug}
                      onChange={(e) =>
                        setDynamicPageData({
                          ...dynamicPageData,
                          slug: e.target.value,
                        })
                      }
                      minLength={3}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="mb-4">
                  <label
                    htmlFor="shortDescription"
                    className="block font-semibold mb-2">
                    Short Description
                  </label>
                  <CustomCKE
                    id="shortDescription"
                    content={dynamicPageData.shortDescription}
                    changeContent={(content: string) =>
                      setDynamicPageData({
                        ...dynamicPageData,
                        shortDescription: content,
                      })
                    }
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block font-semibold mb-2">
                    Description
                  </label>
                  <CustomCKE
                    id="description"
                    content={dynamicPageData.description}
                    changeContent={(content: string) =>
                      setDynamicPageData({
                        ...dynamicPageData,
                        description: content,
                      })
                    }
                  />
                </div>

                <div className="flex w-full gap-10">
                  {/* Avatar */}
                  <div className="mb-4 w-1/6">
                    <label
                      htmlFor="avatar"
                      className="block font-semibold mb-2">
                      Avatar
                    </label>
                    <AssetPicker
                      htmlFor="avatar"
                      fileSelectCallback={(
                        imageItems: Array<FileLibraryListItem>
                      ) => {
                        setDynamicPageData({
                          ...dynamicPageData,
                          avatar: imageItems[0].imageLink,
                        });
                      }}
                      multiSelect={false}
                    />
                    <div className="w-full h-[300px] flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                      {dynamicPageData.avatar ? (
                        <img
                          className="w-full h-full aspect-square object-contain"
                          src={dynamicPageData.avatar}
                        />
                      ) : (
                        <img
                          className="w-full h-[200px] aspect-square object-contain"
                          src={no_image}
                        />
                      )}
                    </div>
                  </div>

                  {/* Cover */}
                  <div className="mb-4 w-1/2">
                    <label htmlFor="cover" className="block font-semibold mb-2">
                      Cover
                    </label>
                    <AssetPicker
                      htmlFor="cover"
                      fileSelectCallback={(
                        imageItems: Array<FileLibraryListItem>
                      ) => {
                        setDynamicPageData({
                          ...dynamicPageData,
                          cover: imageItems[0].imageLink,
                        });
                      }}
                      multiSelect={false}
                    />
                    <div className="w-full h-[300px] flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                      {dynamicPageData.cover ? (
                        <img
                          className="w-full h-full aspect-square object-contain"
                          src={dynamicPageData.cover}
                        />
                      ) : (
                        <img
                          className="w-full h-[200px] aspect-square object-contain"
                          src={no_image}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-start mt-6 gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitDisabled || isFormSubmitting}
                    className={`px-4 py-2 rounded-md text-white ${
                      isSubmitDisabled || isFormSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}>
                    {updateDynamicPageId ? "Update" : "Submit"}
                  </button>

                  <button
                    onClick={() => {
                      setDynamicPageData({
                        title: "",
                        description: "",
                        shortDescription: "",
                        avatar: "",
                        cover: "",
                        slug: "",
                      });
                      setUpdateDynamicPageId(undefined);
                    }}
                    type="button"
                    className={`px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600`}>
                    Clear
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Dynamic Pages</h2>
            {isDynamicPagesLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL.
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dynamicPageList?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setDynamicPageData({
                                  title: item.title,
                                  description: item.description,
                                  shortDescription: item.shortDescription,
                                  avatar: item.avatar,
                                  cover: item.cover,
                                  slug: item.slug,
                                });
                                setUpdateDynamicPageId(item._id);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteDynamicPageId(item._id as string);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex max-md:flex-col gap-3 justify-between items-center mt-5 border-t-2 pt-4">
                  <span>
                    Page {paginationPage} of {totalPages}
                  </span>
                  <div className="flex items-center justify-between min-md:justify-center max-md:w-full gap-2">
                    <button
                      onClick={() =>
                        setPaginationPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={paginationPage === 1}
                      className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() =>
                        setPaginationPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={paginationPage === totalPages}
                      className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDynamicPageId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this page will remove it from the database.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteDynamicPageId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteDynamicPage}
                className={`bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded ${
                  deleteButtonLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                {deleteButtonLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPageAdd;
