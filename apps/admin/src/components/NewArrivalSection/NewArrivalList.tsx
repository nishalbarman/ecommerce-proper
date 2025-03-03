import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  useGetNewArrivalsQuery,
  useAddNewArrivalMutation,
  useUpdateNewArrivalMutation,
  useDeleteNewArrivalMutation,
} from "../../redux/apis/newArrivalApi";
import { NewArrival } from "../../types";
import AssetPicker from "../AssetPicker/AssetPicker";
import { FileLibraryListItem } from "react-media-library";

import no_image from "../../assets/no-image.svg";

const NewArrivalList = () => {
  const [newArrivalData, setNewArrivalData] = useState<NewArrival>({
    title: "",
    shortDescription: "",
    imageUrl: "",
    productId: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    const isEverythingOk =
      !!newArrivalData?.title &&
      newArrivalData.title.length >= 1 &&
      !!newArrivalData?.shortDescription &&
      newArrivalData.shortDescription.length >= 1 &&
      !!newArrivalData?.imageUrl &&
      newArrivalData.imageUrl.length >= 1 &&
      !!newArrivalData?.productId &&
      newArrivalData.productId.length >= 1;
    setIsSubmitDisabled(!isEverythingOk);
  }, [newArrivalData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit] = useState(10);

  const {
    data: newArrivalsData,
    isLoading: isNewArrivalsLoading,
    error,
    refetch,
  } = useGetNewArrivalsQuery({ page: paginationPage, limit: paginationLimit });

  const [addNewArrival] = useAddNewArrivalMutation();
  const [updateNewArrival] = useUpdateNewArrivalMutation();
  const [deleteNewArrival] = useDeleteNewArrivalMutation();

  const [deleteNewArrivalId, setDeleteNewArrivalId] = useState<string | null>(
    null
  );
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteNewArrival = async () => {
    try {
      setDeleteButtonLoading(true);
      await deleteNewArrival(deleteNewArrivalId).unwrap();
      toast.success("New Arrival deleted");
      setDeleteNewArrivalId(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const handleAddNewArrival = async () => {
    try {
      setIsFormSubmitting(true);
      await addNewArrival(newArrivalData).unwrap();
      toast.success("New Arrival added successfully");
      setNewArrivalData({
        title: "",
        shortDescription: "",
        imageUrl: "",
        productId: "",
      });
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const [updateNewArrivalId, setUpdateNewArrivalId] = useState<
    undefined | string
  >(undefined);

  const handleUpdateNewArrival = async () => {
    try {
      setIsFormSubmitting(true);
      await updateNewArrival({
        id: updateNewArrivalId,
        newArrivalData,
      }).unwrap();
      toast.success("New Arrival updated successfully");
      setNewArrivalData({
        title: "",
        shortDescription: "",
        imageUrl: "",
        productId: "",
      });
      setUpdateNewArrivalId(undefined);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleNewArrivalSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (!!updateNewArrivalId) {
      handleUpdateNewArrival();
    } else {
      handleAddNewArrival();
    }
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Arrivals</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateNewArrivalId ? "Add New Arrival" : "Update New Arrival"}
            </h2>
            <form onSubmit={handleNewArrivalSubmit} className="mt-4">
              <div className="mb-4">
                <label htmlFor="title" className="block font-semibold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Enter title"
                  value={newArrivalData.title}
                  onChange={(e) =>
                    setNewArrivalData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  minLength={1}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="shortDescription"
                  className="block font-semibold mb-2">
                  Short Description
                </label>
                <textarea
                  id="shortDescription"
                  placeholder="Enter short description"
                  value={newArrivalData.shortDescription}
                  onChange={(e) =>
                    setNewArrivalData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  minLength={1}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
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
                      setNewArrivalData((prev) => ({
                        ...prev,
                        imageUrl: imageItems[0].imageLink,
                      }));
                    }}
                    multiSelect={false}
                  />

                  <div className="w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                    {newArrivalData.imageUrl ? (
                      <img
                        className="w-full h-full w-[200px] aspect-square object-contain"
                        src={newArrivalData.imageUrl as string}
                      />
                    ) : (
                      <img
                        className="w-full h-full w-60 aspect-square object-contain"
                        src={no_image}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="productId" className="block font-semibold mb-2">
                  Product ID
                </label>
                <input
                  type="text"
                  id="productId"
                  placeholder="Enter product ID"
                  value={newArrivalData.productId}
                  onChange={(e) =>
                    setNewArrivalData((prev) => ({
                      ...prev,
                      productId: e.target.value,
                    }))
                  }
                  minLength={1}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitDisabled || isFormSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitDisabled || isFormSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {!!updateNewArrivalId ? "Update" : "Submit"}
                </button>
                <button
                  onClick={() => {
                    setNewArrivalData({
                      title: "",
                      shortDescription: "",
                      imageUrl: "",
                      productId: "",
                    });
                    setUpdateNewArrivalId(undefined);
                  }}
                  disabled={isSubmitDisabled || isFormSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitDisabled || isFormSubmitting
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
            <h2 className="text-lg font-semibold mb-4">New Arrivals</h2>
            {isNewArrivalsLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin pb-3">
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
                        Description
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product ID
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newArrivalsData?.newArrivals?.map(
                      (item: NewArrival, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-start">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.shortDescription}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-16 h-16 object-cover"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.productId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => {
                                  setUpdateNewArrivalId(item._id);
                                  setNewArrivalData({
                                    title: item.title,
                                    shortDescription: item.shortDescription,
                                    imageUrl: item.imageUrl,
                                    productId: item.productId,
                                  });
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteNewArrivalId(item._id as string);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex max-md:flex-col gap-3 justify-between items-center mt-5 border-t-2 pt-4">
                  <span>
                    Page {paginationPage} of {newArrivalsData.totalPages}
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
                          Math.min(prev + 1, newArrivalsData.totalPages)
                        )
                      }
                      disabled={paginationPage >= newArrivalsData.totalPages}
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

      {deleteNewArrivalId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this new arrival will remove it from the database.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteNewArrivalId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteNewArrival}
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

export default NewArrivalList;
