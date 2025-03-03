import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileLibraryListItem } from "react-media-library";

import AssetPicker from "../../components/AssetPicker/AssetPicker";

import { useAppSelector } from "../../redux/index";

import { Category } from "../../types";

import cAxios from "../../axios/cutom-axios";

import no_image from "../../assets/no-image.svg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductAdd = () => {
  const [categoryData, setCategoryData] = useState<Category>({
    categoryName: "",
    categoryImageUrl: "",
  });

  //   const categoryImageRef = useRef(null);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    let isEverythingOk =
      !!categoryData?.categoryName &&
      categoryData.categoryName.length >= 3 &&
      categoryData.categoryImageUrl !== null &&
      categoryData.categoryImageUrl !== "";
    setIsSubmitDisabled(!isEverythingOk);
  }, [categoryData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const { jwtToken } = useAppSelector((state) => state.auth);

  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const getCategories = async (page = 1, limit = 10) => {
    try {
      setIsCategoriesLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/categories?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setCategoryList(response.data?.categories);
      setTotalPages(response.data?.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    getCategories(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteCategory = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/categories/${deleteCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log(response);
      toast.success("Category deleted");
      setDeleteCategoryId(null);
      getCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      setIsFormSubmitting(true);

      const response = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/categories`,
        {
          categoryData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      toast.success(response?.data?.message);
      setCategoryData({
        categoryName: "",
        categoryImageUrl: "",
      });
      getCategories();
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

  const [updateCategoryId, setUpdateCategoryId] = useState<undefined | string>(
    undefined
  );

  const handleUpdateCategory = async () => {
    try {
      setIsFormSubmitting(true);

      const response = await cAxios.patch(
        `${process.env.VITE_APP_API_URL}/categories/update/${updateCategoryId}`,
        {
          categoryData,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      toast.success(response?.data?.message);
      setCategoryData({
        categoryName: "",
        categoryImageUrl: "",
      });

      setUpdateCategoryId(undefined);
      getCategories();
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
    if (!!updateCategoryId) {
      handleUpdateCategory();
    } else {
      handleAddCategory();
    }
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Category</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateCategoryId ? "Add Category" : "Update Category"}
            </h2>
            {!updateCategoryId ? (
              <p className="text-gray-500 text-md">
                List one new category to database
              </p>
            ) : (
              <>
                <p className="text-gray-700 text-lg">
                  Update information:{" "}
                  <strong>{categoryData.categoryName}</strong>
                </p>
                <ul className="list-disc list-inside mt-1">
                  <li className="text-gray-500 text-md">
                    <code>
                      &lt;You can update the category name or category image
                      both or anyone of them. name&gt;
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
              <div className="mb-4">
                <label
                  htmlFor="categoryName"
                  className="block font-semibold mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  placeholder={!!updateCategoryId ? "Updated name" : "Category"}
                  value={categoryData.categoryName}
                  onChange={(e) => {
                    setCategoryData((prev) => {
                      return { ...prev, categoryName: e.target.value };
                    });
                  }}
                  minLength={3}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!updateCategoryId && (
                  <p className="text-red-500 text-sm mt-1">
                    Please provide a valid category name with minimum length of
                    3 characters.
                  </p>
                )}
              </div>
              <div className="mb-4 w-1/2">
                <label
                  htmlFor="previewImage"
                  className="block font-semibold mb-2 w-full">
                  Category Image
                </label>
                <div className="flex max-md:flex-col gap-4 h-40">
                  <AssetPicker
                    htmlFor="previewImage"
                    fileSelectCallback={(
                      imageItems: Array<FileLibraryListItem>
                    ) => {
                      setCategoryData((prev) => {
                        return {
                          ...prev,
                          categoryImageUrl: imageItems[0].imageLink,
                        };
                      });
                    }}
                    multiSelect={false}
                  />

                  <div className="w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                    {categoryData.categoryImageUrl ? (
                      <img
                        className="w-full h-full w-[200px] aspect-square object-contain"
                        src={categoryData.categoryImageUrl as string}
                      />
                    ) : (
                      <img
                        className="w-full h-full w-60 aspect-square object-contain"
                        src={no_image}
                      />
                    )}
                  </div>
                </div>

                {!updateCategoryId && (
                  <p className="text-red-500 text-sm mt-1">
                    Only image files are allowed (.jpg, .jpeg, .png, .gif)
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={
                    !updateCategoryId && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateCategoryId && (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {!!updateCategoryId ? "Update Category" : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategoryData({
                      categoryName: "",
                      categoryImageUrl: "",
                    });
                    setUpdateCategoryId(undefined);
                  }}
                  disabled={
                    !updateCategoryId && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateCategoryId && (isSubmitDisabled || isFormSubmitting)
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
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            {isCategoriesLoading ? (
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
                    {categoryList?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={item.categoryImageUrl as string}
                            alt={item.categoryName}
                            className="w-12 h-12 rounded-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.categoryName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.categoryKey}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateCategoryId(item._id);
                                setCategoryData((prev) => {
                                  return {
                                    ...prev,
                                    categoryName: item.categoryName,
                                    categoryImageUrl: item.categoryImageUrl,
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
              Deleting this category will remove this category from database
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
    </div>
  );
};

export default ProductAdd;
