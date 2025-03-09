import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileLibraryListItem } from "react-media-library";
import AssetPicker from "../../components/AssetPicker/AssetPicker";
import { useAppSelector } from "../../redux/index";
import { Testimonial } from "../../types";
import cAxios from "../../axios/cutom-axios";
import no_image from "../../assets/no-image.svg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

const TestimonialsAdd = () => {
  const [testimonialData, setTestimonialData] = useState<Testimonial>({
    clientName: "",
    clientSpeech: "",
    clientAvatar: "",
    clientChatImage: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { jwtToken } = useAppSelector((state) => state.auth);

  const [testimonialList, setTestimonialList] = useState<Testimonial[]>([]);
  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(true);

  const [deleteTestimonialId, setDeleteTestimonialId] = useState<string | null>(
    null
  );
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const [updateTestimonialId, setUpdateTestimonialId] = useState<
    string | undefined
  >(undefined);

  // Fetch testimonials
  const getTestimonials = async (page = 1, limit = 10) => {
    try {
      setIsTestimonialsLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/testimonials?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setTestimonialList(response.data?.data);
      setTotalPages(response.data?.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    getTestimonials(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  // Validate form fields
  useEffect(() => {
    const isEverythingOk =
      !!testimonialData?.clientName &&
      testimonialData.clientName.length >= 3 &&
      !!testimonialData?.clientSpeech &&
      testimonialData.clientSpeech.length >= 10 &&
      !!testimonialData?.clientAvatar &&
      !!testimonialData?.clientChatImage;
    setIsSubmitDisabled(!isEverythingOk);
  }, [testimonialData]);

  console.log(testimonialData);

  // Handle form submission (add or update)
  const handleTestimonialSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    try {
      setIsFormSubmitting(true);

      if (updateTestimonialId) {
        // Update existing testimonial
        const response = await cAxios.patch(
          `${process.env.VITE_APP_API_URL}/testimonials/${updateTestimonialId}`,
          { testimonialData }
        );
        toast.success(response?.data?.message);
      } else {
        // Add new testimonial
        const response = await cAxios.post(
          `${process.env.VITE_APP_API_URL}/testimonials`,
          { testimonialData }
        );
        toast.success(response?.data?.message);
      }

      // Reset form after successful submission
      setTestimonialData({
        clientName: "",
        clientSpeech: "",
        clientAvatar: "",
        clientChatImage: "",
      });
      setUpdateTestimonialId(undefined);
      getTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle delete testimonial
  const handleDeleteTestimonial = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/testimonials/${deleteTestimonialId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      toast.success(response?.data?.message);
      setDeleteTestimonialId(null);
      getTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Testimonials</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateTestimonialId ? "Add Testimonial" : "Update Testimonial"}
            </h2>
            <form onSubmit={handleTestimonialSubmit} className="mt-4">
              {/* Client Name */}
              <div className="mb-4">
                <label
                  htmlFor="clientName"
                  className="block font-semibold mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  id="clientName"
                  placeholder="Enter client name"
                  value={testimonialData.clientName}
                  onChange={(e) =>
                    setTestimonialData({
                      ...testimonialData,
                      clientName: e.target.value,
                    })
                  }
                  minLength={3}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Client Speech */}
              <div className="mb-4">
                <label
                  htmlFor="clientSpeech"
                  className="block font-semibold mb-2">
                  Client Speech
                </label>
                <textarea
                  id="clientSpeech"
                  placeholder="Enter client speech"
                  value={testimonialData.clientSpeech}
                  onChange={(e) =>
                    setTestimonialData({
                      ...testimonialData,
                      clientSpeech: e.target.value,
                    })
                  }
                  minLength={10}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Images */}
              <div className="flex gap-2 max-lg:flex-col">
                <div className="mb-4 w-full md:w-1/2 xl:w-1/4">
                  <label htmlFor="avatar" className="block font-semibold mb-2">
                    Client Avatar
                  </label>
                  <div className="flex max-md:flex-col gap-4 h-80">
                    {!testimonialData.clientAvatar ? (
                      <AssetPicker
                        iconClassX={"h-10"}
                        htmlFor="previewImage"
                        fileSelectCallback={(
                          imageItems: Array<FileLibraryListItem>
                        ) => {
                          setTestimonialData({
                            ...testimonialData,
                            clientAvatar: imageItems[0].imageLink,
                          });
                        }}
                        multiSelect={false}
                      />
                    ) : (
                      <div className="relative w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                        <img
                          className="w-full h-full w-[200px] aspect-square object-contain"
                          src={testimonialData.clientAvatar as string}
                        />
                        <button
                          onClick={() => {
                            setTestimonialData({
                              ...testimonialData,
                              clientAvatar: null,
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
                  {!updateTestimonialId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Only image files are allowed (.jpg, .jpeg, .png,
                      .gif)
                    </p>
                  )}
                </div>
                <div className="mb-4 w-full md:w-1/2 xl:w-1/2">
                  <label
                    htmlFor="clientChat"
                    className="block font-semibold mb-2">
                    Client Chat Image
                  </label>
                  <div className="flex max-md:flex-col gap-4 h-80">
                    {!testimonialData.clientChatImage ? (
                      <AssetPicker
                        iconClassX={"h-10"}
                        htmlFor="clientChat"
                        fileSelectCallback={(
                          imageItems: Array<FileLibraryListItem>
                        ) => {
                          setTestimonialData({
                            ...testimonialData,
                            clientChatImage: imageItems[0].imageLink,
                          });
                        }}
                        multiSelect={false}
                      />
                    ) : (
                      <div className="relative w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                        <img
                          className="w-full h-full w-[200px] aspect-square object-contain"
                          src={testimonialData.clientChatImage as string}
                        />
                        <button
                          onClick={() => {
                            setTestimonialData({
                              ...testimonialData,
                              clientChatImage: null,
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

                  {!updateTestimonialId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Only image files are allowed (.jpg, .jpeg, .png,
                      .gif)
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={
                    !updateTestimonialId &&
                    (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateTestimonialId &&
                    (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {!!updateTestimonialId ? "Update Testimonial" : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTestimonialData({
                      clientName: "",
                      clientSpeech: "",
                      clientAvatar: "",
                      clientChatImage: "",
                    });
                    setUpdateTestimonialId(undefined);
                  }}
                  disabled={
                    !updateTestimonialId &&
                    (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateTestimonialId &&
                    (isSubmitDisabled || isFormSubmitting)
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
            <h2 className="text-lg font-semibold mb-4">Testimonials</h2>
            {isTestimonialsLoading ? (
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
                        Avatar
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Speech
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
                    {testimonialList?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={item.clientAvatar}
                            alt={item.clientName}
                            className="w-12 h-12 rounded-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.clientSpeech}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateTestimonialId(item._id);
                                setTestimonialData({
                                  clientName: item.clientName,
                                  clientSpeech: item.clientSpeech,
                                  clientAvatar: item.clientAvatar,
                                  clientChatImage: item.clientChatImage,
                                });
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTestimonialId(item._id as string);
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
      {deleteTestimonialId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this testimonial will remove it from the database.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTestimonialId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteTestimonial}
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

export default TestimonialsAdd;
