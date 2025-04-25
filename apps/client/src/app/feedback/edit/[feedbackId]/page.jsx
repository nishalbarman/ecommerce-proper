"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loading from "@/app/cart/loading";
import Image from "next/image";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import StarRating from "@/components/ReviewForm/StarRating";
import { useSelector } from "react-redux";

export default function EditFeedbackPage() {
  const router = useRouter();
  const { feedbackId } = useParams();
  const jwtToken = useSelector((state) => state.auth.jwtToken);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [description, setDescription] = useState("");
  const [starsGiven, setStarsGiven] = useState(0);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks/view/${feedbackId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
            withCredentials: true,
          }
        );
        const feedbackData = response.data.data;
        setFeedback(feedbackData);
        setDescription(feedbackData.description);
        setStarsGiven(feedbackData.starsGiven);
        setImages(feedbackData.images || []);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError(err.response?.data?.message || "Failed to load feedback");
        toast.error("Failed to load feedback");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [feedbackId]);

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
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageIds = images.map((img) => img.id);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/feedbacks/${feedbackId}`,
        {
          description,
          starsGiven,
          imageIds,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Review updated successfully");
      router.push("/myreviews");
    } catch (err) {
      console.error("Error updating feedback:", err);
      toast.error(err.response?.data?.message || "Failed to update feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/myreviews")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            Back to My Reviews
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Feedback not found
          </h2>
          <button
            onClick={() => router.push("/myreviews")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            Back to My Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Review</h1>
          <p className="mt-2 text-gray-600">
            Update your review for {feedback.product?.title}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
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
                Photos
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

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/myreviews")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="px-4 py-2 bg-[rgb(218,68,69)] text-white rounded-lg hover:bg-[rgb(218,68,69)] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Updating..." : "Update Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
