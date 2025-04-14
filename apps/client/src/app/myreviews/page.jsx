"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FaStar,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const MyFeedbackPage = () => {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Feedbacks per page

  const fetchFeedbacks = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks/all`,
        {
          params: {
            page,
            limit,
          },
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      setFeedbacks(data.data || []);
      // Calculate total pages based on response (you might need to adjust this based on your API)
      setTotalPages(Math.ceil(response.data.totalCount / limit) || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error(error.response?.data?.message || "Failed to load feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?"))
      return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks/${feedbackId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Feedback deleted successfully");
      fetchFeedbacks(currentPage); // Refresh current page
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error(error.response?.data?.message || "Failed to delete feedback");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${i < rating ? "text-yellow-400" : "text-gray-300"} w-4 h-4`}
          />
        ))}
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchFeedbacks(newPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-[100vh] ml-[3%] mr-[3%] lg:ml-[10%] lg:mr-[10%]">
      <div className="h-fill w-fill ">
        <div className="min-h-screen py-8 pt-3 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden mt-7">
              <div className="px-6 py-5 border-b border-gray-200">
                <h1 className="text-2xl font-semibold text-gray-900">
                  My Feedback
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your product feedback
                </p>
              </div>

              <div className="px-6 py-5">
                {feedbacks.length > 0 ? (
                  <div className="space-y-6">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback._id}
                        className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            {/* <h3 className="text-lg font-medium text-gray-900">
                          {feedback.title || "No Title"}
                        </h3> */}
                            <Link
                              href={`/products/view/${feedback.product._id}`}>
                              <h3 className="underline mb-3 text-lg font-medium text-gray-900">
                                {feedback.product.title || "No Title"}
                              </h3>
                            </Link>
                            <div className="mt-1 flex items-center space-x-4">
                              {renderStars(feedback.starsGiven)}
                              <span className="text-sm text-gray-500">
                                {formatDate(feedback.createdAt)}
                              </span>
                              {feedback.product && (
                                <span className="text-sm text-blue-600">
                                  <Link
                                    href={`/products/view/${feedback.product._id}`}>
                                    View Product
                                  </Link>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 items-center">
                            <Link href={`/feedback/edit/${feedback._id}`}>
                              <button className="text-blue-600 hover:text-blue-800">
                                <FaEdit className="w-5 h-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteFeedback(feedback._id)}
                              className="text-red-600 hover:text-red-800">
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {feedback.description}
                        </p>
                        {feedback.givenBy && (
                          <p className="mt-2 text-xs text-gray-500">
                            Submitted as: {feedback.givenBy}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      You haven't submitted any feedback yet.
                    </p>
                    <Link href="/products">
                      <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Browse Products
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span>{" "}
                        of <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}>
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyFeedbackPage;
