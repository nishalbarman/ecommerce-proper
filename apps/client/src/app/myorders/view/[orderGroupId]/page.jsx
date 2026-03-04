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
  FaAddressCard,
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

  console.log("What is order data", orderData);

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder({
        orderGroupId: orderGroup?.orderGroupID,
      }).unwrap();

      toast.success("Order cancelled successfully");

      refetch(); // refresh data
    } catch (error) {
      toast.error(error?.data || "Failed to cancel order");
    }
  };

  const [cancelOrderItem] = useCancelOrderItemMutation();
  const [cancellingItemId, setCancellingItemId] = useState(null);

  const handleCancelOrderItem = async (itemId, orderGroupID) => {
    if (!window.confirm("Are you sure you want to cancel this item?")) return;

    try {
      setCancellingItemId(itemId);

      await cancelOrderItem({ orderItemId: itemId, orderGroupID }).unwrap();

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
          <Link className="text-blue-600 hover:underline" href="/orders">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 max-sm:px-3 max-md:px-5 lg:px-70">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link href="/myorders">
            <span className="inline-flex items-center text-black hover:text-black">
              <FaArrowLeft className="mr-2" /> Back to Orders
            </span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-sm:gap-1">
          {/* Left Column - Order Details */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Order{" "}
                      <span className="max-sm:text-sm max-md:text-base max-md:block max-md:mt-2">
                        #{orderGroup?.orderGroupID?.toUpperCase()}
                      </span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(orderGroup?.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-nowrap px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderGroup?.orderStatus)}`}>
                    {orderGroup?.orderStatus}
                  </span>
                </div>
              </div>

              <div className="px-6 py-5 max-sm:px-2 max-sm:py-4">
                {/* <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Order Details
                </h2> */}
                <div className="space-y-4">
                  {/* <span>{JSON.stringify(orderDetails)}</span> */}
                  {!!orderData?.data?.length &&
                    orderData?.data?.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="relative bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden mb-4">
                        <div>
                          {[
                            "On Hold",
                            "Pending",
                            "On Progress",
                            "Accepted",
                          ].includes(item.orderStatus) && (
                            <div className="">
                              <button
                                onClick={() => handleCancelOrderItem(item._id, item.orderGroupID)}
                                title="Cancel"
                                disabled={cancellingItemId === item._id}
                                className={`absolute top-1 right-1 w-fit text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <MdCancel size={25} className="text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Main Cart Item */}
                        <div className="flex flex-col md:flex-row p-4 gap-4">
                          {/* Product Image */}
                          <div
                            style={{
                              backgroundColor: item?.previewImage?.bgColor,
                            }}
                            className="w-full sm:w-32 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                            <Link
                              href={`/products/view/${item?.productSlug || item?.title?.toLowerCase().replace(/\s+/g, "-")}}`}>
                              <img
                                className="w-full h-32 object-contain hover:scale-105 transition-transform duration-300 select-none"
                                src={item?.previewImage?.imageUrl}
                                alt={item?.title}
                                draggable={false}
                              />
                            </Link>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col">
                            {item.orderStatus === "Cancelled" && (
                              <p
                                className={`absolute top-1 right-1 mt-1 mb-2 bg-red-100 text-red-800 rounded-xl py-1 px-3 text-xs w-fit`}>
                                Cancelled
                              </p>
                            )}
                            <div className="flex justify-between items-start">
                              <Link
                                href={`/products/view/${item?._id}`}
                                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                {item?.title}
                              </Link>
                              {/* <button
                                    onClick={handleRemoveFromCart}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                                    <IoIosClose size={24} />
                                  </button> */}
                            </div>

                            {/* Price Section */}
                            <div className="mt-2">
                              <span className="text-xl font-bold text-gray-900">
                                ₹{item?.discountedPrice}
                              </span>
                              {!!item?.originalPrice && (
                                <>
                                  <span className="text-gray-500 ml-2 line-through">
                                    ₹{item?.originalPrice}
                                  </span>
                                  <span className="text-green-600 ml-2 text-sm">
                                    Save ₹
                                    {item?.originalPrice -
                                      item?.discountedPrice}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Variant Info */}
                            {item?.size && item?.color && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                  <span className="text-gray-600">Size:</span>
                                  <span className="font-medium ml-1">
                                    {item.size}
                                  </span>
                                </div>
                                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                  <span className="text-gray-600">Color:</span>
                                  <span className="font-medium ml-1">
                                    {item.color}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              {/* {(item.size && item.color) && (
                                    <button
                                      onClick={() =>
                                        variantModalRef.current?.classList.remove(
                                          "hidden",
                                        )
                                      }
                                      className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer h-full">
                                      Change option
                                      <FiChevronDown size={16} />
                                    </button>
                                  )} */}

                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                {/* <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          Math.max(1, item.quantity - 1),
                                        )
                                      }
                                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                      disabled={item.quantity <= 1}>
                                      -
                                    </button> */}
                                <span className="px-4 py-2 text-center min-w-[40px]">
                                  Quantity: {item?.quantity}
                                </span>
                                {/* <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          item.quantity + 1,
                                        )
                                      }
                                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed">
                                      +
                                    </button> */}
                              </div>

                              {/* <button
                                    onClick={handleAddToWishlist}
                                    className="ml-auto flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-pink-500 transition-colors cursor-pointer">
                                    <FiHeart
                                      size={16}
                                      className={
                                        wishlistMappedItems?.hasOwnProperty(
                                          product?._id,
                                        )
                                          ? "fill-pink-500 text-pink-500"
                                          : ""
                                      }
                                    />
                                    Move to wishlist
                                  </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Payment Summary */}
          <div className="lg:w-100 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
                <div className="px-6 py-4 max-sm:px-3 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Shipping Details
                  </h2>
                </div>
                <div className="px-6 max-sm:px-3 py-4 pb-5">
                  <div className="">
                    {/* <div> */}
                    {/* <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FaTruck className="mr-2" /> Shipping Method
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize mb-3">
                      {orderGroup?.shipmentType?.replace("_", " ") ||
                        "Standard"}
                    </p> */}

                    {/* </div> */}

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <FaMapMarkerAlt className="mr-2" /> Shipping Address
                      </h3>
                      {orderGroup?.address ? (
                        <div className="mt-1 max-sm:text-sm text-md text-gray-900 border border-red-500 bg-red-50 rounded-md p-4 mt-3">
                          <p className="mb-1 font-bold">
                            {orderGroup?.address.fullAddress?.fullName},{" "}
                            <span className="font-normal">
                              {orderGroup?.address.fullAddress?.phone}
                            </span>
                          </p>
                          <div>
                            <p>
                              {orderGroup?.address.fullAddress?.streetName},{" "}
                              {orderGroup?.address.fullAddress?.city}
                            </p>
                            <p>{orderGroup?.address.fullAddress?.postalCode}</p>
                            <p>{orderGroup?.address.fullAddress?.country}</p>
                          </div>

                          <p></p>
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

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 max-sm:px-3 py-4 border-b border-gray-200">
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
                          {orderGroup?.paymentMode},{" "}
                          <span
                            className={`mt-1 text-sm ${orderGroup?.paymentStatus === "Success" ? "text-green-600" : "text-yellow-600"}`}>
                            ({orderGroup?.paymentStatus})
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
                      {orderGroup?.pricingDetails?.groupSaleDiscount > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600 text-green-700">
                            Discount
                          </span>
                          <span className="text-sm font-medium text-green-700">
                            -₹
                            {orderGroup?.pricingDetails?.groupSaleDiscount?.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">
                          After Discount
                        </span>
                        <span className="text-sm font-medium">
                          ₹
                          {orderGroup?.pricingDetails?.groupDiscountedPrice?.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                      {orderGroup?.pricingDetails?.couponDiscountGiven > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600 text-green-700">
                            Coupon Discount
                          </span>
                          <span className="text-sm font-medium text-green-700">
                            -₹
                            {orderGroup?.pricingDetails?.couponDiscountGiven?.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-medium">
                          {orderGroup?.pricingDetails?.shippingPrice > 0 ? (
                            `₹${orderGroup?.pricingDetails?.shippingPrice.toFixed(
                              2,
                            )}`
                          ) : (
                            <span className="font-bold">FREE</span>
                          )}
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
                orderGroup?.orderStatus,
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

              {orderGroup?.trackingLink && (
                <div className="mt-5 w-full">
                  <a
                    href={orderGroup?.trackingLink}
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
