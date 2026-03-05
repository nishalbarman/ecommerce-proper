import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/index";
import { OrderGroup } from "../../types";
import cAxios from "../../axios/cutom-axios";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";

type PaymentStatus = "all" | "Pending" | "Paid" | "Failed";
type OrderStatusFilter =
  | "all"
  | "Pending"
  | "Accepted"
  | "On Progress"
  | "On Hold"
  | "On The Way"
  | "Delivered"
  | "Rejected"
  | "Cancelled"
  | "PickUp Ready";

const OrderList = () => {
  const navigate = useNavigate();
  const { jwtToken } = useAppSelector((state) => state.auth);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("all");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>("all");

  const [data, setData] = useState<OrderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const totalPages = Math.ceil(rowCount / pagination.pageSize);

  const fetchOrderData = async () => {
    setIsLoading(true);

    const url = new URL("/orders/list", process.env.VITE_APP_API_URL);

    url.searchParams.set("page", `${pagination.pageIndex}`);
    url.searchParams.set("limit", `${pagination.pageSize}`);

    if (paymentStatus !== "all")
      url.searchParams.set("paymentStatus", paymentStatus);

    if (orderStatusFilter !== "all")
      url.searchParams.set("orderStatus", orderStatusFilter);

    try {
      const res: {
        data: { groupOrderData: OrderGroup[]; pagination: any };
      } = await cAxios.get(url.href, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      setData(res.data?.groupOrderData || []);
      setRowCount(res.data?.pagination?.totalItems || 0);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrderData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    paymentStatus,
    orderStatusFilter,
  ]);

  const getBadgeStyle = (text: string) => {
    if (["Delivered", "Completed", "PickUp Ready", "Paid"].includes(text))
      return "bg-green-200 border border-green-400";
    if (["Pending", "On Progress", "Accepted", "On Hold"].includes(text))
      return "bg-orange-200 border border-orange-400";
    if (["Cancelled", "Rejected", "Failed"].includes(text))
      return "bg-red-200 border border-red-400";
    return "bg-blue-200 border border-blue-400";
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-6">Orders Management</h1>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Order Status
            </label>
            <select
              value={orderStatusFilter}
              onChange={(e) =>
                setOrderStatusFilter(e.target.value as OrderStatusFilter)
              }
              className="w-full border rounded-md p-2">
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="On Progress">On Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="On The Way">On The Way</option>
              <option value="Delivered">Delivered</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="PickUp Ready">PickUp Ready</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value as PaymentStatus)
              }
              className="w-full border rounded-md p-2">
              <option value="all">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Preview
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Order Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No Orders Found
                  </td>
                </tr>
              ) : (
                data.map((order) => (
                  <tr
                    key={order.orderGroupID}
                    className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">
                      <div className="w-24 h-24">
                        <div className="relative w-full h-full">
                          <ShowPreviewImage
                            previewImages={order?.previewImages || []}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {order.orderGroupID.toUpperCase()}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold ${getBadgeStyle(
                          order.orderStatus,
                        )}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold ${getBadgeStyle(
                          order.paymentStatus,
                        )}`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      ₹
                      {order.pricingDetails?.groupFinalOrderPrice?.toLocaleString() ||
                        "0"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate(`/orders/view?groupId=${order.orderGroupID}`)
                        }
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md">
                        <FaEye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm font-medium">
            Page {pagination.pageIndex + 1} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.pageIndex === 0}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
              <FaChevronLeft />
            </button>

            <button
              disabled={pagination.pageIndex + 1 >= totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;

const ShowPreviewImage = ({ previewImages }) => {
  const length = previewImages?.length || 0;
  switch (length) {
    case 1:
      return (
        <div className="grid grid-cols-1 grid-rows-1 gap-1 w-full h-full">
          <img
            src={previewImages?.[0]?.imageUrl}
            className="select-none w-full h-full object-cover rounded"
            draggable={false}
          />
        </div>
      );
    case 2:
      return (
        <div className="grid grid-cols-2 grid-rows-1 gap-1 w-full h-full">
          {previewImages?.slice(0, 2).map((item, index) => {
            return (
              <img
                key={index}
                src={item.imageUrl}
                draggable={false}
                className="select-none w-full h-full object-cover rounded"
              />
            );
          })}
        </div>
      );
    case 3:
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
          {previewImages?.slice(0, 3).map((item, index) => (
            <img
              key={index}
              src={item.imageUrl}
              draggable={false}
              className="select-none w-full h-full object-cover rounded"
            />
          ))}
          <div className="w-full h-full bg-black/60 flex items-center justify-center rounded grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
            {previewImages?.slice(0, 3).map((item, index) => (
              <img
                key={index}
                src={item.imageUrl}
                draggable={false}
                className="select-none w-full h-full object-cover rounded"
              />
            ))}
            <div className="w-full h-full bg-black/60 flex items-center justify-center rounded grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
              {previewImages?.slice(0, 3).map((item, index) => (
                <img
                  key={index}
                  src={item.imageUrl}
                  draggable={false}
                  className="select-none w-full h-full object-cover rounded"
                />
              ))}
              <div className="w-full h-full bg-black/60 flex items-center justify-center rounded grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                {previewImages?.slice(0, 3).map((item, index) => (
                  <img
                    key={index}
                    src={item.imageUrl}
                    draggable={false}
                    className="select-none w-full h-full object-cover rounded"
                  />
                ))}
                <div className="w-full h-full bg-black/60 flex items-center justify-center rounded grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                  {previewImages?.slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={item.imageUrl}
                      draggable={false}
                      className="select-none w-full h-full object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
          {previewImages
            ?.slice(0, 4)
            .map(
              (item: { imageUrl: string; bgColor: string }, index: number) => {
                const totalImages = previewImages.length;
                const extraCount = totalImages - 4;

                const isLastVisible = index === 3;
                const showOverlay = isLastVisible && extraCount > 0;

                return (
                  <div key={index} className="relative w-full h-full">
                    <img
                      src={item.imageUrl}
                      draggable={false}
                      className="select-none w-full h-full object-cover rounded"
                    />

                    {showOverlay && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                        <span className="text-white text-xs font-bold select-none cursor-normal">
                          +{extraCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              },
            )}
        </div>
      );
  }
};
