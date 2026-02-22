"use client";

import {
  BaseSyntheticEvent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useAppSelector } from "../../redux";
import cAxios from "../../axios/cutom-axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import AssetPicker from "../AssetPicker/AssetPicker";
import { FileLibraryListItem } from "react-media-library";

type Gateway = {
  _id?: string;
  title: string;
  code: string;
  description?: string;
  gatewayImageUrl?: string;
  isActive: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
};

const GatewayList = () => {
  const { jwtToken } = useAppSelector((state) => state.auth);

  const [gatewayData, setGatewayData] = useState<Gateway>({
    title: "",
    code: "",
    description: "",
    gatewayImageUrl: "",
    isActive: true,
    priority: 1,
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [gatewayList, setGatewayList] = useState<Gateway[]>([]);
  const [updateGatewayId, setUpdateGatewayId] = useState<string | undefined>();

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ validation
  useEffect(() => {
    const isValid =
      gatewayData.title.length >= 2 && gatewayData.code.length >= 2;

    setIsSubmitDisabled(!isValid);
  }, [gatewayData]);

  // ✅ fetch gateways
  const getGateways = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const res = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/payment/gateways?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );

      setGatewayList(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGateways(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  const handleOnFileSelected = useCallback(
    (imageItems: Array<FileLibraryListItem>) => {
      // alert(JSON.stringify(imageItems));
      setGatewayData((prev) => {
        return {
          ...prev,
          gatewayImageUrl: imageItems[0].imageLink,
        };
      });
    },
    [],
  );

  // ✅ add
  const handleAdd = async () => {
    try {
      setIsFormSubmitting(true);

      const res = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/payment/gateways`,
        gatewayData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );

      toast.success(res.data.message);
      resetForm();
      getGateways();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // ✅ update
  const handleUpdate = async () => {
    try {
      setIsFormSubmitting(true);

      const res = await cAxios.patch(
        `${process.env.VITE_APP_API_URL}/payment/gateways/${updateGatewayId}`,
        gatewayData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );

      toast.success(res.data.message);
      resetForm();
      getGateways();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    updateGatewayId ? handleUpdate() : handleAdd();
  };

  // ✅ delete
  const handleDelete = async (id: string) => {
    try {
      await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/payment/gateways/${id}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );

      toast.success("Gateway deleted");
      getGateways();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resetForm = () => {
    setGatewayData({
      title: "",
      code: "",
      description: "",
      isActive: true,
      priority: 1,
    });
    setUpdateGatewayId(undefined);
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payment Gateways
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {/* FORM */}
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateGatewayId ? "Add Gateway" : "Update Gateway"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex justify-center items-center gap-4">
                <div className="mb-4 w-full">
                  <label
                    htmlFor="gatewayTitle"
                    className="block font-semibold mb-2">
                    Gateway Title
                  </label>
                  <input
                    type="text"
                    id="gatewayTitle"
                    placeholder={!!updateGatewayId ? "Updated Title" : "Title"}
                    value={gatewayData.title}
                    onChange={(e) =>
                      setGatewayData({
                        ...gatewayData,
                        title: e.target.value,
                      })
                    }
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateGatewayId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid gateway name with minimum
                      length of 3 characters.
                    </p>
                  )}
                </div>

                <div className="mb-4 w-full">
                  <label
                    htmlFor="gatewayCode"
                    className="block font-semibold mb-2">
                    Gateway Code
                  </label>
                  <input
                    type="text"
                    id="gatewayCode"
                    placeholder={!!updateGatewayId ? "Updated Code" : "Code"}
                    value={gatewayData.code}
                    onChange={(e) =>
                      setGatewayData({
                        ...gatewayData,
                        code: e.target.value,
                      })
                    }
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateGatewayId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid gateway code with minimum
                      length of 3 characters.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center items-center gap-4">
                <div className="mb-4 w-full">
                  <label
                    htmlFor="gatewayDescription"
                    className="block font-semibold mb-2">
                    Gateway Description
                  </label>
                  <input
                    type="text"
                    id="gatewayDescription"
                    placeholder={
                      !!updateGatewayId ? "Updated Description" : "Description"
                    }
                    value={gatewayData.description}
                    onChange={(e) =>
                      setGatewayData({
                        ...gatewayData,
                        description: e.target.value,
                      })
                    }
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateGatewayId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid gateway descrition with
                      minimum length of 3 characters.
                    </p>
                  )}
                </div>

                <div className="mb-4 w-full">
                  <label
                    htmlFor="gatewayPriority"
                    className="block font-semibold mb-2">
                    Gateway Priority
                  </label>
                  <input
                    type="number"
                    id="gatewayPriority"
                    placeholder={
                      !!updateGatewayId ? "Updated Priority" : "Priority"
                    }
                    value={gatewayData.priority}
                    onChange={(e) =>
                      setGatewayData({
                        ...gatewayData,
                        priority: +e.target.value,
                      })
                    }
                    minLength={3}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!updateGatewayId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Please provide a valid natural number.
                    </p>
                  )}
                </div>
              </div>

              <div className="my-5">
                <label className="flex items-center gap-2 text-lg h-11 border border-gray-200 w-full px-2 rounded-md  cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer"
                    checked={gatewayData.isActive}
                    onChange={(e) =>
                      setGatewayData({
                        ...gatewayData,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-start items-center gap-5">
                <div className="mb-4 w-full md:w-1/2 xl:w-1/4">
                  <label
                    htmlFor="gatewayImage"
                    className="block font-semibold mb-2 w-full">
                    Gateway Image
                  </label>
                  <div className="flex max-md:flex-col gap-4 h-40">
                    {!gatewayData.gatewayImageUrl ? (
                      <AssetPicker
                        classX="h-40"
                        htmlFor="gatewayImage"
                        fileSelectCallback={handleOnFileSelected}
                        multiSelect={false}
                      />
                    ) : (
                      <div className="relative w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                        <img
                          className="w-full h-full w-[200px] aspect-square object-contain"
                          src={gatewayData.gatewayImageUrl as string}
                        />
                        <button
                          onClick={() => {
                            setGatewayData((prev) => {
                              return {
                                ...prev,
                                gatewayImageUrl: null,
                              };
                            });
                          }}
                          type="button"
                          className="absolute w-10 h-10 flex justify-center items-center top-1 right-1 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-ponter disabled:cursor-not-allowed">
                          {/* Remove */}
                          <MdDeleteOutline size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!updateGatewayId && (
                    <p className="text-red-500 text-sm mt-1">
                      Note: Only image files are allowed (.jpg, .jpeg, .png,
                      .gif)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitDisabled || isFormSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitDisabled || isFormSubmitting
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {updateGatewayId ? "Update" : "Submit"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600">
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* TABLE */}
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Gateways</h2>

            {isLoading ? (
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
                        Code
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
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
                    {gatewayList?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {index + 1}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => {
                            // if (item?.imageUrl)
                            //   setBannerViewImage(item.imageUrl);
                          }}>
                          <img
                            src={item.gatewayImageUrl as string}
                            alt={item.title}
                            className="min-w-10 min-h-10 h-10 w-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateGatewayId(item._id);
                                setGatewayData((prev) => {
                                  return {
                                    ...prev,
                                    title: item.title,
                                    gatewayImageUrl: item.gatewayImageUrl,
                                    code: item.code,
                                    isActive: item.isActive,
                                    priority: item.priority,
                                    description: item.description || "",
                                  };
                                });
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                // setDeleteGat(item._id as string);
                                handleDelete(item._id as string);
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
                          Math.min(prev + 1, totalPages),
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

            {/* Pagination */}
            {/* <div className="flex justify-between mt-5 border-t pt-4">
                  <button
                    onClick={() =>
                      setPaginationPage((p) => Math.max(p - 1, 1))
                    }>
                    <FaChevronLeft />
                  </button>

                  <span>
                    Page {paginationPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setPaginationPage((p) => Math.min(p + 1, totalPages))
                    }>
                    <FaChevronRight />
                  </button>
                </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GatewayList);
