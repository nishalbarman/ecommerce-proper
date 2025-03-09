import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileLibraryListItem } from "react-media-library";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";

import AssetPicker from "../AssetPicker/AssetPicker";

import { useAppSelector } from "../../redux/index";

import { Feature } from "../../types";

import cAxios from "../../axios/cutom-axios";

import no_image from "../../assets/no-image.svg";

import ViewImage from "../ViewImage/ViewImage";
import { MdDeleteOutline } from "react-icons/md";

const FeatureList = () => {
  const [featureData, setFeatureData] = useState<Feature>({
    featureName: "",
    featureDescription: "",
    featureImageUrl: "",
  });

  //   const categoryImageRef = useRef(null);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    let isEverythingOk =
      !!featureData?.featureName &&
      featureData.featureName.length >= 3 &&
      featureData.featureImageUrl !== null &&
      featureData.featureImageUrl !== "";
    setIsSubmitDisabled(!isEverythingOk);
  }, [featureData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const { jwtToken } = useAppSelector((state) => state.auth);

  const [featureList, setFeatureList] = useState<Feature[]>([]);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  const [isFeaturesLoading, setIsFeaturesLoading] = useState(true);

  const getFeatures = async (page = 1, limit = 10) => {
    try {
      setIsFeaturesLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/features?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setFeatureList(response.data?.features);
      setTotalPages(response.data?.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsFeaturesLoading(false);
    }
  };

  useEffect(() => {
    getFeatures(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  const [deleteFeatureId, setDeleteFeatureId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteFeature = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/features/${deleteFeatureId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log(response);
      toast.success("Feature deleted");
      setDeleteFeatureId(null);
      getFeatures();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const handleAddFeature = async () => {
    try {
      setIsFormSubmitting(true);

      const response = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/features`,
        {
          featureData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setFeatureData({
        featureName: "",
        featureDescription: "",
        featureImageUrl: "",
      });
      getFeatures();
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

  const [updateFeatureById, setUpdateFeatureId] = useState<undefined | string>(
    undefined
  );

  const handleUpdateCategory = async () => {
    try {
      setIsFormSubmitting(true);

      const response = await cAxios.patch(
        `${process.env.VITE_APP_API_URL}/features/update/${updateFeatureById}`,
        {
          featureData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      toast.success(response?.data?.message);
      setFeatureData({
        featureName: "",
        featureDescription: "",
        featureImageUrl: "",
      });

      setUpdateFeatureId(undefined);
      getFeatures();
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

  const handleCategorySubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (!!updateFeatureById) {
      handleUpdateCategory();
    } else {
      handleAddFeature();
    }
  };

  const [categoryViewImage, setCategoryViewImage] = useState<string>("");

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Feature</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateFeatureById ? "Add Feature" : "Update Feature"}
            </h2>
            {!updateFeatureById ? (
              <p className="text-gray-500 text-md">
                List one new feature to database
              </p>
            ) : (
              <>
                <p className="text-gray-700 text-lg">
                  Update information: <strong>{featureData.featureName}</strong>
                </p>
                <ul className="list-disc list-inside mt-1">
                  <li className="text-gray-500 text-md">
                    <code>
                      &lt;You can update the feature name or feature image both
                      or anyone of them. name&gt;
                    </code>
                    <code>
                      &lt;Click on the submit button after filling the required
                      updated details, It's done!&gt;
                    </code>
                  </li>
                </ul>
              </>
            )}

            <form onSubmit={handleCategorySubmit} className="mt-4">
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="featureName"
                    className="block font-semibold mb-2">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    id="featureName"
                    placeholder={
                      !!updateFeatureById ? "Updated name" : "Feature"
                    }
                    value={featureData.featureName}
                    onChange={(e) => {
                      setFeatureData((prev) => {
                        return { ...prev, featureName: e.target.value };
                      });
                    }}
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateFeatureById && (
                    <p className="text-red-500 text-sm mt-1">
                      Please provide a valid feature name with minimum length of
                      3 characters.
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="featureDescription"
                    className="block font-semibold mb-2">
                    Feature Description
                  </label>
                  <input
                    type="text"
                    id="featureDescription"
                    placeholder={
                      !!updateFeatureById
                        ? "Updated Description"
                        : "Description"
                    }
                    value={featureData.featureDescription}
                    onChange={(e) => {
                      setFeatureData((prev) => {
                        return { ...prev, featureDescription: e.target.value };
                      });
                    }}
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateFeatureById && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Keep it simple and short.
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4 w-full md:w-1/2 xl:w-1/4">
                <label
                  htmlFor="previewImage"
                  className="block font-semibold mb-2 w-full">
                  Feature Image
                </label>
                <div className="flex max-md:flex-col gap-4 h-40">
                  {!featureData.featureImageUrl ? (
                    <AssetPicker
                      classX="h-40"
                      htmlFor="previewImage"
                      fileSelectCallback={(
                        imageItems: Array<FileLibraryListItem>
                      ) => {
                        setFeatureData((prev) => {
                          return {
                            ...prev,
                            featureImageUrl: imageItems[0].imageLink,
                          };
                        });
                      }}
                      multiSelect={false}
                    />
                  ) : (
                    <div className="relative w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                      <img
                        className="w-full h-full w-[200px] aspect-square object-contain"
                        src={featureData.featureImageUrl as string}
                      />
                      <button
                        onClick={() => {
                          setFeatureData((prev) => {
                            return {
                              ...prev,
                              featureImageUrl: null,
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

                  {/* <div className="w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                    {featureData.featureImageUrl ? (
                      <img
                        className="w-full h-full w-[200px] aspect-square object-contain"
                        src={featureData.featureImageUrl as string}
                      />
                    ) : (
                      <img
                        className="w-full h-full w-60 aspect-square object-contain"
                        src={no_image}
                      />
                    )}
                  </div> */}
                </div>

                {!updateFeatureById && (
                  <p className="text-red-500 text-sm mt-1">
                    Only image files are allowed (.jpg, .jpeg, .png, .gif)
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={
                    !updateFeatureById && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateFeatureById && (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {!!updateFeatureById ? "Update Feature" : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeatureData({
                      featureName: "",
                      featureDescription: "",
                      featureImageUrl: "",
                    });
                    setUpdateFeatureId(undefined);
                  }}
                  disabled={
                    !updateFeatureById && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateFeatureById && (isSubmitDisabled || isFormSubmitting)
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
            <h2 className="text-lg font-semibold mb-4">Features</h2>
            {isFeaturesLoading ? (
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
                        <CiImageOn size={20} />
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
                    {featureList?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => {
                            if (item?.featureImageUrl)
                              setCategoryViewImage(item.featureImageUrl);
                          }}>
                          <img
                            src={item.featureImageUrl as string}
                            alt={item.featureName}
                            className="w-12 h-12 rounded-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.featureName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.featureKey}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateFeatureId(item._id);
                                setFeatureData((prev) => {
                                  return {
                                    ...prev,
                                    featureName: item.featureName,
                                    featureImageUrl: item.featureImageUrl,
                                  };
                                });
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteFeatureId(item._id as string);
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

      {deleteFeatureId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this feature will remove this feature from database
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteFeatureId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteFeature}
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

      {categoryViewImage && (
        <ViewImage
          clearItem={() => {
            setCategoryViewImage("");
          }}
          imageUrl={categoryViewImage}
        />
      )}
    </div>
  );
};

export default FeatureList;
