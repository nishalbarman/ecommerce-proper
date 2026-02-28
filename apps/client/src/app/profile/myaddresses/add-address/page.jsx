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
  RiDeleteBin2Line,
} from "react-icons/ri";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";
import { AddressApi, ReviewApi } from "@/redux";
import Link from "next/link";
import toast from "react-hot-toast";
import AddressForm from "@/components/AddressForm/AddressForm";

export default function Address() {
  const jwtToken = useSelector((state) => state.auth.jwtToken);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { useGetAddressQuery, useDeleteAddressMutation } = AddressApi;

  const {
    data: addressData,
    isLoading,
    isFetching,
    error,
  } = useGetAddressQuery({ page });

  const [
    handleAddressDelete,
    { isLoading: isAddressDeleteLoading, error: addressDeletionError },
  ] = useDeleteAddressMutation();

  // console.log("address data", addressData, isLoading, error);
  const handleDelete = async (id) => {
    try {
      if (
        window &&
        !window.confirm("Are you sure you want to delete this address?")
      ) {
        return;
      }
      toast.loading("Deleting address...", { id: "delete-address" });
      const response = await handleAddressDelete(id).unwrap();
      toast.success("Address deleted successfully", { id: "delete-address" });
    } catch (error) {
      console.error("Failed to delete address", error);
      toast.error("Failed to delete address", { address: "delete-address" });
    }
  };

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
        </div>
      </div>

      {/* Content card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Add Address</span>
            </div>
          </div>

          {/* List / Empty / Loading */}
          <div className="px-5 sm:px-6 py-5">
            <AddressForm />
          </div>
        </div>
      </div>
    </div>
  );
}
