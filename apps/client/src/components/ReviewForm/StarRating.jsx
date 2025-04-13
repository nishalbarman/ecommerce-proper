"use client";

// components/Reviews/StarRating.js
import { useState } from "react";

export default function StarRating({
  rating,
  onRatingChange,
  editable = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (star) => {
    if (editable && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl focus:outline-none ${editable ? "cursor-pointer" : "cursor-default"}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => editable && setHoverRating(star)}
          onMouseLeave={() => editable && setHoverRating(0)}
          disabled={!editable}>
          {star <= (hoverRating || rating) ? (
            <span className="text-yellow-400 text-3xl">★</span>
          ) : (
            <span className="text-gray-300 text-3xl">☆</span>
          )}
        </button>
      ))}
      {editable && (
        <span className="ml-2 text-xl text-gray-600">
          {hoverRating || rating || ""} {hoverRating || rating ? "stars" : ""}
        </span>
      )}
    </div>
  );
}
