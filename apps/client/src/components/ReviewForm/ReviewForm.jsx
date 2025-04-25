"use client";

import { useState, useRef } from "react";
import StarRating from "./StarRating";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (files) => {
    if (files.length === 0) return;
    if (images.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const base64String = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks/upload-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              imageData: { base64String },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.redirectTo) {
            router.push(data.redirectTo);
          }
          throw new Error(data.message || "Upload failed");
        }

        return {
          title: data.data.title,
          id: data.data._id,
          imageUrl: data.data.imageLink,
          thumbnailUrl: data.data.thumbnailUrl,
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setImages([...images, ...newImages]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploadingImages(false);
      fileInputRef.current.value = "";
    }
  };

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

    setIsSubmitting(true);
    setError(null);

    try {
      const imageIds = images.map((img) => img.id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            product: productId,
            productType,
            description,
            starsGiven,
            imageIds,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted successfully!");
        if (onReviewSubmit) onReviewSubmit(data.data);
        setDescription("");
        setStarsGiven(0);
        setImages([]);
      } else {
        if (data.redirectTo) {
          router.push(data.redirectTo);
        }
        throw new Error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Share Your Experience
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
            editable={true}
            starSize={28}
          />
          {/* <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-gray-500">
              {starsGiven > 0 ? `${starsGiven.toFixed(1)}/5` : "Select stars"}
            </span>
          </div> */}
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
          />
        </div>

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
                  <button
                    type="button"
                    onClick={() => removeImage(index, image.id)}
                    className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors">
                    <FaTimes className="text-gray-600 hover:text-red-500 text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="px-15 bg-[rgb(218,68,69)] text-white py-3 px-6 rounded-md hover:bg-[rgb(218,68,69)] focus:outline-none focus:ring-2 focus:bg-[rgb(218,68,69)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
          {/* <button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Review"
            )}
          </button> */}
        </div>
      </form>
    </div>
  );
}
