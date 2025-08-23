"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEdit,
  FaSave,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";

const brand = {
  primary: "#DA4445", // matches your header/user icon accent
};

const MyAccountPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/me`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setUserData(data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        mobileNo: response.data.mobileNo,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.response?.data?.message || "Failed to load user data");
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/\s/.test(formData.name)) {
      newErrors.name = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = "Invalid Indian mobile number";
    }

    if (isEditing && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !/[A-Z]/.test(formData.password) ||
        !/[a-z]/.test(formData.password)
      ) {
        newErrors.password = "Use both uppercase and lowercase letters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    const editing = !isEditing;
    setIsEditing(editing);
    if (!editing && userData) {
      // Reset when cancel
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        mobileNo: userData.mobileNo || "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsUpdating(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        mobileNo: formData.mobileNo,
      };
      if (formData.password) payload.password = formData.password;

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/update`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);
      await fetchUserData();

      if (response.data?.jwtToken) {
        localStorage.setItem("token", response.data.jwtToken);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-200 border-t-[3px]"
          style={{ borderTopColor: brand.primary }}
        />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-xl shadow-sm border p-6 max-w-md w-full">
          <h1 className="text-xl font-semibold mb-2 text-gray-900">
            User not found
          </h1>
          <p className="text-gray-500 mb-4">
            Please login to access your account
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{ background: brand.primary }}>
            Go to Login <FaArrowRight className="opacity-90" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Page header block */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-1.5 rounded-full"
                style={{ background: brand.primary }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: brand.primary }}>
                Account
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              My Account
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your profile information
            </p>
          </div>
          <div className="hidden sm:flex">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">
                <FaEdit className="text-gray-500" /> Edit
              </button>
            ) : (
              <button
                onClick={handleEditToggle}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Top strip like your cards */}
          <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2 text-gray-700">
              <FaUser className="text-gray-500" />
              <span className="font-semibold">Profile Details</span>
              <span className="ml-auto sm:hidden">
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white text-gray-700">
                    <FaEdit className="text-gray-500" /> Edit
                  </button>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white text-gray-700">
                    Cancel
                  </button>
                )}
              </span>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="col-span-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <>
                    <div
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 ${errors.name ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"}`}>
                      <FaUser className="text-gray-400" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                        placeholder="Enter full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border bg-gray-50 px-3 py-2 text-gray-900">
                    {userData?.name || "—"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <>
                    <div
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 ${errors.email ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"}`}>
                      <FaEnvelope className="text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full outline-none bg-transparent text-gray-900"
                        placeholder="name@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border bg-gray-50 px-3 py-2 text-gray-900">
                    {userData?.email || "—"}
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div className="col-span-1">
                <label
                  htmlFor="mobileNo"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                {isEditing ? (
                  <>
                    <div
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 ${errors.mobileNo ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"}`}>
                      <FaPhone className="text-gray-400" />
                      <input
                        id="mobileNo"
                        name="mobileNo"
                        type="tel"
                        value={formData.mobileNo}
                        onChange={handleInputChange}
                        className="w-full outline-none bg-transparent text-gray-900"
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                    {errors.mobileNo && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.mobileNo}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border bg-gray-50 px-3 py-2 text-gray-900">
                    {userData?.mobileNo || "—"}
                  </div>
                )}
              </div>

              {/* Passwords only when editing */}
              {isEditing && (
                <>
                  <div className="col-span-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 ${errors.password ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"}`}>
                      <FaLock className="text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 focus-within:ring-2 ${errors.confirmPassword ? "border-red-300 ring-red-100" : "border-gray-300 ring-blue-100"}`}>
                      <FaLock className="text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full outline-none bg-transparent text-gray-900"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">
                  {!isEditing ? (
                    <>
                      <FaEdit className="text-gray-500" /> Edit Profile
                    </>
                  ) : (
                    "Cancel"
                  )}
                </button>

                {isEditing && (
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white shadow-sm disabled:opacity-70"
                    style={{ background: brand.primary }}>
                    {isUpdating ? (
                      "Saving..."
                    ) : (
                      <>
                        <FaSave color="white" fill="white" /> Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Secondary sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: brand.primary }}
                />
                <h2 className="text-base font-semibold text-gray-900">
                  Recent Orders
                </h2>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                View your recent orders and track their status
              </p>
              <Link
                href="/myorders"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm bg-[#DA4445] hover:bg-red-500">
                View All Orders <FaArrowRight color="white" fill="white" />
              </Link>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Account Security
                </h2>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Email Verification
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userData?.isEmailVerfied ? "Verified" : "Not Verified"}
                  </p>
                </div>
                {!userData?.isEmailVerfied && (
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Verify Now
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Mobile Verification
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userData?.isMobileNoVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
                {!userData?.isMobileNoVerified && (
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Verify Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Helpful links row to mirror footer/quick links style */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/wishlist"
            className="px-3 py-1.5 rounded-full border text-sm text-gray-700 bg-white hover:bg-gray-50">
            Wishlist
          </Link>
          <Link
            href="/cart"
            className="px-3 py-1.5 rounded-full border text-sm text-gray-700 bg-white hover:bg-gray-50">
            Cart
          </Link>
          <Link
            href="/support"
            className="px-3 py-1.5 rounded-full border text-sm text-gray-700 bg-white hover:bg-gray-50">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
