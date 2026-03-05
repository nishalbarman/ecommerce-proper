import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/index";
import { Image, OrderGroup, PaymentSummary } from "../../types";
import stopSign from "../../assets/stop-sign.png";
import cAxios from "../../axios/cutom-axios";
import { Link } from "react-router-dom";
import { MdCancel } from "react-icons/md";
import { GiStopSign } from "react-icons/gi";
import { BsCash } from "react-icons/bs";
import { TbMail, TbNotes, TbPhone, TbRefresh, TbUser } from "react-icons/tb";

import {
  orderApi,
  useCancelOrderItemMutation,
  useGetOrderGroupDetailsQuery,
} from "@/redux";

import { FaIndianRupeeSign } from "react-icons/fa6";

type StatusStyleValue = {
  backgroundColor: string;
  border: string;
  color: string;
};

const statusStyles: { [key: string]: StatusStyleValue } = {
  OnProgress: {
    backgroundColor: "#f0ffff",
    border: "1px solid #2AAABF",
    color: "#2AAABF",
  },
  Accepted: {
    backgroundColor: "#f5fff6",
    border: "1px solid #79E7A8",
    color: "#36664c",
  },
  Delivered: {
    backgroundColor: "#f0e6ff",
    border: "1px solid #754db0",
    color: "#754db0",
  },
  OnHold: {
    backgroundColor: "#fff6c7",
    border: "1px solid #ebb434",
    color: "#7a5c14",
  },
  Cancelled: {
    backgroundColor: "#f7eae9",
    border: "1px solid #db3125",
    color: "#a11b12",
  },
  OnTheWay: {
    backgroundColor: "#b1ebf0",
    border: "1px solid #2e7e85",
    color: "#2e7e85",
  },
  PickUpReady: {
    backgroundColor: "#f0e6ff",
    border: "1px solid #754db0",
    color: "#754db0",
  },
  Pending: {
    backgroundColor: "#f0ffff",
    border: "1px solid #2AAABF",
    color: "#2AAABF",
  },
  ["Unable To Fulfill"]: {
    backgroundColor: "#f7eae9",
    border: "1px solid #db3125",
    color: "#a11b12",
  },
};

interface OrderStatusProps {
  status: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const style: StatusStyleValue =
    statusStyles[status.replace(/\s+/g, "")] ||
    statusStyles["Unable To Fulfill"];

  return (
    <div
      style={{
        backgroundColor: style.backgroundColor,
        border: style.border,
      }}
      className="flex justify-center px-2 py-1 rounded-md">
      <span
        style={{
          color: style.color,
        }}
        className="text-xs font-bold">
        {status}
      </span>
    </div>
  );
};

