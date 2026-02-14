// app/checkout/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import { CartApi, AddressApi, WishlistApi, CartSlice } from "@/redux";

import AddressForm from "@/components/AddressForm/AddressForm";
import { useRazorpay } from "react-razorpay";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

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

export default function CheckoutPage() {
  const router = useRouter();

  const token = useSelector((state) => state.auth.jwtToken);

  const { updateCart } = CartSlice;
  const { useGetAddressQuery } = AddressApi;
  const { useGetCartQuery, useRemoveAllCartMutation } = CartApi;
  const { useGetWishlistQuery } = WishlistApi;

  const {
    data: {
      cart: userCartItems,
      shippingPrice,
      requiredMinimumAmountForFreeDelivery,
      isFreeDeliveryMinAmntAvailable,
    } = {},
  } = useGetCartQuery({
    productType: "buy",
  });
  const { data: userWishlistItems } = useGetWishlistQuery({
    productType: "buy",
  });

  const { data: addresses, isLoading, refetch } = useGetAddressQuery();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  console.log(selectedAddress);

  const handleContinueToPayment = () => {
    console.log("Is address selected then what is the value", selectedAddress);

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    handlePayment();
  };

  const { Razorpay } = useRazorpay();

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [gatewayOption, setGatewayOption] = useState(null);

  // const [paymentGatewayList, setPaymentGatewaysList] = useState([]);

  const appliedCoupon = useSelector((state) => state.appliedCouponSlice);

  console.log("applied coupon from checkrout page", appliedCoupon);

  const [subtotalPrice, setSubtotalPrice] = useState(0); // purchase price
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [totalShippingPrice, setTotalShippingPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0); // original price without the discounts
  const [couponDiscountPrice, setCouponDiscountPrice] = useState(0); // discount of the applied coupon/if any

  const [orderStatus, setOrderStatus] = useState(true);
  const [orderStatusText, setOrderStatusText] = useState("");

  console.log(userCartItems);

  const dispatch = useDispatch();
  const navigation = useRouter();

  const transactionLoadingRef = useRef();
  const transactionStatusRef = useRef();

  // payu checkout
  const initiatePayment = (pay) => {
    const form = document.createElement("form");
    form.method = "POST";
    // form.action = "https://test.payu.in/_payment"; // URL of your payment page
    form.action = "https://secure.payu.in/_payment"; // URL of your payment page
    form.target = "CARFTER_PaymentPopup";

    // Add each key-value pair from postData as a hidden input field
    for (const key in pay) {
      if (pay.hasOwnProperty(key)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = pay[key];
        form.appendChild(input);
      }
    }

    const popup = window.open("", "_blank");
    if (popup) {
      // Submit the form when the popup is allowed
      // Append the form to the body and submit it
      document.body.appendChild(form);
      form.submit();

      // Clean up the form after submission
      document.body.removeChild(form);
      popup?.close();
    } else {
      // Inform the user if the popup was blocked
      alert("Please enable pop-ups to proceed with payment.");
    }
  };

  const handlePayUContinue = useCallback(async () => {
    // if (!gatewayOption) return;
    const isAddressAvailble = true || localStorage.getItem("isAddressAvailble");
    if (isAddressAvailble) {
      try {
        setIsPaymentLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/payu/cart-hash${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`,
          {
            headers: {},
          },
        ); // generate hash with coupon

        const pay = response.data.paymentDetails;

        initiatePayment(pay);

        transactionLoadingRef.current?.classList.remove("hidden");

        // Define a function to handle custom events from the popup
        function handlePopupEvent(event) {
          // Handle the event from the popup
          var data = event.detail;

          // Close loading indicator or perform any other actions

          if (data?.success) {
            transactionLoadingRef.current?.classList.add("hidden");
            transactionStatusRef.current?.classList.remove("hidden");
            setOrderStatusText("Order Placed Successfully");
            setOrderStatus(true);
            dispatch(updateCart({ totalCount: 0, cartItems: {} }));
          } else {
            transactionLoadingRef.current?.classList.add("hidden");
            transactionStatusRef.current?.classList.remove("hidden");
            setOrderStatus(false);
            setOrderStatusText("Order Failed");
          }
          document.removeEventListener("paymentResponseData", handlePopupEvent);
        }

        // Listen for custom events from the popup
        document.addEventListener("paymentResponseData", handlePopupEvent);
      } catch (err) {
        console.log(err);
      } finally {
        setIsPaymentLoading(false);
      }
    } else {
      navigation.push("/billing?redirect=payment-cart");
    }
  }, [appliedCoupon, gatewayOption]);

  const [removeAllCartItems] = useRemoveAllCartMutation();

  // razor pay checkouts
  const handleRazorPayContinue = useCallback(async () => {
    try {
      setIsPaymentLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pay/razorpay/cart/buy${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`,
        { address: selectedAddress },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ); // generate razor pay order id and also apply coupon if applicable

      const config = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: response.data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: process.env.NEXT_PUBLIC_BUSSINESS_NAME, //your business name
        description: response.data.productinfo,
        image: "https://i.ibb.co/Q3FPrQQm/64c844d378e5.png",
        order_id: response.data.razorpayOrderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: async function (response) {
          console.log(response);
          dispatch(updateCart({ totalCount: 0, cartItems: {} }));
          setOrderStatus(true);
          setOrderStatusText("Order successful");
          transactionStatusRef.current?.classList.remove("hidden");
          setIsPaymentLoading(false);
          //   window.scrollTo(0);
          await removeAllCartItems().unwrap();
          router.push("/myorders");
        },
        prefill: {
          name: response.data.name, //your customer's name
          email: response.data.email,
          contact: response.data.mobileNo, //Provide the customer's phone number for better conversion rates
        },
        theme: {
          color: "#DB4545",
        },
      };

      const razorPay = new Razorpay(config);

      razorPay.on("payment.failed", function (response) {
        setIsPaymentLoading(false);
        console.log(response.error.code);
        console.log(response.error.description);
        console.log(response.error.source);
        console.log(response.error.step);
        console.log(response.error.reason);
        console.log(response.error.metadata.order_id);
        console.log(response.error.metadata.payment_id);
      });

      razorPay.on("payment.dispute.lost", function (response) {
        setIsPaymentLoading(false);
        console.log("Disput closed");
      });

      razorPay.on("payment.dispute.created", function (response) {
        console.log("payment.dispute.created");
      });

      razorPay.on("payment.dispute.closed", function (response) {
        setIsPaymentLoading(false);
        console.log("payment.dispute.closed");
      });

      razorPay.open();
    } catch (error) {
      console.error(error.message);
    }
  }, [Razorpay, appliedCoupon, gatewayOption, selectedAddress]);

  const handlePayment = () => {
    switch (gatewayOption) {
      case "razorpay":
        return handleRazorPayContinue();
      case "payu":
        return handlePayUContinue();
      default:
        return handleRazorPayContinue();
    }
  };

  useEffect(() => {
    let totalPrice = 0;
    let subtotalPrice = 0;
    let totalDiscountPrice = 0;

    let shippingPrice = 0;

    userCartItems?.forEach((item) => {
      if (!item.product && !item.variant) return;

      if (shippingPrice === 0) shippingPrice += item.product.shippingPrice || 0;

      console.log(
        "Item shipping price cart item",
        item.product.shippingPrice,
        shippingPrice,
      );

      if (item.variant) {
        totalPrice +=
          (item.variant.originalPrice || item.variant.discountedPrice) *
          (item.quantity || 1);
        subtotalPrice += item.variant.discountedPrice * (item.quantity || 1);
        totalDiscountPrice += !!item.variant.originalPrice
          ? (item.quantity || 1) *
            (item.variant.originalPrice - item.variant.discountedPrice)
          : 0;
      } else if (item.product) {
        totalPrice +=
          (item.product.originalPrice || item.product.discountedPrice) *
          (item.quantity || 1);
        subtotalPrice += item.product.discountedPrice * (item.quantity || 1);
        totalDiscountPrice += !!item.product.originalPrice
          ? (item.quantity || 1) *
            (item.product.originalPrice - item.product.discountedPrice)
          : 0;
      }
    });
    console.log("Total Price", totalPrice + shippingPrice);

    setTotalPrice(totalPrice);
    setTotalDiscountPrice(totalDiscountPrice);
    setTotalShippingPrice(shippingPrice);

    if (!!appliedCoupon && appliedCoupon._id) {
      const couponDiscountPrice = appliedCoupon.isPercentage
        ? (subtotalPrice / 100) * (parseInt(appliedCoupon.off) || 0)
        : subtotalPrice > appliedCoupon.minPurchasePrice
          ? appliedCoupon.off
          : 0;

      console.log("What is coupon discount price", couponDiscountPrice);

      setCouponDiscountPrice(couponDiscountPrice);

      setCouponDiscountPrice(couponDiscountPrice);
      setSubtotalPrice(
        subtotalPrice - (couponDiscountPrice || 0) + shippingPrice,
      );
    } else {
      setSubtotalPrice(subtotalPrice + shippingPrice);
    }
  }, [userCartItems, appliedCoupon]);

  // const getPaymentGateways = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/gateways`
  //     );
  //     console.log(response.data.data);
  //     setPaymentGatewaysList(response.data.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   console.log(paymentGatewayList);
  //   setGatewayOption(
  //     paymentGatewayList.length > 0 ? paymentGatewayList[0].title : null
  //   );
  // }, [paymentGatewayList]);

  // useEffect(() => {
  //   getPaymentGateways();
  // }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Delivery Details Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Delivery Details
                </h2>
                <span className="text-sm text-gray-500">Step 1 of 2</span>
              </div>

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ) : addresses?.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">
                    Select Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        onClick={() => setSelectedAddress(address._id)}
                        className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          selectedAddress === address._id
                            ? "border-red-500 bg-red-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {address.fullName}
                          </h4>
                          {selectedAddress === address._id && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-gray-600">
                          <p>{address.streetName}</p>
                          <p>
                            {address.city}, {address.state} -{" "}
                            {address.postalCode}
                          </p>
                          <p>Phone: {address.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No saved addresses found</p>
                </div>
              )}

              <button
                onClick={() => setIsAddingAddress(true)}
                className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-gray-400 hover:text-gray-800 transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Address
                </div>
              </button>

              {isAddingAddress && (
                <div className="mt-6">
                  <AddressForm
                    onSuccess={() => {
                      setIsAddingAddress(false);
                      refetch();
                    }}
                    onCancel={() => setIsAddingAddress(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">MRP </span>
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
                    <span className="text-gray-600">After Discount</span>
                    <span className="font-bold">₹{subtotalPrice}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold">
                      {isFreeDeliveryMinAmntAvailable
                        ? requiredMinimumAmountForFreeDelivery <= subtotalPrice
                          ? "FREE"
                          : shippingPrice > 0 ? `₹${shippingPrice}` : "FREE"
                        : "FREE"}
                    </span>
                  </div>
                </div>

                {appliedCoupon?.code && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Applied</span>
                    <span className="text-green-600 font-medium">
                      {appliedCoupon.code}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {isFreeDeliveryMinAmntAvailable
                        ? requiredMinimumAmountForFreeDelivery <= subtotalPrice
                          ? `₹${subtotalPrice}`
                          : `₹${subtotalPrice + shippingPrice}`
                        : `₹${subtotalPrice + shippingPrice}`} <span className="text-xs text-gray-500">{isFreeDeliveryMinAmntAvailable
                        ? requiredMinimumAmountForFreeDelivery <= subtotalPrice
                          ? `₹${subtotalPrice}`
                          : `(${subtotalPrice} + ${shippingPrice > 0 ? shippingPrice : "FREE"})`
                        : `(${subtotalPrice} + FREE)`}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                disabled={!selectedAddress || isPaymentLoading}
                className={`mt-6 w-full py-4 px-6 rounded-xl font-bold text-white transition-colors text-white ${
                  !selectedAddress
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 cursor-pointer"
                }`}>
                {isPaymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span className="text-white">Processing...</span>
                  </div>
                ) : (
                  "Continue to Payment"
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
    </div>
  );
}
