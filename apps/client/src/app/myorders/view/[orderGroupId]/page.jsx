"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTruck,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import Loading from "@/components/Loading";
import { MdCancel } from "react-icons/md";
import {
  useCancelOrderItemMutation,
  useCancelOrderMutation,
  useGetOrderGroupListQuery,
  useGetOrderListByGroupIdQuery,
  useViewOneOrderGroupByIdQuery,
} from "@/redux/apis/orderApi";

const OrderViewPage = ({ params }) => {
  const router = useRouter();
  const { orderGroupId: id } = use(params);

  const token = useSelector((state) => state.auth.jwtToken);

  const {
    data: orderGroup,
    isLoading: isOrderGroupLoading,
    error: orderGroupError,
  } = useViewOneOrderGroupByIdQuery(
    {
      orderGroupId: id,
    },
    { skip: !id },
  );

  const {
    data: orderData,
    isLoading,
    refetch,
  } = useGetOrderListByGroupIdQuery(
    { orderGroupId: id },
    {
      skip: !id, // prevent call if no id
    },
  );


  // console.log("What is order data", orderDetails);

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder({
        orderGroupId: orderGroup.orderGroupID,
      }).unwrap();

      toast.success("Order cancelled successfully");

      refetch(); // refresh data
    } catch (error) {
      toast.error(error?.data || "Failed to cancel order");
    }
  };

  const [cancelOrderItem] = useCancelOrderItemMutation();
  const [cancellingItemId, setCancellingItemId] = useState(null);

  const handleCancelOrderItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to cancel this item?")) return;

    try {
      setCancellingItemId(itemId);

      await cancelOrderItem({ orderItemId: itemId }).unwrap();

      toast.success("Order item cancelled successfully");

      refetch(); // refresh data
    } catch (error) {
      toast.error(error?.data || "Failed to cancel order item");
    } finally {
      setCancellingItemId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "On Hold":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "On Progress":
      case "Accepted":
      case "On The Way":
      case "PickUp Ready":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link href="/orders">
            <a className="text-blue-600 hover:underline">Back to orders</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/myorders">
            <span className="inline-flex items-center text-black hover:text-black">
              <FaArrowLeft className="mr-2" /> Back to Orders
            </span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Order Details */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Order{" "}
                      <span className="max-sm:text-sm max-md:text-base max-md:block max-md:mt-2">
                        #{orderGroup.orderGroupID}
                      </span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(orderGroup.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-nowrap px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderGroup.orderStatus)}`}>
                    {orderGroup.orderStatus}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5">
                {/* <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Order Details
                </h2> */}
                <div className="space-y-4">
                 {/* <span>{JSON.stringify(orderDetails)}</span> */}
                  {!!orderData?.data?.length &&
                    orderData?.data?.map((item, index) => (
                      <div
                        key={index}
                        className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <div>
                            {/* <h3 className="text-sm font-medium text-gray-500">
                            Product
                          </h3> */}

                            {item.orderStatus === "Cancelled" && (
                              <p
                                className={`mt-1 mb-2 bg-red-100 text-red-800 rounded-xl py-1 px-3 text-xs w-fit`}>
                                Cancelled
                              </p>
                            )}
                            <p className="mt-1 mb-2 max-sm:text-sm text-md text-gray-900 font-bold">
                              {item.title}
                            </p>
                          </div>
                          <div>
                            {[
                              "On Hold",
                              "Pending",
                              "On Progress",
                              "Accepted",
                            ].includes(item.orderStatus) && (
                              <div className="">
                                <button
                                  onClick={() =>
                                    handleCancelOrderItem(item._id)
                                  }
                                  title="Cancel"
                                  disabled={cancellingItemId === item._id}
                                  className={`w-full text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}>
                                  <MdCancel
                                    size={25}
                                    className="text-red-500"
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {item.previewImage && (
                          <div className="">
                            <img
                              style={{
                                backgroundColor: item.previewImage?.bgColor,
                              }}
                              src={item.previewImage?.imageUrl}
                              alt={item.title}
                              className="h-32 w-32 object-contain rounded-md"
                            />
                          </div>
                        )}

                        <div className="mt-4 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-500">
                              Quantity:
                            </h3>
                            <p className="text-sm text-gray-900 font-bold">
                              {item.quantity || 1}
                            </p>
                          </div>
                          {item.color && (
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-500">
                                Color:
                              </h3>
                              <p className="text-sm text-gray-900 font-bold">
                                {item.color}
                              </p>
                            </div>
                          )}
                          {item.size && (
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-500">
                                Size:
                              </h3>
                              <p className="text-sm text-gray-900 font-bold">
                                {item.size}
                              </p>
                            </div>
                          )}
                        </div>

                        {item.orderType === "rent" && (
                          <>
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                <FaCalendarAlt className="mr-2" /> Rental Period
                              </h3>
                              <p className="mt-1 text-sm text-gray-900">
                                {item.rentDays} days
                              </p>
                            </div>
                            {item.pickupDate && (
                              <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">
                                  Pickup Date
                                </h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {formatDate(item.pickupDate)}
                                </p>
                              </div>
                            )}
                            {item.rentReturnDueDate && (
                              <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">
                                  Return Due Date
                                </h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {formatDate(item.rentReturnDueDate)}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Shipping Details
                </h2>
              </div>
              <div className="px-6 py-4 pb-5">
                <div className="">
                  {/* <div> */}
                  {/* <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FaTruck className="mr-2" /> Shipping Method
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize mb-3">
                      {orderGroup.shipmentType?.replace("_", " ") ||
                        "Standard"}
                    </p> */}

                  {/* </div> */}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FaMapMarkerAlt className="mr-2" /> Shipping Address
                    </h3>
                    {orderGroup.address ? (
                      <div className="mt-1 max-sm:text-sm text-md text-gray-900 border border-red-500 bg-red-50 rounded-md p-4 mt-3">
                        <p className="mb-1 font-bold">
                          {orderGroup.address.physicalAddress?.fullName}
                        </p>
                        <p>
                          {orderGroup.address.physicalAddress?.streetName},{" "}
                          {orderGroup.address.physicalAddress?.city}
                        </p>
                        <p>{orderGroup.address.physicalAddress?.postalCode}</p>
                        <p>{orderGroup.address.physicalAddress?.country}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">
                        No address provided
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Payment Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Payment Summary
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-500 flex items-center">
                          <FaMoneyBillWave className="mr-2" /> Payment Method:
                        </h3>
                        <p className="text-sm text-gray-900">
                          {orderGroup.paymentMode},{" "}
                          <span
                            className={`mt-1 text-sm ${orderGroup.paymentStatus === "Success" ? "text-green-600" : "text-yellow-600"}`}>
                            ({orderGroup.paymentStatus})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">MRP</span>
                        <span className="text-sm font-medium">
                          ₹
                          {orderGroup?.pricingDetails?.groupOriginalPrice?.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-medium">
                          ₹
                          {orderGroup?.pricingDetails?.shippingPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 my-3"></div>
                      <div className="flex justify-between py-2">
                        <span className="text-base font-medium">Total</span>
                        <span className="text-base font-bold">
                          ₹
                          {orderGroup?.pricingDetails?.groupFinalOrderPrice?.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {["On Hold", "Pending", "On Progress", "Accepted"].includes(
                orderGroup.orderStatus,
              ) && (
                <div className="mt-4">
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                </div>
              )}

              {orderGroup.trackingLink && (
                <div className="mt-5 w-full">
                  <a
                    href={orderGroup.trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary rounded-md bg-red-50 border border-primary px-8 py-3 w-full">
                    Track Order
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewPage;
