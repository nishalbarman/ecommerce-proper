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
import Link from "next/link";
import {
  clearCouponData,
  updateAppliedCoupon,
} from "@/redux/slices/appliedCouponSlice";

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

  const selectedAddressDetails = useSelector(
    (state) => state.userAddress?.selectedAddress,
  );
  // razor pay checkouts
  const handleRazorPayContinue = useCallback(async () => {
    try {
      setIsPaymentLoading(true);

      setLoadingText("Creating order...");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pay/razorpay/cart/buy${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`,
        { address: selectedAddressDetails },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ); // generate razor pay order id and also apply coupon if applicable

      setLoadingText("Opening payment gateway...");

      const config = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: response.data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: process.env.NEXT_PUBLIC_BUSSINESS_NAME, //your business name
        description: response.data.productinfo,
        fullscreen: true,
        image: "/assets/logo/logo-horizontal.png",
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
          // router.push("/myorders");
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
  }, [Razorpay, appliedCoupon, gatewayOption, selectedAddressDetails]);

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
    if (selectedAddressDetails) handlePayment();
  }, [selectedAddressDetails]);

  // const couponModalRef = useRef();
  // const couponSuccessModalRef = useRef();
  const paymentLoadingModalRef = useRef();
  const paymentStatusModalRef = useRef();

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

  const [loadingText, setLoadingText] = useState("Initializing payment...");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="min-h-[calc(100vh-180px)] max-sm:min-h-[calc(70vh)] mx-auto flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          {/* Loader */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-6"></div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Processing Payment
          </h2>

          <p className="text-gray-500">{loadingText}</p>
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
