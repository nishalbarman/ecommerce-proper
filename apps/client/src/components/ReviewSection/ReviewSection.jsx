"use client";

import React, { useState } from "react";
import ReviewStats from "@/components/ReviewForm/ReviewStats";
import ReviewList from "@/components/ReviewForm/ReviewList";
import ReviewForm from "@/components/ReviewForm/ReviewForm";

function ReviewSection({ product, cookie }) {
  console.log(product);

  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false); // You'll need to determine this from your API

  const handleReviewSubmit = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  return (
    <section className="mt-2 container mx-auto">
      {!hasPurchased && (
        <div>
          <ReviewForm
            productId={product._id}
            onReviewSubmit={handleReviewSubmit}
            cookie={cookie}
          />
        </div>
      )}

      <div className="md:col-span-2 mb-10 mt-3">
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
          <ReviewList productId={product._id} cookie={cookie} />
        </div>
      </div>
    </section>
  );
}

export default ReviewSection;
