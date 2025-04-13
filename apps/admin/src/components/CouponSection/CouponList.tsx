import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import {
  useGetCouponsQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "../../redux/apis/couponApi";

interface Coupon {
  _id?: string;
  code: string;
  off: number;
  minPurchasePrice: number;
  isPercentage: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const CouponList = () => {
  const [couponData, setCouponData] = useState<Coupon>({
    code: "",
    off: 0,
    minPurchasePrice: 0,
    isPercentage: false,
    description: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    const isEverythingOk =
      couponData.code.length >= 3 &&
      couponData.off > 0 &&
      couponData.description.length >= 5;
    setIsSubmitDisabled(!isEverythingOk);
  }, [couponData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit] = useState(10);

  const {
    data: couponsData,
    isLoading: isCouponsLoading,
    error,
    refetch,
  } = useGetCouponsQuery({ page: paginationPage, limit: paginationLimit });

  const [addCoupon] = useAddCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteCoupon = async () => {
    try {
      setDeleteButtonLoading(true);
      await deleteCoupon(deleteCouponId).unwrap();
      toast.success("Coupon deleted successfully");
      setDeleteCouponId(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    try {
      setIsFormSubmitting(true);
      await addCoupon({
        ...couponData,
        code: couponData.code.toUpperCase(),
      }).unwrap();
      toast.success("Coupon added successfully");
      setCouponData({
        code: "",
        off: 0,
        minPurchasePrice: 0,
        isPercentage: false,
        description: "",
      });
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const [updateCouponId, setUpdateCouponId] = useState<undefined | string>(
    undefined
  );

  const handleUpdateCoupon = async () => {
    try {
      setIsFormSubmitting(true);
      await updateCoupon({
        id: updateCouponId,
        couponData: {
          ...couponData,
          code: couponData.code.toUpperCase(),
        },
      }).unwrap();
      toast.success("Coupon updated successfully");
      setCouponData({
        code: "",
        off: 0,
        minPurchasePrice: 0,
        isPercentage: false,
        description: "",
      });
      setUpdateCouponId(undefined);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleCouponSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (updateCouponId) {
      handleUpdateCoupon();
    } else {
      handleAddCoupon();
    }
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateCouponId ? "Add Coupon" : "Update Coupon"}
            </h2>
            {!updateCouponId ? (
              <p className="text-gray-500 text-md">
                Create a new discount coupon
              </p>
            ) : (
              <>
                <p className="text-gray-700 text-lg">
                  Updating coupon: <strong>{couponData.code}</strong>
                </p>
              </>
            )}

            <form onSubmit={handleCouponSubmit} className="mt-4">
              <div className="mb-4">
                <label htmlFor="code" className="block font-semibold mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  id="code"
                  placeholder="e.g., SUMMER20"
                  value={couponData.code}
                  onChange={(e) => {
                    setCouponData((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }));
                  }}
                  minLength={3}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!updateCouponId && (
                  <p className="text-red-500 text-sm mt-1">
                    Minimum 3 characters required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="off" className="block font-semibold mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  id="off"
                  placeholder="e.g., 20"
                  value={couponData.off}
                  onChange={(e) => {
                    setCouponData((prev) => ({
                      ...prev,
                      off: parseFloat(e.target.value) || 0,
                    }));
                  }}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="off" className="block font-semibold mb-2">
                  Minimum Purchase Value
                </label>
                <input
                  type="number"
                  id="minimumPurchaseValue"
                  placeholder="e.g., 199"
                  value={couponData.minPurchasePrice}
                  onChange={(e) => {
                    setCouponData((prev) => ({
                      ...prev,
                      minPurchasePrice: parseFloat(e.target.value) || 0,
                    }));
                  }}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPercentage"
                  checked={couponData.isPercentage}
                  onChange={(e) => {
                    setCouponData((prev) => ({
                      ...prev,
                      isPercentage: e.target.checked,
                    }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPercentage"
                  className="ml-2 block font-semibold">
                  Is Percentage Discount?
                </label>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block font-semibold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Describe the coupon (e.g., Summer Sale 20% off)"
                  value={couponData.description}
                  onChange={(e) => {
                    setCouponData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                  }}
                  minLength={5}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                {!updateCouponId && (
                  <p className="text-red-500 text-sm mt-1">
                    Minimum 5 characters required
                  </p>
                )}
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
                  {updateCouponId ? "Update Coupon" : "Create Coupon"}
                </button>

                <button
                  onClick={() => {
                    setCouponData({
                      code: "",
                      off: 0,
                      minPurchasePrice: 0,
                      isPercentage: false,
                      description: "",
                    });
                    setUpdateCouponId(undefined);
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
            <h2 className="text-lg font-semibold mb-4">Coupons List</h2>
            {isCouponsLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin pb-3">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {couponsData?.coupons?.map((coupon: Coupon) => (
                      <tr key={coupon._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">
                          {coupon.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.off}
                          {coupon.isPercentage ? "%" : ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.isPercentage ? "Percentage" : "Fixed Amount"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {coupon.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateCouponId(coupon._id);
                                setCouponData({
                                  code: coupon.code,
                                  off: coupon.off,
                                  minPurchasePrice: coupon.minPurchasePrice,
                                  isPercentage: coupon.isPercentage,
                                  description: coupon.description,
                                });
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteCouponId(coupon._id)}
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
                    Page {paginationPage} of {couponsData?.totalPages || 0}
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
                          Math.min(prev + 1, couponsData?.totalPages || 0)
                        )
                      }
                      disabled={
                        paginationPage === (couponsData?.totalPages || 0)
                      }
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

      {deleteCouponId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Coupon Deletion
            </h3>
            <p className="text-gray-700">
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteCouponId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Cancel
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteCoupon}
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

export default CouponList;
