"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { useSelector } from "react-redux";
import {
  RiUser3Line,
  RiTimeLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiImageLine,
} from "react-icons/ri";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";
import { ReviewApi } from "@/redux";

export default function ReviewList({ productId, productType = "buy" }) {
  const jwtToken = useSelector((state) => state.auth.jwtToken);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { useGetReviewsQuery } = ReviewApi;

  const {
    data: reviewsData,
    isLoading,
    isFetching,
    error,
  } = useGetReviewsQuery({ productId, page, productType });

  console.log("reviewsData", reviewsData, isLoading, error);

  const reviews = reviewsData?.feedbacks || [];
  const totalPages = reviewsData?.totalPages || 1;
  const hasMore = page < totalPages;

  const loadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  const openImage = (images, index) => {
    setSelectedImage(images);
    setCurrentImageIndex(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    setCurrentImageIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? selectedImage.length - 1 : prev - 1;
      } else {
        return prev === selectedImage.length - 1 ? 0 : prev + 1;
      }
    });
  };

  if (isLoading && page === 1) {
    return (
      <div className="space-y-6 animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-2xl shadow border border-gray-100"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>

            <div className="flex-1">
              {/* Name + Date */}
              <div className="flex justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div
                        key={j}
                        className="w-4 h-4 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
              </div>

              {/* Images */}
              <div className="flex gap-3">
                {[...Array(3)].map((_, k) => (
                  <div
                    key={k}
                    className="w-24 h-24 bg-gray-200 rounded-xl"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto text-center py-5 text-white bg-red-200 rounded-md border border-red-500 p-6">
        <span className="text-red-600 font-bold">
          {error.data?.message || "Failed to load reviews"}
        </span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 border border-[rgb(219,69,69)] flex items-center justify-center">
            <RiUser3Line className="text-[rgb(219,69,69)] text-2xl"/>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your experience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-full shadow-sm">
              <RiUser3Line className="text-indigo-600 text-xl" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {review.givenBy}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.starsGiven} />
                    {/* <span className="text-sm text-indigo-600 font-medium">
                      {review.starsGiven.toFixed(1)}/5
                    </span> */}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <RiTimeLine className="mr-1.5" />
                  <span className="text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {review.description}
              </p>

              {/* Review Images Gallery */}
              {review.images?.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-3">
                    {review.images.map((image, index) => (
                      <div
                        key={image._id || index}
                        className={`relative w-24 h-24 rounded-xl overflow-hidden cursor-pointer group bg-[image.bgColor]`}
                        onClick={() => openImage(review.images, index)}>
                        <Image
                          src={image.thumbnailUrl || image.imageUrl}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="100px"
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                          <RiImageLine className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" />
                Loading more reviews...
              </span>
            ) : (
              "Load More Reviews"
            )}
          </button>
        </div>
      )}

      {/* Modern Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <button
            onClick={closeImage}
            className="absolute top-6 right-6 text-white bg-white/10 text-3xl z-10 hover:bg-white/10 p-2 rounded-full transition-all"
            aria-label="Close">
            <RiCloseLine fill="white" color="white" className="text-3xl" />
          </button>

          <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex items-center">
            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-6 text-white text-4xl z-10 p-3 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm transition-all"
              aria-label="Previous image">
              <RiArrowLeftSLine fill="white" color="white" />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage[currentImageIndex].thumbnailUrl}
                alt={`Review image ${currentImageIndex + 1}`}
                width={1600}
                height={900}
                className="object-contain max-w-full max-h-full rounded-lg"
                priority
              />
            </div>

            <button
              onClick={() => navigateImage("next")}
              className="absolute right-6 text-white text-4xl z-10 p-3 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm transition-all"
              aria-label="Next image">
              <RiArrowRightSLine fill="white" color="white" />
            </button>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-black/50 text-white rounded-full backdrop-blur-sm">
              <span className="font-medium">
                {currentImageIndex + 1} / {selectedImage.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
