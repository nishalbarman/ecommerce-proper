import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileLibraryListItem } from "react-media-library";

import AssetPicker from "../AssetPicker/AssetPicker";

import { useAppSelector } from "../../redux/index";

import { Banner } from "../../types";

import cAxios from "../../axios/cutom-axios";

import no_image from "../../assets/no-image.svg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ViewImage from "../ViewImage/ViewImage";
import { MdDeleteOutline } from "react-icons/md";

const BannerList = () => {
  const [bannerData, setBannerData] = useState<Banner>({
    title: "",
    imageUrl: "",
    redirectUrl: "",
    description: "",
  });

  //   const categoryImageRef = useRef(null);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  console.log(bannerData);

  useEffect(() => {
    let isEverythingOk =
      !!bannerData?.title &&
      bannerData.title.length >= 3 &&
      bannerData.imageUrl !== null &&
      bannerData.imageUrl !== "" &&
      bannerData.description !== null &&
      bannerData.description !== "";
    setIsSubmitDisabled(!isEverythingOk);
  }, [bannerData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const { jwtToken } = useAppSelector((state) => state.auth);

  const [bannerList, setBannerList] = useState<Banner[]>([]);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  const [isBannersLoading, setIsBannersLoading] = useState(true);

  const getBanners = async (page = 1, limit = 10) => {
    try {
      setIsBannersLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/banners?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setBannerList(response.data?.banners);
      setTotalPages(response.data?.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsBannersLoading(false);
    }
  };

  useEffect(() => {
    getBanners(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteCategory = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/banners/${deleteCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log(response);
      toast.success("Banner deleted");
      setDeleteCategoryId(null);
      getBanners();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const handleAddBanner = async () => {
    try {
      setIsFormSubmitting(true);

      const response = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/banners`,
        {
          categoryData: bannerData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setBannerData({
        title: "",
        redirectUrl: "",
        imageUrl: "",
        description: "",
      });
      getBanners();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Opps, Some error occured"
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const [updateBannerId, setUpdateBannerId] = useState<undefined | string>(
    undefined
  );

  const handleUpdateBanner = async () => {
    try {
      setIsFormSubmitting(true);

      const response = await cAxios.patch(
        `${process.env.VITE_APP_API_URL}/banners/update/${updateBannerId}`,
        {
          categoryData: bannerData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      toast.success(response?.data?.message);
      setBannerData({
        title: "",
        redirectUrl: "",
        imageUrl: "",
        description: "",
      });

      setUpdateBannerId(undefined);
      getBanners();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Opps, Some error occured"
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleBannerSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (!!updateBannerId) {
      handleUpdateBanner();
    } else {
      handleAddBanner();
    }
  };

  const [bannerViewImage, setBannerViewImage] = useState<string>("");

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Banner</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateBannerId ? "Add Banner" : "Update Banner"}
            </h2>
            {!updateBannerId ? (
              <p className="text-gray-500 text-md">
                List one new banner to database
              </p>
            ) : (
              <>
                <p className="text-gray-700 text-lg">
                  Update information: <strong>{bannerData.title}</strong>
                </p>
                <ul className="list-disc list-inside mt-1">
                  <li className="text-gray-500 text-md">
                    <code>
                      &lt;You can update the banner name or banner image both or
                      anyone of them. name&gt;
                    </code>
                    <code>
                      &lt;Click on the submit button after filling the required
                      updated details, It's done!&gt;
                    </code>
                  </li>
                </ul>
              </>
            )}

            <form onSubmit={handleBannerSubmit} className="mt-4">
              <div className="flex flex-row gap-3">
                <div className="mb-4 w-full">
                  <label htmlFor="title" className="block font-semibold mb-2">
                    Banner Name
                  </label>
                  <input
                    type="text"
                    id="title"
                    placeholder={!!updateBannerId ? "Updated name" : "Banner"}
                    value={bannerData.title}
                    onChange={(e) => {
                      setBannerData((prev) => {
                        return { ...prev, title: e.target.value };
                      });
                    }}
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateBannerId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid banner name with minimum
                      length of 3 characters.
                    </p>
                  )}
                </div>
                <div className="mb-4 w-full">
                  <label
                    htmlFor="redirectUrl"
                    className="block font-semibold mb-2">
                    Banner RedirectUrl
                  </label>
                  <input
                    type="text"
                    id="redirectUrl"
                    placeholder={
                      !!updateBannerId ? "Updated redirectUrl" : "redirectUrl"
                    }
                    value={bannerData.redirectUrl}
                    onChange={(e) => {
                      setBannerData((prev) => {
                        return { ...prev, redirectUrl: e.target.value };
                      });
                    }}
                    minLength={3}
                    required={false}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* {!updateBannerId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid banner name with minimum
                      length of 3 characters.
                    </p>
                  )} */}
                </div>
              </div>

              <div className="flex flex-row gap-3">
                <div className="mb-4 w-full md:w-2/3 xl:w-2/4">
                  <label
                    htmlFor="previewImage"
                    className="block font-semibold mb-2 w-full">
                    Banner Images
                  </label>
                  <div className="flex max-md:flex-col gap-4 h-[282.5px]">
                    {!bannerData.imageUrl ? (
                      <AssetPicker
                        classX="h-[282.5px]"
                        htmlFor="previewImage"
                        fileSelectCallback={(
                          imageItems: Array<FileLibraryListItem>
                        ) => {
                          setBannerData((prev) => {
                            return {
                              ...prev,
                              imageUrl: imageItems[0].imageLink,
                            };
                          });
                        }}
                        multiSelect={false}
                      />
                    ) : (
                      <div className="relative w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded  h-[282.5px]">
                        <img
                          className="w-full h-full w-[200px] aspect-square object-contain"
                          src={bannerData.imageUrl as string}
                        />
                        <button
                          onClick={() => {
                            setBannerData((prev) => {
                              return {
                                ...prev,
                                imageUrl: null,
                              };
                            });
                          }}
                          type="button"
                          className="absolute w-10 h-10 flex justify-center items-center top-1 right-1 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                          {/* Remove */}
                          <MdDeleteOutline size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!updateBannerId && (
                    <p className="text-red-500 text-sm mt-4">
                      Note: Only image files are allowed (.jpg, .jpeg, .png,
                      .gif)
                    </p>
                  )}
                </div>

                <div className="mb-4 w-full md:w-2/3 xl:w-2/4">
                  <label htmlFor="title" className="block font-semibold mb-3">
                    Banner Description
                  </label>
                  <textarea
                    id="description"
                    placeholder={
                      !!updateBannerId
                        ? "Updated Description"
                        : "Banner Description"
                    }
                    value={bannerData.description}
                    onChange={(e) => {
                      setBannerData((prev) => {
                        return { ...prev, description: e.target.value };
                      });
                    }}
                    minLength={3}
                    required
                    rows={11}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateBannerId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid banner description with
                      minimum length of 3 characters.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={
                    !updateBannerId && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateBannerId && (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {!!updateBannerId ? "Update Banner" : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBannerData({
                      title: "",
                      imageUrl: "",
                      redirectUrl: "",
                    });
                    setUpdateBannerId(undefined);
                  }}
                  disabled={
                    !updateBannerId && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateBannerId && (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">banners</h2>
            {isBannersLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className=" overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL.
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <i className="cil-apps text-gray-500"></i>
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key
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
                    {bannerList?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => {
                            if (item?.imageUrl)
                              setBannerViewImage(item.imageUrl);
                          }}>
                          <img
                            src={item.imageUrl as string}
                            alt={item.title}
                            className="min-w-10 min-h-10 h-10 w-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.key}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateBannerId(item._id);
                                setBannerData((prev) => {
                                  return {
                                    ...prev,
                                    title: item.title,
                                    imageUrl: item.imageUrl,
                                    redirectUrl: item.redirectUrl,
                                    description: item.description || "",
                                  };
                                });
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteCategoryId(item._id as string);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>{" "}
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

      {deleteCategoryId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this banner will remove this banner from database
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteCategoryId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteCategory}
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

      {bannerViewImage && (
        <ViewImage
          clearItem={() => {
            setBannerViewImage("");
          }}
          imageUrl={bannerViewImage}
        />
      )}
    </div>
  );
};

export default BannerList;
