"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUserAuth } from "@/redux/slices/authSlice";
import { setCookiesAfterLogin } from "@/lib/login/setLoginCookie";
import authService from "@/services/authService";
import {
  hasOneSpaceBetweenNames,
  isValidEmail,
  isValidIndianMobileNumber,
  isValidPassword,
} from "@/helpter/utils";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  clearLoginModalState,
  setLoginModalState,
} from "@/redux/slices/loginModalSlice";
import SpaceshipLoading from "@/components/LoadingScreen/LoadingScreen";

const AuthModal = ({ onClose }) => {
  const isModalVisible = useSelector(
    (state) => state.authModalSlice.modalVisible
  );
  console.log("isModalVisible", isModalVisible);

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifyScreenVisible, setIsVerifyScreenVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const navigation = useRouter();

  const toggleForm = () => {
    setIsLoginForm((prev) => !prev);
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });

  // Reset form when switching between login/signup
  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      mobileNo: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
  }, [isLoginForm]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!hasOneSpaceBetweenNames(value)) {
          error = "Full name should be two words with one space";
        }
        break;
      case "email":
        if (!isValidEmail(value)) {
          error = "Please enter a valid email";
        }
        break;
      case "mobileNo":
        if (!isValidIndianMobileNumber(value)) {
          error = "Please enter a valid 10-digit mobile number";
        }
        break;
      case "password":
        if (!isValidPassword(value)) {
          error = "Password must be 8+ chars with uppercase and lowercase";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change but don't show error until blur
    if (formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (isLoginForm) {
      const mobileError = validateField("mobileNo", formData.mobileNo);
      if (mobileError) errors.mobileNo = mobileError;

      const passwordError = validateField("password", formData.password);
      if (passwordError) errors.password = passwordError;
    } else {
      const nameError = validateField("name", formData.name);
      if (nameError) errors.name = nameError;

      const emailError = validateField("email", formData.email);
      if (emailError) errors.email = emailError;

      const mobileError = validateField("mobileNo", formData.mobileNo);
      if (mobileError) errors.mobileNo = mobileError;

      const passwordError = validateField("password", formData.password);
      if (passwordError) errors.password = passwordError;

      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      if (confirmError) errors.confirmPassword = confirmError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await authService.login({
        mobileNo: formData.mobileNo,
        password: formData.password,
      });

      toast.dismiss(loadingToast);
      toast.success(response?.message || "Login successful");

      if (response?.user) {
        dispatch(
          setUserAuth({
            name: response.user.name,
            email: response.user.email,
            mobileNo: response.user.mobileNo,
            jwtToken: response.user.jwtToken,
          })
        );

        setCookiesAfterLogin({ token: response.user.jwtToken });
        const redirectPath = searchParams?.get("redirect") || "/";
        // router.push(redirectPath);
        dispatch(clearLoginModalState());
        onClose?.();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.dismiss(loadingToast);

      let errorMessage = "Login failed. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSignup = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;

  //   setIsLoading(true);
  //   const loadingToast = toast.loading("Creating account...");

  //   try {
  //     const response = await authService.register({
  //       name: formData.name,
  //       email: formData.email,
  //       mobileNo: formData.mobileNo,
  //       password: formData.password,
  //       confirmpassword: formData.confirmPassword,
  //     });

  //     toast.dismiss(loadingToast);
  //     toast.success(response?.message || "Account created successfully");
  //     setIsVerifyScreenVisible(true);
  //   } catch (error) {
  //     console.error("Signup error:", error);
  //     toast.dismiss(loadingToast);

  //     let errorMessage = "Signup failed. Please try again.";
  //     if (error?.response?.data?.message) {
  //       errorMessage = error.response.data.message;
  //     } else if (error.message) {
  //       errorMessage = error.message;
  //     }

  //     toast.error(errorMessage);

  //     // Highlight specific field errors if available
  //     if (error?.response?.data?.errors) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         ...error.response.data.errors,
  //       }));
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const isFormValid = () => {
    if (isLoginForm) {
      return (
        formData.mobileNo &&
        formData.password &&
        !formErrors.mobileNo &&
        !formErrors.password
      );
    } else {
      return (
        formData.name &&
        formData.email &&
        formData.mobileNo &&
        formData.password &&
        formData.confirmPassword &&
        !formErrors.name &&
        !formErrors.email &&
        !formErrors.mobileNo &&
        !formErrors.password &&
        !formErrors.confirmPassword
      );
    }
  };

  // if (isVerifyScreenVisible) {
  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  //       <div className="bg-white rounded-lg p-8 max-w-md w-full text-center animate-fade-in">
  //         <div className="mb-6 flex justify-center">
  //           <Image
  //             src="/assets/email.svg"
  //             width={80}
  //             height={80}
  //             alt="Verification"
  //             priority
  //           />
  //         </div>
  //         <h3 className="text-2xl font-bold mb-4">
  //           Account Created Successfully!
  //         </h3>
  //         <p className="mb-6 text-gray-600">
  //           You can now login to your account using your mobile number and
  //           password.
  //         </p>
  //         <button
  //           onClick={() => {
  //             setIsVerifyScreenVisible(false);
  //             setIsLoginForm(true);
  //           }}
  //           className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition">
  //           Continue to Login
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (!isModalVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full animate-fade-in">
        <button
          onClick={() => {
            dispatch(
              setLoginModalState({ modalVisible: false, redirectTo: null })
            );
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            color="white"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">
            {isLoginForm ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-gray-500 mb-6">
            {isLoginForm
              ? "Enter your details to login"
              : "Fill in your details to get started"}
          </p>

          <form onSubmit={isLoginForm ? handleLogin : handleSignup}>
            {!isLoginForm && (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Full Name"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Email Address"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="mb-4">
              <input
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mobile Number"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  formErrors.mobileNo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.mobileNo && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.mobileNo}
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Password"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10 ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 top-3 flex items-center text-gray-500 hover:text-gray-700">
                {isPasswordVisible ? (
                  <FaEye
                    onClick={() => {
                      setIsPasswordVisible((prev) => !prev);
                    }}
                    size={20}
                    className="cursor-pointer"
                  />
                ) : (
                  <FaEyeSlash
                    onClick={() => {
                      setIsPasswordVisible((prev) => !prev);
                    }}
                    size={20}
                    className="cursor-pointer"
                  />
                )}
              </button>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.password}
                </p>
              )}
            </div>

            {!isLoginForm && (
              <div className="mb-6">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm Password"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* {isLoginForm && (
              <div className="flex justify-between items-center mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                  onClick={onClose}>
                  Forgot password?
                </Link>
              </div>
            )} */}

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className={`border border-black w-full py-3 rounded-lg font-medium text-black transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              } ${!isFormValid() ? "opacity-70 cursor-not-allowed" : ""}`}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLoginForm ? "Logging in..." : "Creating account..."}
                </span>
              ) : isLoginForm ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLoginForm
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  navigation.push("/auth/signup");
                }}
                className="text-black  italic font-medium hover:underline focus:outline-none">
                {isLoginForm ? "Sign up" : "Login"}
              </button>
            </p>
          </div>

          {!isLoginForm && (
            <div className="mt-4 text-center text-sm text-gray-500">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-primary hover:underline"
                onClick={onClose}>
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:underline"
                onClick={onClose}>
                Privacy Policy
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
