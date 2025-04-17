"use client";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import axios from "axios";
import { useSelector } from "react-redux";
import { RiUser3Line, RiTimeLine } from "react-icons/ri";
import { FiLoader } from "react-icons/fi";

export default function ReviewList({ productId, productType = "buy" }) {
  const { jwtToken } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks/list/${productId}?page=${page}`,
        { productType },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (page === 1) {
        setReviews(response.data.feedbacks);
      } else {
        setReviews([...reviews, ...response.data.feedbacks]);
      }

      setTotalPages(response.data.totalPages);
      setHasMore(page < response.data.totalPages);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <FiLoader className="animate-spin text-gray-400 text-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg p-4">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <RiUser3Line className="text-gray-600 text-xl" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {review.givenBy}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <RiTimeLine className="mr-1" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mb-3">
                <StarRating rating={review.starsGiven} />
              </div>
              <p className="text-gray-700">{review.description}</p>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More Reviews"
            )}
          </button>
        </div>
      )}
    </div>
  );
}