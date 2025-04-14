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

const OrderViewPage = ({ params }) => {
  const router = useRouter();
  const { orderTxnId: id } = use(params);

  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/orders/view/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(
        error.response?.data?.message || "Failed to load order details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      console.log("Cancelling order", orderData.orderDetails);
      setIsCancelling(true);
      await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/orders/cancel`,
        {
          orderGroupId: orderData.orderDetails.orderGroupID,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Order cancelled successfully");
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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

  const { orderDetails } = orderData;
  const firstOrderItem = orderDetails.order[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/myorders">
            <span className="inline-flex items-center text-green-900 hover:text-green-800">
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
                      Order #{orderDetails.orderGroupID}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(firstOrderItem.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(firstOrderItem.orderStatus)}`}>
                    {firstOrderItem.orderStatus}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5">
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Order Details
                </h2>
                <div className="space-y-4">
                  {orderDetails.order.map((item, index) => (
                    <div
                      key={index}
                      className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Product
                        </h3>
                        <p className="mt-1 text-sm text-gray-900 font-bold">
                          {item.title}
                        </p>
                      </div>

                      {item.previewImage && (
                        <div className="mt-4">
                          <img
                            src={item.previewImage}
                            alt={item.title}
                            className="h-32 w-32 object-cover rounded-md"
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
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Shipping Details
                </h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FaTruck className="mr-2" /> Shipping Method
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {firstOrderItem.shipmentType?.replace("_", " ") ||
                        "Standard"}
                    </p>
                    {firstOrderItem.trackingLink && (
                      <a
                        href={firstOrderItem.trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:underline">
                        Track Order
                      </a>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FaMapMarkerAlt className="mr-2" /> Shipping Address
                    </h3>
                    {firstOrderItem.address ? (
                      <div className="mt-1 text-sm text-gray-900">
                        <p>{firstOrderItem.address.address.streetName}</p>
                        <p>{firstOrderItem.address.address.postalCode}</p>
                        <p>{firstOrderItem.address.address.country}</p>
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
                          {firstOrderItem.paymentMode}
                        </p>
                      </div>

                      <p
                        className={`mt-1 text-sm ${orderDetails.paymentStatus === "Success" ? "text-green-600" : "text-yellow-600"}`}>
                        ({orderDetails.paymentStatus})
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-medium">
                          ₹{orderDetails.subTotalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-medium">
                          ₹{orderDetails.shippingPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 my-3"></div>
                      <div className="flex justify-between py-2">
                        <span className="text-base font-medium">Total</span>
                        <span className="text-base font-bold">
                          ₹{orderDetails.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {["On Hold", "Pending", "On Progress", "Accepted"].includes(
                firstOrderItem.orderStatus
              ) && (
                <div className="mt-4">
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      isCancelling ? "opacity-50 cursor-not-allowed" : ""
                    }`}>
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
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
