"use client";

// import Navbar from "../../components/Navbar/Navbar";
// import Footer from "../../components/Footer/Footer";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import Order from "../../components/Order/Order";

import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { redirect, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Loading from "../../components/LoadingComponent/Loading";

export default function page() {
  const router = useRouter();
  const productType = "buy";

  const token = useSelector((state) => state.auth.jwtToken);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Items per page

  console.log(orders);

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/orders/l/${productType}`,
        {
          params: {
            page: page - 1, // Your API uses 0-based index
            limit: limit,
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders(response.data.data);
      setTotalPages(response.data.totalPage);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productType) {
      fetchOrders();
    }
  }, [productType]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchOrders(newPage);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Accepted":
        return "bg-blue-100 text-blue-800";
      case "On The Way":
        return "bg-[#ffdfbf] text-[#ff8000]";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "On Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // if (!token) {
  //   console.log("Not token", token);
  //   redirect("/auth/login?redirect=myorders");
  // }

  return (
    <>
      <main className="min-h-[100vh] ml-[3%] mr-[3%] lg:ml-[10%] lg:mr-[10%]">
        <div className="h-fill w-fill ">
          <div className="min-h-screen py-8 pt-3 px-4 sm:px-6 lg:px-8 mt-7">
            <div className="container mx-auto">
              <div className="container mx-auto  mb-6">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Your Orders
                  </span>
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                  Order History
                </h1>
                <p className="text-gray-500 text-sm">
                  View your recent orders and their status
                </p>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              My Order History
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View your recent orders and their status
            </p>
          </div> */}

                {isLoading ? (
                  <Loading />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Preview
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="max-lg:hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            {/* <th className="max-lg:hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th> */}
                            <th className="max-lg:hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="max-md:hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.length > 0 ? (
                            orders.map((order) => (
                              <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <img
                                    src={order.previewImage}
                                    className="w-10 h-10 rounded-md object-cover"
                                    alt={order?.title}
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <p className="">{order.orderGroupID || order._id}</p>
                                  <span
                                    className={`min-md:hidden mt-2 min-md:block px-2 inline-flex text-[13px] leading-5 font-semibold rounded-full ${getStatusColor(
                                      order.orderStatus,
                                    )}`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="max-lg:hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(order.createdAt)}
                                </td>
                                {/* <td className="max-lg:hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                  {order.orderType}
                                </td> */}
                                <td className="max-lg:hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ₹{order.price?.toFixed(2) || "0.00"}
                                </td>
                                <td className="max-md:hidden px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                      order.orderStatus,
                                    )}`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/myorders/view/${order.paymentTxnId}`,
                                      )
                                    }
                                    className="text-primary hover:text-red-500 cursor-pointer">
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-6 py-4 text-center text-sm text-gray-500">
                                No orders found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                              currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}>
                            Previous
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                              currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}>
                            Next
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing page{" "}
                              <span className="font-medium">{currentPage}</span>{" "}
                              of{" "}
                              <span className="font-medium">{totalPages}</span>
                            </p>
                          </div>
                          <div>
                            <nav
                              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                              aria-label="Pagination">
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                  currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                                }`}>
                                <span className="sr-only">Previous</span>
                                <FaChevronLeft
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                              ).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                    currentPage === page
                                      ? "z-10 bg-blue-50 border-blue-500 text-primary"
                                      : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                                  }`}>
                                  {page}
                                </button>
                              ))}
                              <button
                                onClick={() =>
                                  handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                  currentPage === totalPages
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                                }`}>
                                <span className="sr-only">Next</span>
                                <FaChevronRight
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
