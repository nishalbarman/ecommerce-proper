// app/checkout/page.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  FiCheckCircle,
  FiChevronDown,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { BsTruck } from "react-icons/bs";
import CartItem from "@/components/Cart/CartItem";
import Link from "next/link";
import {
  clearCouponData,
  updateAppliedCoupon,
} from "@/redux/slices/appliedCouponSlice";
import { set } from "mongoose";

export default function CheckoutPage() {
  const router = useRouter();

  const token = useSelector((state) => state.auth.jwtToken);

  const { updateCart } = CartSlice;
  const { useGetAddressQuery } = AddressApi;
  // const { useGetCartQuery, useRemoveAllCartMutation } = CartApi;
  // const { useGetWishlistQuery } = WishlistApi;

  const [productData, setProductData] = useState(null);

  const { data: addresses, isLoading, refetch } = useGetAddressQuery();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const searchParams = useSearchParams();

  console.log(selectedAddress);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSubmitLoading, setCouponSubmitLoading] = useState(false);
  const [paymentGatewayList] = useState([]);

  const appliedCouponReduxStore = useSelector(
    (state) => state.appliedCouponSlice,
  );
  // const [appliedCoupon, setAppliedCoupon] = useState(
  //   appliedCouponReduxStore._id ? appliedCouponReduxStore : null,
  // );

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

  console.log("Applied Coupon From State", appliedCoupon);

  const [shippingPricing, setShippingPricing] = useState({});

  const [orderStatus, setOrderStatus] = useState(true);
  const [orderStatusText, setOrderStatusText] = useState("");

  const pathname = usePathname();

  const dispatch = useDispatch();
  const navigation = useRouter();

  const transactionLoadingRef = useRef();
  const transactionStatusRef = useRef();

  const getProductInfo = async () => {
    try {
      const productId = searchParams.get("productId");
      const productVariantId = searchParams.get("productVariantId");
      const quantity = searchParams.get("quantity");

      let response = null;
      if (productVariantId) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view-variant/${productVariantId}`,
          {
            headers: {
              "Contect-Type": "application/json",
            },
            method: "POST",
          },
        );
        const data = await response.json();
        setProductData(data?.variant);
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view/${productId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setProductData(data?.product);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load, contact admin");
    }
  };

  console.log(productData);

  const getShippingPricing = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/shipping-config/shipping-pricing/buy`,
      );
      const shippingPricing = response.data;
      setShippingPricing(shippingPricing);
      console.log("Shipping Pricing:", shippingPricing);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load, contact admin");
    }
  };

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

  // razor pay checkouts
  const handleRazorPayContinue = useCallback(async () => {
    try {
      setIsPaymentLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pay/razorpay/single/buy${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`,
        {
          address: selectedAddress,
          productId: searchParams.get("productId"),
          productVariantId: searchParams.get("productVariantId"),
          quantity: searchParams.get("quantity"),
          coupon: appliedCoupon._id,
        },
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
          // setIsPaymentLoading(false);
          //   window.scrollTo(0);
          toast.success("Payment successful, redirecting to orders page...");
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
      setIsPaymentLoading(false);
    } finally {
      setIsPaymentLoading(false);
    }
  }, [Razorpay, appliedCoupon, gatewayOption, selectedAddress, searchParams]);

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
      const error = [];
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
      console.error("Coupon Error", error);
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

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 50) return;
    setProductQuantity(newQuantity);
    const params = new URLSearchParams(searchParams.toString());
    params.set("quantity", newQuantity);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    getProductInfo();
    getShippingPricing();
  }, []);

  const [productQuantity, setProductQuantity] = useState(
    +searchParams.get("quantity") || 1,
  );
  const [MRP, setMRP] = useState(0);
  const [purchasablePrice, setPurchasablePrice] = useState(0);
  const [
    totalDiscountPrice_OrignalPriceMinusPurchasablePrice,
    setDiscountPrice_OrignalPriceMinusPurchasablePrice,
  ] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [couponDiscountPrice, setCouponDiscountPrice] = useState(0); // discount of the applied coupon/if any

  const [shippingPrice, setShippingPrice] = useState(0);
  const [isShippingApplied, setIsShippingApplied] = useState(true);

  const [
    requiredMinimumAmountForFreeDelivery,
    setRequiredMinimumAmountForFreeDelivery,
  ] = useState(0);

  useEffect(() => {
    if (shippingPricing) {
      setRequiredMinimumAmountForFreeDelivery(
        shippingPricing.requiredMinimumAmountForFreeDelivery,
      );
      setShippingPrice(shippingPricing.shippingPrice);
    }
  }, [shippingPricing]);

  useEffect(() => {
    if (!productData || !shippingPricing) return;

    const MRP =
      (productData.originalPrice || productData.discountedPrice) *
      (productQuantity || 1);

    const purchasablePrice =
      productData.discountedPrice * (productQuantity || 1);

    const totalDiscount_OriginalMinusPurchasable = !!productData.originalPrice
      ? (productQuantity || 1) *
        (productData.originalPrice - productData.discountedPrice)
      : 0;

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
      let couponDiscountPrice = 0;

      if (appliedCoupon?.minPurchasePrice > 0) {
        if (finalPrice < appliedCoupon?.minPurchasePrice) {
          setCouponError(
            "Minimum purchase price not met,\n Minimum purchase price is " +
              appliedCoupon?.minPurchasePrice,
          );
          return;
        }

        couponDiscountPrice = appliedCoupon.isPercentage
          ? finalPrice >= appliedCoupon.minPurchasePrice
            ? (finalPrice / 100) * (parseInt(appliedCoupon.off) || 0)
            : 0
          : finalPrice >= appliedCoupon.minPurchasePrice
            ? appliedCoupon.off
            : 0;
      } else {
        couponDiscountPrice = appliedCoupon.isPercentage
          ? (finalPrice / 100) * (parseInt(appliedCoupon.off) || 0)
          : appliedCoupon.off || 0;
      }

      // const couponDiscountPrice = appliedCoupon.isPercentage
      //   ? (finalPrice / 100) * (parseInt(appliedCoupon.off) || 0)
      //   : finalPrice > appliedCoupon.minPurchasePrice
      //     ? appliedCoupon.off
      //     : 0;

      setCouponDiscountPrice(couponDiscountPrice.toFixed(2));

      setFinalPrice(finalPrice - (couponDiscountPrice.toFixed(2) || 0));
    }
  }, [
    productData,
    appliedCoupon,
    shippingPricing,
    productQuantity,
    shippingPrice,
    requiredMinimumAmountForFreeDelivery,
  ]);

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

  console.log(productData);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Summary</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Delivery Details Section */}
          <div className="lg:w-2/3">
            <div className="space-y-4">
              {/* Cart Items List */}
              <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 transition-shadow duration-300 border border-gray-100 overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row p-4 gap-4">
                  {/* Product Image */}
                  <div className="w-full md:w-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    {/* <Link href={`/products/view/${product?._id}`}> */}
                    <img
                      className="w-full h-32 object-contain hover:scale-105 transition-transform duration-300"
                      src={productData?.previewImage}
                      alt={productData?.title || productData?.product?.title}
                    />
                    {/* </Link> */}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <p
                        href={`/products/view/${productData?._id || productData?.product?._id}`}
                        className="text-lg font-medium text-gray-800 transition-colors">
                        {productData?.title || productData?.product?.title}
                      </p>
                    </div>

                    {/* Price Section */}
                    <div className="mt-2">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{productData?.discountedPrice}
                      </span>
                      {!!productData?.originalPrice && (
                        <>
                          <span className="text-gray-500 ml-2 line-through">
                            ₹{productData?.originalPrice}
                          </span>
                          <span className="text-green-600 ml-2 text-sm">
                            Save ₹
                            {productData?.originalPrice -
                              productData?.discountedPrice}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Variant Info */}
                    {productData?.product && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium ml-1">
                            {productData?.size}
                          </span>
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium ml-1">
                            {productData?.color}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mt-4 w-fit">
                      <button
                        onClick={() =>
                          handleQuantityChange(Math.max(1, productQuantity - 1))
                        }
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                        disabled={productQuantity <= 1}>
                        -
                      </button>
                      <span className="px-4 py-2 text-center min-w-[40px]">
                        {productQuantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(+productQuantity + 1)
                        }
                        disabled={productQuantity >= 50}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sale Badge */}
                {/* {!!product?.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )} */}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Details
                </h2>
                {/* <span className="text-sm text-gray-500">Step 1 of 2</span> */}
              </div>

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ) : addresses?.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-md font-medium text-gray-800">
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

          {/* Order Summary Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-4">
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

                {/* {appliedCoupon?.code && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Applied</span>
                    <span className="text-green-600 font-medium">
                      {appliedCoupon.code}
                    </span>
                  </div>
                )} */}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
              />
              {couponError && (
                <p className="mt-2 text-sm text-red-600">{couponError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={couponSubmitLoading || !couponCode}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white ${couponSubmitLoading || !couponCode ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 cursor-pointer"}`}>
              {couponSubmitLoading ? "Applying..." : "Apply Coupon"}
            </button>
          </form>
        </div>
      </div>

      {/* Coupon Success Modal */}
      <div
        ref={couponSuccessModalRef}
        className="hidden fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-md z-50 flex items-center justify-center p-4">
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
        className="hidden fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-md  z-50 flex items-center justify-center p-4">
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
