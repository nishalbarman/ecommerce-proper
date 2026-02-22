"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRazorpay } from "react-razorpay";

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
import { WishlistApi, CartApi, AppliedCouponSlice, AddressApi } from "@/redux";
import { useRemoveAllCartMutation } from "@/redux/apis/cartApi";
import { clearCouponData } from "@/redux/slices/appliedCouponSlice";
import AddressForm from "../AddressForm/AddressForm";
import { setUserSelectedAddress } from "@/redux/slices/addressSlice";

function Cart() {
  const { useGetCartQuery } = CartApi;
  const { useGetWishlistQuery } = WishlistApi;
  const { updateAppliedCoupon } = AppliedCouponSlice;
  const { useGetAddressQuery } = AddressApi;

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

  const {
    data: addresses,
    isLoading: isAddressFetchLoading,
    refetch: refetchAddress,
  } = useGetAddressQuery();

  const [removeALlCart] = useRemoveAllCartMutation();

  const { error, isLoading, Razorpay } = useRazorpay();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSubmitLoading, setCouponSubmitLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentGatewayList] = useState([]);

  const appliedCoupon = useSelector((state) => state.appliedCouponSlice);
  // const [appliedCoupon, setAppliedCoupon] = useState(
  //   appliedCouponReduxStore._id ? appliedCouponReduxStore : null,
  // );

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
        `${process.env.NEXT_PUBLIC_SERVER_URL}/coupons/validate?code=${couponCode}`,
      );

      if (!response.data.coupon) {
        return setCouponError(response.data.message || "Invalid coupon");
      }

      const couponData = response?.data;

      console.log("Coupon Data", couponData);

      if (!couponData) {
        return setCouponError(couponData?.message || "Invalid coupon");
      }

      let subtotalPrice = purchasablePrice;

      console.log("Subtotal Price", subtotalPrice);

      const isFreeDeliveryAvailable =
        requiredMinimumAmountForFreeDelivery > 0 &&
        subtotalPrice >= requiredMinimumAmountForFreeDelivery;

      if (!isFreeDeliveryAvailable) {
        subtotalPrice += shippingPrice;
      }

      const coupon = couponData.coupon;
      console.log("Applied Coupon Here", coupon);

      let discount = null;
      if (coupon?.minPurchasePrice > 0) {
        if (subtotalPrice < coupon?.minPurchasePrice) {
          setCouponError(
            "Minimum purchase price not met,\n Minimum purchase price is " +
              coupon?.minPurchasePrice,
          );
          return;
        }
        discount = coupon.isPercentage
          ? subtotalPrice >= coupon.minPurchasePrice
            ? (subtotalPrice / 100) * (parseInt(coupon.off) || 0)
            : 0
          : subtotalPrice >= coupon.minPurchasePrice
            ? coupon.off
            : 0;
      } else {
        discount = coupon.isPercentage
          ? (subtotalPrice / 100) * (parseInt(coupon.off) || 0)
          : coupon.off || 0;
      }

      setCouponDiscountPrice(discount.toFixed(2));
      // setAppliedCoupon(discount > 0 ? coupon : null);
      dispatch(updateAppliedCoupon(discount > 0 ? coupon : null));
      // dispatch(updateAppliedCoupon(coupon));
      // setSubtotalPrice((prev) => prev - discount);

      couponModalRef.current?.classList.add("hidden");
      couponSuccessModalRef.current?.classList.remove("hidden");

      setTimeout(() => {
        couponSuccessModalRef.current?.classList.add("hidden");
      }, 1500);
    } catch (error) {
      console.log("Coupon Error", error);
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setCouponSubmitLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    // setAppliedCoupon(null);
    setCouponDiscountPrice(0);
    dispatch(clearCouponData());
    // setSubtotalPrice((prev) => prev + couponDiscountPrice);
  };

  const handleRemoveAllCart = () => {
    try {
      removeALlCart();
    } catch (error) {
      console.error("Failed to remove all items from cart", error);
    }
  };

  // const handleRazorPayCheckout = useCallback(async () => {
  //   try {
  //     setIsPaymentLoading(true);
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_SERVER_URL}/pay/razorpay/cart/buy${appliedCoupon?._id ? "?coupon=" + appliedCoupon._id : ""}`,
  //       {},
  //       { withCredentials: true },
  //     );

  //     const options = {
  //       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  //       amount: response.data.payment.amount,
  //       currency: "INR",
  //       name: process.env.NEXT_PUBLIC_BUSSINESS_NAME,
  //       description: response.data.payment.productinfo,
  //       image: "https://i.ibb.co/Q3FPrQQm/64c844d378e5.png",
  //       order_id: response.data.payment.razorpayOrderId,
  //       handler: function (response) {
  //         setOrderStatus(true);
  //         setOrderStatusText("Order successful");
  //         paymentStatusModalRef.current?.classList.remove("hidden");
  //         setIsPaymentLoading(false);
  //       },
  //       prefill: {
  //         name: response.data.payment.name,
  //         email: response.data.payment.email,
  //         contact: response.data.payment.mobileNo,
  //       },
  //       theme: {
  //         color: "#DB4545",
  //       },
  //     };

  //     const razorpay = new Razorpay(options);
  //     razorpay.on("payment.failed", function (response) {
  //       setOrderStatus(false);
  //       setOrderStatusText("Payment failed");
  //       paymentStatusModalRef.current?.classList.remove("hidden");
  //       setIsPaymentLoading(false);
  //     });

  //     razorpay.open();
  //   } catch (error) {
  //     setOrderStatus(false);
  //     setOrderStatusText("Checkout failed");
  //     paymentStatusModalRef.current?.classList.remove("hidden");
  //   } finally {
  //     setIsPaymentLoading(false);
  //   }
  // }, [Razorpay, appliedCoupon]);

  const [MRP, setMRP] = useState(0);
  const [purchasablePrice, setPurchasablePrice] = useState(0);
  const [
    totalDiscountPrice_OrignalPriceMinusPurchasablePrice,
    setDiscountPrice_OrignalPriceMinusPurchasablePrice,
  ] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [couponDiscountPrice, setCouponDiscountPrice] = useState(0); // discount of the applied coupon/if any

  const [isShippingApplied, setIsShippingApplied] = useState(true);

  useEffect(() => {
    let MRP = 0;
    let purchasablePrice = 0;
    let totalDiscount_OriginalMinusPurchasable = 0;

    userCartItems?.forEach((item) => {
      if (!item.product) return;

      if (item.variant) {
        MRP +=
          (item.variant.originalPrice || item.variant.discountedPrice) *
          (item.quantity || 1);

        purchasablePrice += item.variant.discountedPrice * (item.quantity || 1);

        totalDiscount_OriginalMinusPurchasable += item.variant.originalPrice
          ? (item.quantity || 1) *
            (item.variant.originalPrice - item.variant.discountedPrice)
          : 0;
      } else {
        MRP +=
          (item.product.originalPrice || item.product.discountedPrice) *
          (item.quantity || 1);

        purchasablePrice += item.product.discountedPrice * (item.quantity || 1);

        totalDiscount_OriginalMinusPurchasable += item.product.originalPrice
          ? (item.quantity || 1) *
            (item.product.originalPrice - item.product.discountedPrice)
          : 0;
      }
    });

    setMRP(MRP);
    setPurchasablePrice(purchasablePrice);
    setDiscountPrice_OrignalPriceMinusPurchasablePrice(
      totalDiscount_OriginalMinusPurchasable,
    );

    const isFreeDeliveryAvailable =
      requiredMinimumAmountForFreeDelivery > 0 &&
      purchasablePrice >= requiredMinimumAmountForFreeDelivery;

    let finalPrice = purchasablePrice;
    setIsShippingApplied(false);
    setFinalPrice(purchasablePrice);

    if (!isFreeDeliveryAvailable) {
      setIsShippingApplied(true);
      setFinalPrice(purchasablePrice + shippingPrice);
      finalPrice += shippingPrice;
    }

    if (!!appliedCoupon && appliedCoupon?._id) {
      const couponDiscountPrice = appliedCoupon.isPercentage
        ? (finalPrice / 100) * (parseInt(appliedCoupon.off) || 0)
        : finalPrice > appliedCoupon.minPurchasePrice
          ? appliedCoupon.off
          : 0;

      setCouponDiscountPrice(couponDiscountPrice.toFixed(2));

      setFinalPrice(finalPrice - (couponDiscountPrice || 0));
    }
  }, [userCartItems, appliedCoupon]);

  const selectedDefaultAddress = useSelector((state) => state.addressSlice?.selectedAddress);

  const [selectedAddress, setSelectedAddress] = useState(selectedDefaultAddress || null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleSelectedAddressChange = (address) => {
    setSelectedAddress(address);
    dispatch(setUserSelectedAddress(address));
  };
  

  let handlePayment=() => {
                    setIsPaymentLoading(true);
                    router.push("/checkout");
                  }

  // const handleContinueToPayment = () => {
  //   console.log("Is address selected then what is the value", selectedAddress);

  //   if (!selectedAddress) {
  //     toast.error("Please select a delivery address");
  //     return;
  //   }

  //   handlePayment();
  // };

  // const { Razorpay } = useRazorpay();

  // const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // const [gatewayOption, setGatewayOption] = useState(null);

  // const [paymentGatewayList, setPaymentGatewaysList] = useState([]);

  // const appliedCoupon = useSelector((state) => state.appliedCouponSlice);

  console.log("applied coupon from checkrout page", appliedCoupon);

  const [subtotalPrice, setSubtotalPrice] = useState(0); // purchase price
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [totalShippingPrice, setTotalShippingPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0); // original price without the discounts

  // const [orderStatus, setOrderStatus] = useState(true);
  // const [orderStatusText, setOrderStatusText] = useState("");

  // console.log(userCartItems);

  // const dispatch = useDispatch();
  // const navigation = useRouter();

  // const transactionLoadingRef = useRef();
  // const transactionStatusRef = useRef();

  // payu checkout
  // const initiatePayment = (pay) => {
  //   const form = document.createElement("form");
  //   form.method = "POST";
  //   // form.action = "https://test.payu.in/_payment"; // URL of your payment page
  //   form.action = "https://secure.payu.in/_payment"; // URL of your payment page
  //   form.target = "CARFTER_PaymentPopup";

  //   // Add each key-value pair from postData as a hidden input field
  //   for (const key in pay) {
  //     if (pay.hasOwnProperty(key)) {
  //       const input = document.createElement("input");
  //       input.type = "hidden";
  //       input.name = key;
  //       input.value = pay[key];
  //       form.appendChild(input);
  //     }
  //   }

  //   const popup = window.open("", "_blank");
  //   if (popup) {
  //     // Submit the form when the popup is allowed
  //     // Append the form to the body and submit it
  //     document.body.appendChild(form);
  //     form.submit();

  //     // Clean up the form after submission
  //     document.body.removeChild(form);
  //     popup?.close();
  //   } else {
  //     // Inform the user if the popup was blocked
  //     alert("Please enable pop-ups to proceed with payment.");
  //   }
  // };

  // const handlePayUContinue = useCallback(async () => {
  //   // if (!gatewayOption) return;
  //   const isAddressAvailble = true || localStorage.getItem("isAddressAvailble");
  //   if (isAddressAvailble) {
  //     try {
  //       setIsPaymentLoading(true);
  //       const response = await axios.get(
  //         `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/payu/cart-hash${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`,
  //         {
  //           headers: {},
  //         },
  //       ); // generate hash with coupon

  //       const pay = response.data.paymentDetails;

  //       initiatePayment(pay);

  //       transactionLoadingRef.current?.classList.remove("hidden");

  //       // Define a function to handle custom events from the popup
  //       function handlePopupEvent(event) {
  //         // Handle the event from the popup
  //         var data = event.detail;

  //         // Close loading indicator or perform any other actions

  //         if (data?.success) {
  //           transactionLoadingRef.current?.classList.add("hidden");
  //           transactionStatusRef.current?.classList.remove("hidden");
  //           setOrderStatusText("Order Placed Successfully");
  //           setOrderStatus(true);
  //           dispatch(updateCart({ totalCount: 0, cartItems: {} }));
  //         } else {
  //           transactionLoadingRef.current?.classList.add("hidden");
  //           transactionStatusRef.current?.classList.remove("hidden");
  //           setOrderStatus(false);
  //           setOrderStatusText("Order Failed");
  //         }
  //         document.removeEventListener("paymentResponseData", handlePopupEvent);
  //       }

  //       // Listen for custom events from the popup
  //       document.addEventListener("paymentResponseData", handlePopupEvent);
  //     } catch (err) {
  //       console.log(err);
  //     } finally {
  //       setIsPaymentLoading(false);
  //     }
  //   } else {
  //     navigation.push("/billing?redirect=payment-cart");
  //   }
  // }, [appliedCoupon, gatewayOption]);

  // const [removeAllCartItems] = useRemoveAllCartMutation();

  // razor pay checkouts
  // const handleRazorPayContinue = useCallback(async () => {
  //   try {
  //     setIsPaymentLoading(true);
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_SERVER_URL}/pay/razorpay/cart/buy${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`,
  //       { address: selectedAddress },
  //       {
  //         withCredentials: true,
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     ); // generate razor pay order id and also apply coupon if applicable

  //     const config = {
  //       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  //       amount: response.data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
  //       currency: "INR",
  //       name: process.env.NEXT_PUBLIC_BUSSINESS_NAME, //your business name
  //       description: response.data.productinfo,
  //       image: "https://i.ibb.co/Q3FPrQQm/64c844d378e5.png",
  //       order_id: response.data.razorpayOrderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
  //       handler: async function (response) {
  //         console.log(response);
  //         dispatch(updateCart({ totalCount: 0, cartItems: {} }));
  //         setOrderStatus(true);
  //         setOrderStatusText("Order successful");
  //         transactionStatusRef.current?.classList.remove("hidden");
  //         setIsPaymentLoading(false);
  //         //   window.scrollTo(0);
  //         await removeAllCartItems().unwrap();
  //         router.push("/myorders");
  //       },
  //       prefill: {
  //         name: response.data.name, //your customer's name
  //         email: response.data.email,
  //         contact: response.data.mobileNo, //Provide the customer's phone number for better conversion rates
  //       },
  //       theme: {
  //         color: "#DB4545",
  //       },
  //     };

  //     const razorPay = new Razorpay(config);

  //     razorPay.on("payment.failed", function (response) {
  //       setIsPaymentLoading(false);
  //       console.log(response.error.code);
  //       console.log(response.error.description);
  //       console.log(response.error.source);
  //       console.log(response.error.step);
  //       console.log(response.error.reason);
  //       console.log(response.error.metadata.order_id);
  //       console.log(response.error.metadata.payment_id);
  //     });

  //     razorPay.on("payment.dispute.lost", function (response) {
  //       setIsPaymentLoading(false);
  //       console.log("Disput closed");
  //     });

  //     razorPay.on("payment.dispute.created", function (response) {
  //       console.log("payment.dispute.created");
  //     });

  //     razorPay.on("payment.dispute.closed", function (response) {
  //       setIsPaymentLoading(false);
  //       console.log("payment.dispute.closed");
  //     });

  //     razorPay.open();
  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // }, [Razorpay, appliedCoupon, gatewayOption, selectedAddress]);

  // const handlePayment = () => {
  //   switch (gatewayOption) {
  //     case "razorpay":
  //       return handleRazorPayContinue();
  //     case "payu":
  //       return handlePayUContinue();
  //     default:
  //       return handleRazorPayContinue();
  //   }
  // };

  // const handleCouponSubmit = async (e) => {
  //   e.preventDefault();
  //   setCouponSubmitLoading(true);
  //   setCouponError("");

  //   try {
  //     if (!couponCode) {
  //       return setCouponError("Please enter a coupon code");
  //     }

  //     if (appliedCoupon?.code?.toLowerCase() === couponCode.toLowerCase()) {
  //       return setCouponError("Coupon already applied");
  //     }

  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_SERVER_URL}/coupons/validate?code=${couponCode}`,
  //     );

  //     if (!response.data.coupon) {
  //       return setCouponError(response.data.message || "Invalid coupon");
  //     }

  //     const couponData = response?.data;

  //     console.log("Coupon Data", couponData);

  //     if (!couponData) {
  //       return setCouponError(couponData?.message || "Invalid coupon");
  //     }

  //     let subtotalPrice = purchasablePrice;

  //     console.log("Subtotal Price", subtotalPrice);

  //     const isFreeDeliveryAvailable =
  //       requiredMinimumAmountForFreeDelivery > 0 &&
  //       subtotalPrice >= requiredMinimumAmountForFreeDelivery;

  //     if (!isFreeDeliveryAvailable) {
  //       subtotalPrice += shippingPrice;
  //     }

  //     const coupon = couponData.coupon;
  //     console.log("Applied Coupon Here", coupon);

  //     let discount = null;
  //     if (coupon?.minPurchasePrice > 0) {
  //       if (subtotalPrice < coupon?.minPurchasePrice) {
  //         setCouponError(
  //           "Minimum purchase price not met,\n Minimum purchase price is " +
  //             coupon?.minPurchasePrice,
  //         );
  //         return;
  //       }
  //       discount = coupon.isPercentage
  //         ? subtotalPrice >= coupon.minPurchasePrice
  //           ? (subtotalPrice / 100) * (parseInt(coupon.off) || 0)
  //           : 0
  //         : subtotalPrice >= coupon.minPurchasePrice
  //           ? coupon.off
  //           : 0;
  //     } else {
  //       discount = coupon.isPercentage
  //         ? (subtotalPrice / 100) * (parseInt(coupon.off) || 0)
  //         : coupon.off || 0;
  //     }

  //     setCouponDiscountPrice(discount.toFixed(2));
  //     // setAppliedCoupon(discount > 0 ? coupon : null);
  //     dispatch(updateAppliedCoupon(discount > 0 ? coupon : null));
  //     // dispatch(updateAppliedCoupon(coupon));
  //     // setSubtotalPrice((prev) => prev - discount);

  //     couponModalRef.current?.classList.add("hidden");
  //     couponSuccessModalRef.current?.classList.remove("hidden");

  //     setTimeout(() => {
  //       couponSuccessModalRef.current?.classList.add("hidden");
  //     }, 1500);
  //   } catch (error) {
  //     console.log("Coupon Error", error);
  //     setCouponError(error.response?.data?.message || "Failed to apply coupon");
  //   } finally {
  //     setCouponSubmitLoading(false);
  //   }
  // };

  // const handleRemoveCoupon = () => {
  //   // setAppliedCoupon(null);
  //   setCouponDiscountPrice(0);
  //   dispatch(clearCouponData());
  //   // setSubtotalPrice((prev) => prev + couponDiscountPrice);
  // };

  // const couponModalRef = useRef();
  // const couponSuccessModalRef = useRef();
  // const paymentLoadingModalRef = useRef();
  // const paymentStatusModalRef = useRef();

  // const [couponCode, setCouponCode] = useState("");
  // const [couponError, setCouponError] = useState("");
  // const [couponSubmitLoading, setCouponSubmitLoading] = useState(false);

  // const [MRP, setMRP] = useState(0);
  // const [purchasablePrice, setPurchasablePrice] = useState(0);
  // const [
  //   totalDiscountPrice_OrignalPriceMinusPurchasablePrice,
  //   setDiscountPrice_OrignalPriceMinusPurchasablePrice,
  // ] = useState(0);
  // const [finalPrice, setFinalPrice] = useState(0);

  // const [couponDiscountPrice, setCouponDiscountPrice] = useState(0); // discount of the applied coupon/if any

  // const [isShippingApplied, setIsShippingApplied] = useState(true);

  // useEffect(() => {
  //   let MRP = 0;
  //   let purchasablePrice = 0;
  //   let totalDiscount_OriginalMinusPurchasable = 0;

  //   userCartItems?.forEach((item) => {
  //     if (!item.product) return;

  //     if (item.variant) {
  //       MRP +=
  //         (item.variant.originalPrice || item.variant.discountedPrice) *
  //         (item.quantity || 1);

  //       purchasablePrice += item.variant.discountedPrice * (item.quantity || 1);

  //       totalDiscount_OriginalMinusPurchasable += item.variant.originalPrice
  //         ? (item.quantity || 1) *
  //           (item.variant.originalPrice - item.variant.discountedPrice)
  //         : 0;
  //     } else {
  //       MRP +=
  //         (item.product.originalPrice || item.product.discountedPrice) *
  //         (item.quantity || 1);

  //       purchasablePrice += item.product.discountedPrice * (item.quantity || 1);

  //       totalDiscount_OriginalMinusPurchasable += item.product.originalPrice
  //         ? (item.quantity || 1) *
  //           (item.product.originalPrice - item.product.discountedPrice)
  //         : 0;
  //     }
  //   });

  //   setMRP(MRP);
  //   setPurchasablePrice(purchasablePrice);
  //   setDiscountPrice_OrignalPriceMinusPurchasablePrice(
  //     totalDiscount_OriginalMinusPurchasable,
  //   );

  //   const isFreeDeliveryAvailable =
  //     requiredMinimumAmountForFreeDelivery > 0 &&
  //     purchasablePrice >= requiredMinimumAmountForFreeDelivery;

  //   let finalPrice = purchasablePrice;
  //   setIsShippingApplied(false);
  //   setFinalPrice(purchasablePrice);

  //   if (!isFreeDeliveryAvailable) {
  //     setIsShippingApplied(true);
  //     setFinalPrice(purchasablePrice + shippingPrice);
  //     finalPrice += shippingPrice;
  //   }

  //   if (!!appliedCoupon && appliedCoupon?._id) {
  //     const couponDiscountPrice = appliedCoupon.isPercentage
  //       ? (finalPrice / 100) * (parseInt(appliedCoupon.off) || 0)
  //       : finalPrice > appliedCoupon.minPurchasePrice
  //         ? appliedCoupon.off
  //         : 0;

  //     setCouponDiscountPrice(couponDiscountPrice.toFixed(2));

  //     setFinalPrice(finalPrice - (couponDiscountPrice || 0));
  //   }
  // }, [userCartItems, appliedCoupon]);

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
              <button
                onClick={handleRemoveAllCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium cursor-pointer">
                Remove All
              </button>
            </div>

            {/* Free Shipping Banner */}
            {isFreeDeliveryMinAmntAvailable && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center">
                <BsTruck
                  className="text-blue-500 mr-3 flex-shrink-0"
                  size={20}
                />
                <p className="text-blue-800">
                  Get <span className="font-semibold">FREE delivery</span> on
                  orders over ₹{requiredMinimumAmountForFreeDelivery}
                </p>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              {userCartItems?.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            {/* Delivery Details Section */}
            <div className="w-full hidden">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Delivery Details
                    </h2>
                    {/* <span className="text-sm text-gray-500">Step 1 of 2</span> */}
                  </div>

                  {isAddressFetchLoading ? (
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
                            onClick={() => handleSelectedAddressChange(address._id)}
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
                      <p className="text-gray-600 mb-4">
                        No saved addresses found
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer">
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
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">

          <div className="w-full">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Delivery Details
                    </h2>
                    {/* <span className="text-sm text-gray-500">Step 1 of 2</span> */}
                  </div>

                  {isAddressFetchLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ) : addresses?.length > 0 ? (
                    <div className="space-y-6">
                      <h3 className="text-lg max-md:text-md font-medium text-gray-800 -mt-2">
                        Select Delivery Address
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            onClick={() => handleSelectedAddressChange(address._id)}
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
                      <p className="text-gray-600 mb-4">
                        No saved addresses found
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer">
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

            <div className="mt-5 bg-white rounded-xl shadow-sm border border-gray-200 sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Coupon Section */}
                <div className="mb-6">
                  {appliedCoupon?.code ? (
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
                          className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <RiCloseLine size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        couponModalRef.current?.classList.remove("hidden")
                      }
                      className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 transition-colors cursor-pointer">
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
                    <span className="text-gray-600">MRP </span>
                    <span className="font-medium">₹{MRP}</span>
                  </div>
                  {totalDiscountPrice_OrignalPriceMinusPurchasablePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600 font-medium">
                        - ₹
                        {totalDiscountPrice_OrignalPriceMinusPurchasablePrice}
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
                    <span className="font-bold">₹{purchasablePrice}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold">
                      {isShippingApplied > 0 ? `₹${shippingPrice}` : "FREE"}
                    </span>
                  </div>

                  {couponDiscountPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupon Discount</span>
                      <span className="text-green-600 font-medium">
                        - ₹{couponDiscountPrice}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {`₹${finalPrice}`}{" "}
                      <span className="text-xs text-gray-500">
                        {isShippingApplied > 0
                          ? appliedCoupon?.code
                            ? `(${purchasablePrice} + ${shippingPrice}) - ${couponDiscountPrice}`
                            : `(${purchasablePrice} + ${shippingPrice})`
                          : "FREE"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handlePayment}
                  disabled={isPaymentLoading || !finalPrice || !selectedAddress || !userCartItems?.length}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-colors bg-primary disabled:cursor-not-allowed disabled:bg-gray-500 hover:bg-red-600 cursor-pointer`}>
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
        className="hidden fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Apply Coupon</h3>
            <button
              onClick={() => couponModalRef.current?.classList.add("hidden")}
              className="text-gray-400 hover:text-gray-600 cursor-pointer">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline"
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
        className="hidden fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
        className="hidden fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
        className="hidden fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
