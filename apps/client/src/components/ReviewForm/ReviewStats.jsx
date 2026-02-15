"use client";

// components/Reviews/ReviewStats.js
import StarRating from "./StarRating";

export default function ReviewStats({ averageRating, totalReviews }) {
  const ratingPercentages = [5, 4, 3, 2, 1].map((star) => {
    // In a real app, you would calculate these percentages from your actual review data
    const percentage = Math.floor(Math.random() * 100); // Replace with actual calculation
    return { star, percentage };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-4 max-md:hidden">
      <h3 className="text-sm font-semibold mb-4">Customer Reviews</h3>

      <div className="flex max-sm:flex-col flex-row items-center md:items-start gap-8 mt-2">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">
            {averageRating?.toFixed(1)}
          </div>
          <StarRating rating={averageRating} />
          <div className="text-sm text-gray-600 mt-1">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* <div className="flex-1 space-y-2 w-full">
          {ratingPercentages.map(({ star, percentage }) => (
            <div key={star} className="flex items-center">
              <div className="w-10 text-sm font-medium">{star} star</div>
              <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-[rgb(218,68,69)] rounded-full"
                  style={{ width: `${percentage}%` }}></div>
              </div>
              <div className="w-10 text-sm text-gray-600 text-right">
                {percentage}%
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
