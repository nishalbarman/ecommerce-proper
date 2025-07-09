"use client";

import { useState, useRef, useEffect } from "react";
import StarRating from "./StarRating";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaImage, FaTimes, FaSpinner, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ReviewApi } from "@/redux";

export default function ReviewForm({
  productId,
  productType = "buy",
  onReviewSubmit,
}) {
  const router = useRouter();
  const jwtToken = useSelector((state) => state.auth.jwtToken);
  const [description, setDescription] = useState("");
  const [starsGiven, setStarsGiven] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    useSubmitReviewMutation,
    useUploadReviewImageMutation,
    useUpdateReviewMutation,
    useGetUserReviewQuery,
  } = ReviewApi;

  // Fetch user's existing review for this product
  const { data: existingReview, isLoading: isReviewLoading } =
    useGetUserReviewQuery(
      {
        fetchingId: productId,
        fetchBy: "product",
        productType,
      },
      { skip: !jwtToken }
    );

  console.log("What is existing review", existingReview);

  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [uploadReviewImage, { isLoading: uploadingImages }] =
    useUploadReviewImageMutation();

  // Pre-fill form if existing review is found
  useEffect(() => {
    if (existingReview) {
      setDescription(existingReview.description);
      setStarsGiven(existingReview.starsGiven);
      setImages(existingReview.images || []);
      setIsEditing(false);
    } else {
      // Reset form if no existing review
      setDescription("");
      setStarsGiven(0);
      setImages([]);
      setIsEditing(true); // Allow immediate editing for new reviews
    }
  }, [existingReview]);

  const handleImageUpload = async (files) => {
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const base64String = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        const response = await uploadReviewImage(base64String).unwrap();

        return {
          title: response.data.title,
          _id: response.data._id,
          imageUrl: response.data.imageLink,
          thumbnailUrl: response.data.thumbnailUrl,
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setImages([...images, ...newImages]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        `Failed to upload images: ${error.data?.message || error.message}`
      );
      if (error.data?.redirectTo) {
        router.push(error.data.redirectTo);
      }
    } finally {
      fileInputRef.current.value = "";
    }
  };

  console.log("what are imagessss", images);

  const removeImage = (index, imageId) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!starsGiven) {
      setError("Please select a rating");
      return;
    }

    setError(null);

    try {
      const imageIds = images.map((img) => img._id);

      if (existingReview && !isEditing) {
        // If in view mode, switch to edit mode
        setIsEditing(true);
        return;
      }

      if (existingReview) {
        // Update existing review
        const response = await updateReview({
          reviewId: existingReview._id,
          productId,
          productType,
          description,
          starsGiven,
          imageIds,
        }).unwrap();

        toast.success("Review updated successfully!");
        if (onReviewSubmit) onReviewSubmit(response.data);
        setIsEditing(false); // Switch back to view mode
      } else {
        // Submit new review
        const response = await submitReview({
          productId,
          productType,
          description,
          starsGiven,
          imageIds,
        }).unwrap();

        toast.success("Review submitted successfully!");
        if (onReviewSubmit) onReviewSubmit(response.data);
        setDescription("");
        setStarsGiven(0);
        setImages([]);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.data?.message || err.message);
      toast.error(err.data?.message || err.message);
      if (err.data?.redirectTo) {
        router.push(err.data.redirectTo);
      }
    }
  };

  const handleCancelEdit = () => {
    // Reset to original review values
    if (existingReview) {
      setDescription(existingReview.description);
      setStarsGiven(existingReview.starsGiven);
      setImages(existingReview.images || []);
    }
    setIsEditing(false);
  };

  if (isReviewLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex justify-center">
        <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {existingReview ? "Your Review" : "Share Your Experience"}
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Rating
          </label>
          <StarRating
            rating={starsGiven}
            onRatingChange={setStarsGiven}
            editable={!existingReview || isEditing}
            starSize={28}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700">
            Your Review
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Tell us about your experience with this product..."
            disabled={existingReview && !isEditing}
          />
        </div>

        {(existingReview ? isEditing : true) && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Add Photos (Optional)
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingImages || images.length >= 5}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {uploadingImages ? (
                  <FaSpinner className="animate-spin text-indigo-600" />
                ) : (
                  <FaImage className="text-indigo-600" />
                )}
                <span>Add Photos</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e.target.files)}
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingImages || images.length >= 5}
              />
              <span className="text-sm text-gray-500">
                {images.length} of 5 photos
              </span>
            </div>

            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={image.thumbnailUrl}
                        alt={`Review image ${index + 1}`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {(existingReview ? isEditing : true) && (
                      <button
                        type="button"
                        onClick={() => removeImage(index, image.id)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors">
                        <FaTimes className="text-gray-600 hover:text-red-500 text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isUpdating || uploadingImages}
            className="px-15 bg-[rgb(218,68,69)] text-white py-3 px-6 rounded-md hover:bg-[rgb(218,68,69)] focus:outline-none focus:ring-2 focus:bg-[rgb(218,68,69)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-white">
            {isSubmitting || isUpdating ? (
              <span className="flex items-center justify-center gap-2 text-white">
                <FaSpinner
                  fill="white"
                  color="white"
                  className="animate-spin"
                />
                {existingReview ? "Updating..." : "Submitting..."}
              </span>
            ) : existingReview ? (
              isEditing ? (
                "Update Review"
              ) : (
                <span className="flex items-center justify-center gap-2 text-white">
                  <FaEdit fill="white" color="white" />
                  Edit Review
                </span>
              )
            ) : (
              "Submit Review"
            )}
          </button>

          {existingReview && isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-15 bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
