"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import StarRating from "@/components/ReviewForm/StarRating";
import Link from "next/link";

const BRAND = { primary: "#DA4445" };

export default function EditFeedbackPage() {
  const router = useRouter();
  const { feedbackId } = useParams();
  const jwtToken = useSelector((state) => state?.auth?.jwtToken);

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [starsGiven, setStarsGiven] = useState(0);
  const [images, setImages] = useState([]); // [{id, imageUrl, thumbnailUrl, title}]
  const fileRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `/feedbacks/view/${feedbackId}`,
          {},
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${jwtToken}` },
          },
        );
        const f = res?.data?.data;
        if (!ignore) {
          setFeedback(f || null);
          setDescription(f?.description || "");
          setStarsGiven(Number(f?.starsGiven) || 0);
          setImages(Array.isArray(f?.images) ? f.images : []);
        }
      } catch (err) {
        console.error(err);
        const msg = err?.response?.data?.message || "Failed to load feedback";
        if (!ignore) {
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [feedbackId, jwtToken]);

  const handleImageUpload = async (files) => {
    const fileList = Array.from(files || []);
    if (fileList.length === 0) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed");
      fileRef.current && (fileRef.current.value = "");
      return;
    }

    const toUpload = fileList.slice(0, remaining);
    const skipped = fileList.length - toUpload.length;
    if (skipped > 0) toast(`Only ${remaining} more image(s) can be added`);

    setUploading(true);
    try {
      const newImgs = [];
      for (const file of toUpload) {
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch(`/feedbacks/upload-image`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ imageData: { base64String } }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Upload failed");

        newImgs.push({
          title: data?.data?.title,
          _id: data?.data?._id,
          imageUrl: data?.data?.imageLink,
          thumbnailUrl: data?.data?.thumbnailUrl || data?.data?.imageLink,
        });
      }

      setImages((prev) => [...prev, ...newImgs]);
      toast.success("Images uploaded");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to upload images");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!starsGiven) {
      toast.error("Please select a rating");
      return;
    }

    setBusy(true);
    try {
      const imageIds = images.map((img) => img._id);
      await axios.patch(
        `/feedbacks/review`,
        {
          feedbackId,
          description,
          starsGiven,
          imageIds,
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );

      toast.success("Review updated successfully");
      router.push("/myreviews");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update review");
    } finally {
      setBusy(false);
    }
  };

  console.log("Image Ids", images);

  if (loading) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center bg-gray-50">
        <div
          className="h-12 w-12 rounded-full border-[3px] border-gray-200 animate-spin"
          style={{ borderTopColor: BRAND.primary }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/myreviews")}
            className="mt-4 px-4 py-2 rounded-lg text-white"
            style={{ background: BRAND.primary }}>
            Back to My Reviews
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Review not found
          </h2>
          <button
            onClick={() => router.push("/myreviews")}
            className="mt-4 px-4 py-2 rounded-lg text-white"
            style={{ background: BRAND.primary }}>
            Back to My Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-1.5 rounded-full"
            style={{ background: BRAND.primary }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: BRAND.primary }}>
            Reviews
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Edit Review
        </h1>
        <p className="text-gray-500 text-sm">
          {feedback?.product?.title
            ? `Update your review for ${feedback.product.title}`
            : "Update your review"}
        </p>
      </div>
      {/* Form card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white shadow-sm  rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <Link
                href={`/products/view/${feedback?.product?._id}`}
                className="text-gray-500 text-lg font-bold mb-2 underline">
                {feedback?.product?.title && `${feedback?.product?.title}`}{" "}
                <span className="font-semibold text-xs text-primary">
                  {" "}
                  View Product
                </span>
              </Link>

              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                Your Rating
              </label>
              <StarRating
                rating={starsGiven}
                onRatingChange={setStarsGiven}
                editable
                starSize={28}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this product..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || images.length >= 5}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                  {uploading ? (
                    <FaSpinner className="animate-spin text-blue-600" />
                  ) : (
                    <FaImage className="text-blue-600" />
                  )}
                  <span>Add Photos</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploading || images.length >= 5}
                />
                <span className="text-sm text-gray-500">
                  {images.length} of 5 photos
                </span>
              </div>

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id || idx} className="relative">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={img?.thumbnailUrl || img?.imageUrl}
                          alt={`Review image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-50 cursor-pointer"
                        aria-label="Remove image">
                        <FaTimes className="text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/myreviews")}
                className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || uploading}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                style={{ background: BRAND.primary }}>
                {busy ? "Updating..." : "Update Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
