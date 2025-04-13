"use client";

// components/Reviews/ReviewForm.js
import { useState } from "react";
import StarRating from "./StarRating";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function ReviewForm({
  productId,
  productType = "buy",
  onReviewSubmit,
  cookie,
}) {
  const [formData, setFormData] = useState({
    description: "",
    starsGiven: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, starsGiven: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.starsGiven) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log(cookie);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks`,
        {
          method: "POST",
          headers: {
            "Content-Type": `application/json`,
          },
          credentials: "include",
          body: JSON.stringify({
            product: productId,
            productType,
            description: formData.description,
            starsGiven: formData.starsGiven,
          }),
        }
      );

      const data = await response.json();
      console.log("Review response:", data);

      toast.success("Review submitted successfully!");
      // onReviewSubmit(response.data.feedback);
      // setFormData({
      //   description: "",
      //   starsGiven: 0,
      // });
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review");
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      {error && (
        <div className="mb-4 px-3 py-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating
            rating={formData.starsGiven}
            onRatingChange={handleRatingChange}
            editable={true}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2">
            Review
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Share your experience with this product..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-10 bg-[rgb(218,68,69)] text-white py-2 px-4 rounded-md hover:bg-[rgb(218,68,69)] focus:outline-none focus:ring-2 focus:bg-[rgb(218,68,69)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
