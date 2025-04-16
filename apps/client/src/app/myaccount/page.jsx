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
} from "react-icons/fa";

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
        router.push("/login");
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
        newErrors.password =
          "Password must contain both uppercase and lowercase letters";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form when canceling edit
      setFormData({
        name: userData.name,
        email: userData.email,
        mobileNo: userData.mobileNo,
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

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/update`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchUserData(); // Refresh user data

      // Update token if it's returned
      if (response.data.jwtToken) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link href="/login">
            <span className="text-blue-600 hover:underline">Please login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">My Account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your profile information
            </p>
          </div>

          <div className="px-6 py-5">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 flex items-center">
                    <FaUser className="mr-2" /> Full Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${errors.name ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {userData.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 flex items-center">
                    <FaEnvelope className="mr-2" /> Email Address
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${errors.email ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {userData.email}
                    </p>
                  )}
                </div>

                {/* Mobile Number Field */}
                <div>
                  <label
                    htmlFor="mobileNo"
                    className="block text-sm font-medium text-gray-700 flex items-center">
                    <FaPhone className="mr-2" /> Mobile Number
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        id="mobileNo"
                        name="mobileNo"
                        value={formData.mobileNo}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${errors.mobileNo ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.mobileNo && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.mobileNo}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {userData.mobileNo}
                    </p>
                  )}
                </div>

                {/* Password Fields (only shown when editing) */}
                {isEditing && (
                  <>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 flex items-center">
                        <FaLock className="mr-2" /> New Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                        className={`mt-1 block w-full border ${errors.password ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border ${errors.confirmPassword ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {isEditing ? (
                      <>
                        <FaEdit className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <FaEdit className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                        Edit Profile
                      </>
                    )}
                  </button>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                      {isUpdating ? (
                        "Saving..."
                      ) : (
                        <>
                          <FaSave
                            fill="white"
                            color="white"
                            className="-ml-1 mr-2 h-5 w-5"
                          />
                          Save Changes
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Account Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Summary */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Orders
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">
                View your recent orders and track their status
              </p>
              <Link href="/myorders">
                <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  View All Orders
                </span>
              </Link>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Account Security
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Email Verification
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userData.isEmailVerfied ? "Verified" : "Not Verified"}
                  </p>
                </div>
                {!userData.isEmailVerfied && (
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
                    {userData.isMobileNoVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
                {!userData.isMobileNoVerified && (
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Verify Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
