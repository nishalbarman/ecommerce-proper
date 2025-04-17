"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import useRazorpay from "react-razorpay";

import {
  RiRefund2Fill,
  RiSecurePaymentLine,
  RiCouponLine,
  RiCloseLine,
} from "react-icons/ri";
import { HiFire } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";
import { FiCheckCircle, FiShoppingBag } from "react-icons/fi";
import { BsTruck } from "react-icons/bs";

import CartItem from "./CartItem";
import { WishlistApi, CartApi, AppliedCouponSlice } from "@/redux";

function Cart() {
  const { useGetCartQuery } = CartApi;
  const { useGetWishlistQuery } = WishlistApi;
  const { updateAppliedCoupon } = AppliedCouponSlice;

  const { data: { cart: userCartItems } = {} } = useGetCartQuery({
    productType: "buy",
  });
  const { data: userWishlistItems } = useGetWishlistQuery({
    productType: "buy",
  });

  const [Razorpay] = useRazorpay();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSubmitLoading, setCouponSubmitLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentGatewayList] = useState([]);

  const appliedCouponReduxStore = useSelector(
    (state) => state.appliedCouponSlice
  );
  const [appliedCoupon, setAppliedCoupon] = useState(
    appliedCouponReduxStore._id ? appliedCouponReduxStore : null
  );

  const [subtotalPrice, setSubtotalPrice] = useState(0);
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [totalShippingPrice, setTotalShippingPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [couponDiscountPrice, setCouponDiscountPrice] = useState(0);
  const [orderStatus, setOrderStatus] = useState(true);
  const [orderStatusText, setOrderStatusText] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const couponModalRef = useRef();
  const couponSuccessModalRef = useRef();
  const paymentLoadingModalRef = useRef();
  const paymentStatusModalRef = useRef();

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponSubmitLoading(true);
    setCouponError("");

    try {
      if (!couponCode) {
        return setCouponError("Please enter a coupon code");
      }

      if (appliedCoupon?.code?.toLowerCase() === couponCode.toLowerCase()) {
        return setCouponError("Coupon already applied");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/coupons/validate?code=${couponCode}`
      );

      if (!response.data.status) {
        return setCouponError(response.data.message || "Invalid coupon");
      }

      const coupon = response.data.coupon;
      const discount = (
        coupon.isPercentage
          ? (subtotalPrice / 100) * (parseInt(coupon.off) || 0)
          : subtotalPrice > coupon.minPurchasePrice
            ? coupon.off
            : 0
      ).toFixed(2);

      setCouponDiscountPrice(discount);
      setAppliedCoupon(discount > 0 ? coupon : null);
      dispatch(updateAppliedCoupon(coupon));
      setSubtotalPrice((prev) => prev - discount);

      couponModalRef.current?.classList.add("hidden");
      couponSuccessModalRef.current?.classList.remove("hidden");

      setTimeout(() => {
        couponSuccessModalRef.current?.classList.add("hidden");
      }, 1500);
    } catch (error) {
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setCouponSubmitLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountPrice(0);
    setSubtotalPrice((prev) => prev + couponDiscountPrice);
  };

  const handleRazorPayCheckout = useCallback(async () => {
    try {
      setIsPaymentLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pay/razorpay/cart/buy${appliedCoupon?._id ? "?coupon=" + appliedCoupon._id : ""}`,
        {},
        { withCredentials: true }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: response.data.payment.amount,
        currency: "INR",
        name: process.env.NEXT_PUBLIC_BUSSINESS_NAME,
        description: response.data.payment.productinfo,
        image: "https://i.ibb.co/Q3FPrQQm/64c844d378e5.png",
        order_id: response.data.payment.razorpayOrderId,
        handler: function (response) {
          setOrderStatus(true);
          setOrderStatusText("Order successful");
          paymentStatusModalRef.current?.classList.remove("hidden");
          setIsPaymentLoading(false);
        },
        prefill: {
          name: response.data.payment.name,
          email: response.data.payment.email,
          contact: response.data.payment.mobileNo,
        },
        theme: {
          color: "#DB4545",
        },
      };

      const razorpay = new Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        setOrderStatus(false);
        setOrderStatusText("Payment failed");
        paymentStatusModalRef.current?.classList.remove("hidden");
        setIsPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setOrderStatus(false);
      setOrderStatusText("Checkout failed");
      paymentStatusModalRef.current?.classList.remove("hidden");
    } finally {
      setIsPaymentLoading(false);
    }
  }, [Razorpay, appliedCoupon]);

  useEffect(() => {
    let total = 0;
    let subtotal = 0;
    let discount = 0;
    let shipping = 0;

    userCartItems?.forEach((item) => {
      if (!item.product) return;

      if (shipping === 0) shipping += item.product.shippingPrice || 0;

      if (item.variant) {
        total +=
          (item.variant.originalPrice || item.variant.discountedPrice) *
          (item.quantity || 1);
        subtotal += item.variant.discountedPrice * (item.quantity || 1);
        discount += item.variant.originalPrice
          ? (item.quantity || 1) *
            (item.variant.originalPrice - item.variant.discountedPrice)
          : 0;
      } else {
        total +=
          (item.product.originalPrice || item.product.discountedPrice) *
          (item.quantity || 1);
        subtotal += item.product.discountedPrice * (item.quantity || 1);
        discount += item.product.originalPrice
          ? (item.quantity || 1) *
            (item.product.originalPrice - item.product.discountedPrice)
          : 0;
      }
    });

    setTotalPrice(total);
    setTotalDiscountPrice(discount);
    setTotalShippingPrice(shipping);

    if (appliedCoupon?._id) {
      const couponDiscount = appliedCoupon.isPercentage
        ? (subtotal / 100) * (parseInt(appliedCoupon.off) || 0)
        : subtotal > (appliedCoupon.minPurchasePrice || subtotal + 100)
          ? appliedCoupon.off
          : 0;

      setCouponDiscountPrice(couponDiscount);
      setSubtotalPrice(subtotal - couponDiscount + shipping);
    } else {
      setSubtotalPrice(subtotal + shipping);
    }
  }, [userCartItems, appliedCoupon]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Empty Cart State */}
      {!userCartItems?.length && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <FiShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link
            href="/products"
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-8 rounded-lg transition-colors">
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Cart with Items */}
      {!!userCartItems?.length && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                My Cart{" "}
                <span className="text-gray-500">({userCartItems.length})</span>
              </h1>
              <button className="text-sm text-red-500 hover:text-red-600 font-medium">
                Remove All
              </button>
            </div>

            {/* Free Shipping Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center">
              <BsTruck className="text-blue-500 mr-3 flex-shrink-0" size={20} />
              <p className="text-blue-800">
                Get <span className="font-semibold">FREE delivery</span> on
                orders over ₹499
              </p>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {userCartItems?.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Coupon Section */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <FiCheckCircle className="text-green-500 mr-2" />
                          <div>
                            <p className="font-medium text-green-800">
                              Coupon Applied:{" "}
                              <span className="font-bold uppercase">
                                {appliedCoupon.code}
                              </span>
                            </p>
                            <p className="text-sm text-green-700">
                              {appliedCoupon.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-gray-400 hover:text-gray-600">
                          <RiCloseLine size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        couponModalRef.current?.classList.remove("hidden")
                      }
                      className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 transition-colors">
                      <div className="flex items-center">
                        <RiCouponLine className="text-red-500 mr-2" />
                        <span className="font-medium">Apply Coupon</span>
                      </div>
                      <IoIosArrowForward className="text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{totalPrice}</span>
                  </div>
                  {totalDiscountPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600 font-medium">
                        - ₹{totalDiscountPrice}
                      </span>
                    </div>
                  )}
                  {couponDiscountPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupon Discount</span>
                      <span className="text-green-600 font-medium">
                        - ₹{couponDiscountPrice}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {totalShippingPrice > 0
                        ? `₹${totalShippingPrice}`
                        : "FREE"}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{subtotalPrice}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => router.push("/checkout")}
                  disabled={isPaymentLoading}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-colors ${isPaymentLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
                  {isPaymentLoading ? (
                    <span className="flex items-center justify-center">
                      Processing...
                      <div className="ml-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    </span>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col items-center">
                    <RiSecurePaymentLine
                      className="text-gray-400 mb-1"
                      size={20}
                    />
                    <span className="text-xs text-gray-500 text-center">
                      Secure Payments
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RiRefund2Fill className="text-gray-400 mb-1" size={20} />
                    <span className="text-xs text-gray-500 text-center">
                      Easy Returns
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <HiFire className="text-gray-400 mb-1" size={20} />
                    <span className="text-xs text-gray-500 text-center">
                      Quality Assurance
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      <div
        ref={couponModalRef}
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Apply Coupon</h3>
            <button
              onClick={() => couponModalRef.current?.classList.add("hidden")}
              className="text-gray-400 hover:text-gray-600">
              <RiCloseLine size={24} />
            </button>
          </div>

          <form onSubmit={handleCouponSubmit}>
            <div className="mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {couponError && (
                <p className="mt-2 text-sm text-red-600">{couponError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={couponSubmitLoading || !couponCode}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white ${couponSubmitLoading || !couponCode ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
              {couponSubmitLoading ? "Applying..." : "Apply Coupon"}
            </button>
          </form>
        </div>
      </div>

      {/* Coupon Success Modal */}
      <div
        ref={couponSuccessModalRef}
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-8 text-center">
          <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Coupon Applied
          </h3>
          <p className="text-gray-600">
            Your discount has been applied successfully
          </p>
        </div>
      </div>

      {/* Payment Loading Modal */}
      <div
        ref={paymentLoadingModalRef}
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Processing Payment
          </h3>
          <p className="text-gray-600">
            Please wait while we process your payment
          </p>
        </div>
      </div>

      {/* Payment Status Modal */}
      <div
        ref={paymentStatusModalRef}
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-8 text-center">
          {orderStatus ? (
            <>
              <FiCheckCircle
                className="mx-auto text-green-500 mb-4"
                size={48}
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Order Successful
              </h3>
              <p className="text-gray-600 mb-6">Thank you for your purchase!</p>
              <Link
                href="/myorders"
                className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                View Orders
              </Link>
            </>
          ) : (
            <>
              <RiCloseLine className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">{orderStatusText}</p>
              <button
                onClick={() =>
                  paymentStatusModalRef.current?.classList.add("hidden")
                }
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors">
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