function ViewSingleOrder() {
  const { jwtToken } = useAppSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsOrderLoading] = useState(true);

  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (!!searchParams.get("groupId"))
  //     setGroupOrderId(searchParams.get("groupId"));
  // }, [searchParams]);

  const [isGroupOrderFetching, setIsGroupOrderFetching] = useState(true);
  // const [orderGroup, setorderGroup] = useState<OrderGroup>();

  // const fetchorderGroup = async () => {
  //   try {
  //     if (!groupOrderId) return;
  //     setIsGroupOrderFetching(true);
  //     const response = await cAxios.get(
  //       `${process.env.VITE_APP_API_URL}/orders/details/${groupOrderId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       },
  //     );
  //     setorderGroup(response.data.orderGroup);

  //     console.log("Grouped order", response.data.orderGroup);
  //   } catch (error: any) {
  //     toast.error(error.response?.message || error.message);
  //     console.error(error);
  //   } finally {
  //     setIsGroupOrderFetching(false);
  //     setIsOrderLoading(false);
  //   }
  // };

  // Fix 1: type groupOrderId properly
  const [groupOrderId, setGroupOrderId] = useState<string>(
    searchParams.get("groupId") ?? "",
  );

  // Fix 2: use skip correctly with empty string
  const {
    data: orderGroup,
    error: orderGroupRtkError,
    isLoading: isOrderGroupLoading,
    isSuccess: isOrderGroupSuccess,
  } = useGetOrderGroupDetailsQuery(groupOrderId, {
    // skip: !groupOrderId, // skips when empty string — this is fine
  });

  useEffect(() => {
    if (orderGroup?.trackingUrl) {
      setTrackingUrl(orderGroup?.trackingUrl || "");
    }
  }, [orderGroup]);

  console.log("Order Group  --> ", orderGroup);

  const [summary, setSummary] = useState<PaymentSummary | undefined>();

  useEffect(() => {
    const fetchPaymentSummary = async () => {
      try {
        if (!groupOrderId) return;
        const response = await cAxios.get(
          `${process.env.VITE_APP_API_URL}/payment/summary/${groupOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );
        setSummary(response.data?.paymentTransaction);
      } catch (error: any) {
        toast.error(error.response?.message || error.message);
        console.error(error);
      } finally {
        setIsOrderLoading(false);
      }
    };

    fetchPaymentSummary();
  }, [groupOrderId]);

  const [orderUpdatableStatus, setOrderUpdatableStatus] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const handleUpdateOrderStatus = async () => {
    if (!orderUpdatableStatus) return toast.info("Order status not selected");
    const toastId = toast.loading("Please wait.. sending your request..");
    try {
      if (orderUpdatableStatus === "On The Way" && !trackingUrl)
        return toast.update(toastId, {
          render: "Fill the order tracking link",
          type: "info",
          isLoading: false,
          autoClose: 5000,
        });

      const response = await cAxios.patch(
        `${process.env.VITE_APP_API_URL}/orders/update-status`,
        {
          order: groupOrderId,
          orderStatus: orderUpdatableStatus,
          trackingUrl: trackingUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      dispatch(
        orderApi.util.invalidateTags([{ type: "Order", id: groupOrderId }]),
      );
      toast.update(toastId, {
        render: response.data.message || "Order status updated",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error: any) {
      toast.update(toastId, {
        render: error.data.message || "Order status updation failed",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });

      console.error(error);
    }
  };

  const [cancelOrderItem] = useCancelOrderItemMutation();

  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

  const handleCancelOrderItem = async (
    itemId: string,
    orderGroupID: string,
  ) => {
    if (!window.confirm("Are you sure you want to cancel this item?")) return;

    try {
      setCancellingItemId(itemId);

      await cancelOrderItem({ orderItemId: itemId, orderGroupID }).unwrap();

      toast.success("Order item cancelled");

      // (); // refresh data
    } catch (error) {
      console.error("Failed to cancel order item", error);
      toast.error(error?.data || "Failed to cancel order item");
    } finally {
      setCancellingItemId(null);
    }
  };

  console.log("Group Order Details --> ", orderGroup);
  console.log("Payment Summary --> ", summary);

  console.log("Grouped order", orderGroup);
  // return null;
  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Track Order</h1>
      </div>
      <div>
        {
          <div className="bg-white rounded-lg shadow-md p-6 mb-2">
            <form
              onSubmit={(e: BaseSyntheticEvent) => {
                const id = e.target.groupId.value.trim();
                setGroupOrderId(id); // ← keep local state in sync
                setSearchParams({ groupId: id });
              }}>
              <label htmlFor="groupId" className="block font-bold mb-2">
                Order Group ID
              </label>
              <div className="flex justify-center items-center mb-4">
                <input
                  id="groupId"
                  type="text"
                  placeholder="Order Group Id"
                  className="border border-gray-300 rounded-l-md px-4 py-2 w-full"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md">
                  Search
                </button>
              </div>
            </form>
          </div>
        }
      </div>

      <div>
        {!groupOrderId ? (
          <div className="text-center my-4">
            Please provide a group ID to view order details.
          </div>
        ) : isOrderGroupLoading || isLoading ? (
          // isLoading here is your summary loading state
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : isOrderGroupSuccess && orderGroup && summary ? (
          <>
            {!!Object.keys(orderGroup).length &&
            !!Object.keys(summary).length ? (
              <>
                <div className="h-px bg-gray-300 my-4"></div>
                <div className="text-lg mb-4">
                  <span>GroupID </span>#<strong>{groupOrderId}</strong>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                      <div className="grid grid-cols-1 gap-4 sticky top-6">
                        {orderGroup?.orders?.map((order) => (
                          <div
                            key={order._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden relative border">
                            {/* {order.orderStatus === "Cancelled" && (
                              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-10 flex-col z-10">
                                <GiStopSign size={100} color="red" />
                                <strong className="text-black bg-white rounded-md px-2 font-bold text-lg transform text-center text-shadow">
                                  This order has been cancelled, so you are not
                                  supposed to fullfill this order.
                                </strong>
                              </div>
                            )} */}
                            <div className="bg-white px-4 py-3 flex justify-between items-center border border-t">
                              <div>
                                <span className="text-gray-500">Order #</span>
                                <span>{order._id}</span>
                              </div>
                              <div className="flex flex-row justify-between items-center gap-1">
                                <OrderStatus status={order.orderStatus} />

                                {order?.orderStatus === "Cancelled" &&
                                  orderGroup.orderStatus !== "Cancelled" && (
                                    <div className="flex items-center absolute bottom-2 right-2 gap-1">
                                      <button
                                        onClick={() =>
                                          // handleCancelOrderItem(
                                          //   order._id,
                                          //   order.orderGroupID,
                                          // )
                                          console.log(
                                            "Refund for order item",
                                            order._id,
                                          )
                                        }
                                        title="Refund"
                                        // disabled={cancellingItemId === order._id}
                                        className={`border border-blue-400 px-2 py-2 rounded-md w-fit text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}>
                                        <BsCash
                                          size={10}
                                          className="text-red-500"
                                        />
                                        <span className="ml-1 text-black">
                                          Process Refund
                                        </span>
                                      </button>
                                    </div>
                                  )}

                                {order?.orderStatus !== "Cancelled" &&
                                  order?.orderStatus !==
                                    "Unable To Fulfill" && (
                                    <div className="flex items-center">
                                      <button
                                        onClick={() =>
                                          handleCancelOrderItem(
                                            order._id,
                                            order.orderGroupID,
                                          )
                                        }
                                        title="Cancel"
                                        // disabled={cancellingItemId === order._id}
                                        className={`w-fit text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}>
                                        <MdCancel
                                          size={25}
                                          className="text-red-500"
                                        />
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </div>

                            <div
                              key={order._id}
                              className="relative bg-white rounded-xl transition-shadow duration-300 overflow-hidden mb-2">
                              {/* Main Cart Item */}
                              <div className="flex flex-col md:flex-row p-4 gap-4">
                                {/* Product Image */}
                                <div
                                  style={{
                                    backgroundColor:
                                      order?.previewImage?.bgColor,
                                  }}
                                  className="w-full sm:w-32 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                                  <Link
                                    to={`/product/view?productSlug=${order?.productSlug || order?.title?.toLowerCase().replace(/\s+/g, "-")}`}>
                                    <img
                                      className="w-full h-32 object-contain hover:scale-105 transition-transform duration-300 select-none"
                                      src={order?.previewImage?.imageUrl}
                                      alt={order?.title}
                                      draggable={false}
                                    />
                                  </Link>
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col">
                                  {/* {order.orderStatus === "Cancelled" && (
                                    <p
                                      className={`absolute top-1 right-1 mt-1 mb-2 bg-red-100 text-red-800 rounded-xl py-1 px-3 text-xs w-fit`}>
                                      Cancelled
                                    </p>
                                  )} */}
                                  <div className="flex justify-between items-start">
                                    <Link
                                      to={`/products/view?productSlug=${order?._id}`}
                                      className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                      {order?.title}
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
                                      ₹{order?.discountedPrice}
                                    </span>
                                    {!!order?.originalPrice && (
                                      <>
                                        <span className="text-gray-500 ml-2 line-through">
                                          ₹{order?.originalPrice}
                                        </span>
                                        <span className="text-green-600 ml-2 text-sm">
                                          Save ₹
                                          {order?.originalPrice -
                                            order?.discountedPrice}
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {/* Variant Info */}
                                  {order?.size && order?.color && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                        <span className="text-gray-600">
                                          Size:
                                        </span>
                                        <span className="font-medium ml-1">
                                          {order.size}
                                        </span>
                                      </div>
                                      <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                        <span className="text-gray-600">
                                          Color:
                                        </span>
                                        <span className="font-medium ml-1">
                                          {order.color}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="mt-4 flex flex-wrap items-center gap-3">
                                    {/* {order.size && order.color && (
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
                                            Math.max(1, order.quantity - 1),
                                          )
                                        }
                                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                        disabled={order.quantity <= 1}>
                                        -
                                      </button> */}
                                      <span className="px-4 py-2 text-center min-w-[40px]">
                                        Quantity: {order?.quantity}
                                      </span>
                                      {/* <button
                                        onClick={() =>
                                          handleQuantityChange(
                                            order.quantity + 1,
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
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="xl:sticky xl:top-6 space-y-6">
                        <div className="bg-white rounded-lg shadow-md border">
                          <div className="flex justify-between bg-white p-4 pb-0 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <TbNotes size={20} />
                              <strong className="mr-1">Update Status</strong>
                            </div>

                            <div className="flex items-center gap-2">
                              <OrderStatus status={orderGroup.orderStatus} />
                              <button
                                onClick={() => {
                                  //? TODO needs to implement it later
                                  console.log("reset order info todo");
                                  // resetOrderInfo();
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm cursor-pointer h-full">
                                <TbRefresh className="animate-spin" />
                                <span>Reset Order</span>
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            {orderGroup.orderType === "rent" && (
                              <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
                                <div>
                                  This is a rent order, so collect cash upon
                                  pickup.
                                </div>
                              </div>
                            )}

                            {orderGroup.orderType === "buy" && (
                              <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
                                <div>
                                  This is a buy order, so make sure that payment
                                  has been received before proceeding.
                                </div>
                              </div>
                            )}
                            {orderGroup.orderStatus === "Cancelled" ||
                            orderGroup.orderStatus === "Unable To Fulfill" ? (
                              <div className="">
                                <div className="flex items-center border-gray-200 w-full mb-4 border border-gray-200 ">
                                  <FaIndianRupeeSign
                                    size={18}
                                    className="w-10"
                                  />
                                  <input
                                    className=" border-l border-gray-200 h-11 py-2 px-2 rounded-md outline-none  w-full"
                                    placeholder="Enter refund amount"
                                    defaultValue={
                                      orderGroup?.pricingDetails
                                        ?.groupFinalOrderPrice || 0
                                    }
                                  />
                                </div>

                                <button
                                  onClick={() =>
                                    // handleCancelOrderItem(
                                    //   order._id,
                                    //   order.orderGroupID,
                                    // )
                                    console.log("Refund for order item")
                                  }
                                  title="Refund"
                                  // disabled={cancellingItemId === order._id}
                                  className={`border border-blue-400 bg-[#3B83F7] px-4 py-2 rounded-md w-fit text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}>
                                  <BsCash size={15} className="text-white" />
                                  <span className="ml-2 text-white font-bold">
                                    Process Refund
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <div className="mt-2">
                                <strong>Update status of the order</strong>
                                <div className="mt-2">
                                  <select
                                    onChange={(e) =>
                                      setOrderUpdatableStatus(e.target.value)
                                    }
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue={orderGroup.orderStatus}>
                                    <option value="">Select Status</option>
                                    {orderGroup.orderType === "rent" && (
                                      <option value={"On Progress"}>
                                        On Progress
                                      </option>
                                    )}
                                    <option value={"Accepted"}>Accept</option>
                                    <option value={"Unable To Fulfill"}>
                                      Reject
                                    </option>
                                    <option value={"On The Way"}>
                                      On The Way
                                    </option>
                                    {orderGroup.orderType === "buy" && (
                                      <option value={"Delivered"}>
                                        Delivered
                                      </option>
                                    )}
                                    {orderGroup.orderType === "rent" && (
                                      <option value={"PickUp Ready"}>
                                        PickUp Ready
                                      </option>
                                    )}
                                  </select>

                                  {orderUpdatableStatus === "On The Way" && (
                                    <>
                                      <div className="mt-4">
                                        <label
                                          htmlFor="trackingUrl"
                                          className="block font-bold mb-2">
                                          Tracking Url
                                        </label>
                                        <input
                                          id="trackingUrl"
                                          type="url"
                                          placeholder="https://example.com/id-13"
                                          value={trackingUrl}
                                          onChange={(e) =>
                                            setTrackingUrl(e.target.value)
                                          }
                                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {orderUpdatableStatus ===
                                    "Unable To Fulfill" && (
                                    <>
                                      <div className="mt-4">
                                        <label
                                          htmlFor="unfulfillmentReason"
                                          className="block font-bold mb-2">
                                          Reason for unfulfillment
                                        </label>
                                        <textarea
                                          id="unfulfillmentReason"
                                          placeholder="Write a proper reason for unfulfillment. "
                                          // value={unfulfillmentReason}
                                          // onChange={(e) => setUnfulfillmentReason(e.target.value)}
                                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h:70"
                                        />
                                      </div>
                                    </>
                                  )}

                                  <button
                                    onClick={handleUpdateOrderStatus}
                                    className="mt-4 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    UPDATE
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border">
                          <div className="bg-white p-4 pb-0">
                            <div className="flex justify-between items-center">
                              <strong>Payment Summary</strong>
                            </div>
                          </div>
                          <div className="p-4">
                            {orderGroup.orderType === "rent" && (
                              <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
                                <div>
                                  This is a rent order, so collect cash upon
                                  pickup.
                                </div>
                              </div>
                            )}

                            {orderGroup.orderType === "buy" && (
                              <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
                                <div>
                                  This is a buy order, so make sure that payment
                                  has been received before proceeding.
                                </div>
                              </div>
                            )}

                            <div className="h-px bg-gray-300 my-4"></div>

                            {summary !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between">
                                  <span>MRP</span>
                                  <span>
                                    ₹{summary?.pricingDetails?.originalPrice}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Discount</span>
                                  <span>
                                    ₹{summary?.pricingDetails?.saleDiscount}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>After Discount</span>
                                  <span>
                                    ₹{summary?.pricingDetails?.discountedPrice}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Coupon Discount</span>
                                  <span>
                                    ₹
                                    {
                                      summary?.pricingDetails
                                        ?.couponDiscountGiven
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping Price</span>
                                  <span>
                                    ₹
                                    {summary?.pricingDetails?.shippingPrice
                                      ? summary?.pricingDetails?.shippingPrice
                                      : "FREE"}
                                  </span>
                                </div>
                                <div className="flex justify-between font-bold">
                                  <span>Total</span>
                                  <span>
                                    ₹{summary?.pricingDetails?.finalOrderPrice}
                                  </span>
                                </div>

                                {orderGroup.orderType === "buy" && (
                                  <>
                                    <div className="h-px bg-gray-300 my-4"></div>
                                    <div className="flex justify-between font-bold">
                                      <span>Payment Status</span>
                                      <div className="flex flex-col justify-between">
                                        {/* {summary.paymentStatus === "Pending" && (
                                          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-1 rounded-md text-center font-bold">
                                            Pending
                                          </div>
                                        )}
                                        {summary.paymentStatus === "Paid" && (
                                          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded-md text-center font-bold">
                                            Paid
                                          </div>
                                        )} */}
                                        {summary?.paymentStatus && (
                                          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-3 py-1 rounded-md text-center font-bold">
                                            {summary.paymentStatus}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border">
                          <div className="bg-white p-4 pb-0">
                            <div>
                              <strong>Customer</strong>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <TbNotes size={20} />
                              <span>
                                {orderGroup.totalDocumentCount} Order(s)
                              </span>
                            </div>
                            <div className="h-px bg-gray-300 my-4"></div>
                            <div>
                              <strong>Ordered By</strong>
                              <div className="mt-2 flex items-center">
                                <TbUser size={20} className="text-gray-500" />
                                <span className="ml-2">
                                  {orderGroup?.address?.fullAddress?.fullName}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                <TbMail size={19} className="text-gray-500" />
                                <span className="ml-2">
                                  {orderGroup?.address?.fullAddress?.email ||
                                    "No Email Available"}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                <TbPhone size={20} className="text-gray-500" />
                                <span className="ml-2">
                                  {orderGroup?.address?.fullAddress?.phone}
                                </span>
                              </div>
                            </div>

                            {!!orderGroup?.address?.fullAddress && (
                              <>
                                <div className="h-px bg-gray-300 my-4"></div>
                                <div>
                                  <strong>Delivery Address</strong>
                                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-3 rounded mt-2">
                                    <p>
                                      Full Name:{" "}
                                      <span className="font-bold">
                                        {`${orderGroup?.address?.fullAddress?.fullName}`}
                                      </span>
                                    </p>
                                    <p>
                                      Contact Number:{" "}
                                      <span className="font-bold">
                                        {`${orderGroup?.address?.fullAddress?.phone}`}
                                      </span>
                                    </p>
                                    <p>
                                      Full Address:{" "}
                                      <span className="font-bold">
                                        {`${orderGroup?.address?.fullAddress?.streetName}, ${orderGroup?.address?.fullAddress?.landmark}, ${orderGroup?.address?.fullAddress?.city}, ${orderGroup?.address?.fullAddress?.postalCode}, ${orderGroup?.address?.fullAddress?.state},  ${orderGroup?.address?.fullAddress?.country}`}
                                      </span>
                                    </p>
                                    <p>
                                      Road:{" "}
                                      {
                                        orderGroup?.address?.fullAddress
                                          ?.streetName
                                      }
                                    </p>
                                    <p>
                                      Landmark:{" "}
                                      {orderGroup?.address?.fullAddress
                                        ?.landmark
                                        ? orderGroup?.address?.fullAddress
                                            ?.landmark
                                        : "N/A"}
                                    </p>
                                    <p>
                                      Postal Code:{" "}
                                      {
                                        orderGroup?.address?.fullAddress
                                          ?.postalCode
                                      }
                                    </p>
                                    <p>
                                      City:{" "}
                                      {orderGroup?.address?.fullAddress?.city}
                                    </p>
                                    <p>
                                      State:{" "}
                                      {orderGroup?.address?.fullAddress?.state}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center my-4">
                Please provide a group ID to view order details.
              </div>
            )}
          </>
        ) : orderGroupRtkError ? (
          <div className="text-center my-4 text-red-500">
            Failed to load order. Please check the Group ID.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ViewSingleOrder;
