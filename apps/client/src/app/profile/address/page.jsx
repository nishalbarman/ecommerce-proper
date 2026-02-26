"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  RiUser3Line,
  RiTimeLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiImageLine,
  RiMapPinLine,
  RiPhoneLine,
  RiAddLine,
  RiEdit2Line,
} from "react-icons/ri";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";
import { AddressApi, ReviewApi } from "@/redux";
import Link from "next/link";

export default function Address() {
  const jwtToken = useSelector((state) => state.auth.jwtToken);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { useGetAddressQuery } = AddressApi;

  const {
    data: addressData,
    isLoading,
    isFetching,
    error,
  } = useGetAddressQuery({ page });

  console.log("address data", addressData, isLoading, error);

  const addresses = addressData?.data || [];
  const totalPages = addressData?.totalPages || 1;
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

  // ✅ Loading Skeleton
  if (isLoading && page === 1) {
    return (
      <div className="container min-h-screen mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">
              Your Activity
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            My Addresses
          </h1>
          <p className="text-gray-500 text-sm">View and manage your address</p>
        </div>
        <div className="mt-6 space-y-6 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="container min-h-screen mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">
              Your Activity
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            My Addresses
          </h1>
          <p className="text-gray-500 text-sm">View and manage your address</p>
        </div>
        <div className="mt-6 text-center py-5 text-red-600 bg-red-100 rounded-md border border-red-400 p-6">
          {error.data?.message || "Failed to load addresses"}
        </div>
      </div>
    );
  }

  // 📭 Empty State
  if (addresses.length === 0) {
    return (
      <div className="container min-h-screen mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">
              Your Activity
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            My Addresses
          </h1>
          <p className="text-gray-500 text-sm">View and manage your address</p>
        </div>
        <div className="mt-6 text-center py-12 px-6 bg-gray-50 rounded-2xl border border-gray-200">
          <RiMapPinLine className="text-3xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">
            No addresses found
          </h3>
          <p className="text-gray-600">Add a new address to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-1.5 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary">
                Your Activity
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              My Addresses
            </h1>
            <p className="text-gray-500 text-sm">
              View and manage your address
            </p>
          </div>

          {/* ➕ Add Address Button */}
          <Link
            href="/profile/address/add-address"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:opacity-90">
            <RiAddLine />
            Add Address
          </Link>
        </div>
      </div>

      {/* Content card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                All Addresses ({addresses.length})
              </span>
              {/* <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white"
                style={{ background: brand.primary }}>
                Browse Products{" "}
                <FaArrowRight
                  color="white"
                  fill="white"
                  className="opacity-90"
                />
              </Link> */}
            </div>
          </div>

          {/* List / Empty / Loading */}
          <div className="px-5 sm:px-6 py-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-[3px]"
                  style={{ borderTopColor: brand.primary }}
                />
              </div>
            ) : addressData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No Address found. Add one address now.
                </p>
                <Link
                  href="/profile/address/add-address"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary"
                  s>
                  Add Address <FaArrowRight className="opacity-90" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {addresses.map((addr, index) => (
                  <div
                    key={addr._id}
                    className={`border-b border-gray-200 pb-5 ${index >= addresses?.length-1 && 'border-none'}`}>
                    <div className="flex justify-between flex-wrap gap-3">
                      {/* LEFT CONTENT */}
                      <div className="flex gap-4">
                        <div className="bg-red-50 p-3 rounded-full h-fit">
                          <RiUser3Line className="text-red-500" />
                        </div>

                        <div>
                          <h3 className="font-bold text-lg">{addr.fullName}</h3>

                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <RiTimeLine />
                            {new Date(addr.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-gray-700">
                            <RiPhoneLine /> {addr.phone}
                          </div>

                          <div className="mt-2 flex gap-2 text-gray-700">
                            <RiMapPinLine className="mt-1" />
                            <p>
                              {addr.streetName},{" "}
                              {addr.landmark && `${addr.landmark}, `}
                              {addr.city}, {addr.state} - {addr.postalCode},{" "}
                              {addr.country}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ✏️ Edit Button */}
                      <Link
                        href={`/profile/address/edit-address/${addr._id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm border-red-500 border bg-red-50  rounded-lg hover:bg-red-100 h-fit text-red-500">
                        <RiEdit2Line className="text-red-500" />
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={isFetching}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70">
                      {isFetching ? (
                        <span className="flex items-center justify-center gap-2">
                          <FiLoader className="animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        "Load More Addresses"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick access chips like your site */}
        {/* <div className="mt-8 flex flex-wrap gap-3">
          <Chip href="/myaccount" label="My Account" />
          <Chip href="/myorders" label="My Orders" />
          <Chip href="/wishlist" label="Wishlist" />
          <Chip href="/cart" label="Cart" />
          <Chip href="/support" label="Support" />
        </div> */}
      </div>
    </div>
  );
}
