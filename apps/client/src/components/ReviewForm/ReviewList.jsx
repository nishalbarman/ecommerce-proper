"use client";

// components/Reviews/ReviewList.js
import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import axios from "axios";
import { useSelector } from "react-redux";

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

      console.log("Reviews response:", response.data);

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
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{review.givenBy}</h3>
            <div className="text-sm text-gray-500">{review.createdAt}</div>
          </div>
          <div className="mb-3">
            <StarRating rating={review.starsGiven} />
          </div>
          <p className="text-gray-700">{review.description}</p>
        </div>
      ))}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50">
            {loading ? "Loading..." : "Load More Reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
