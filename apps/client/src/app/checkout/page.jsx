// app/checkout/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import { CartApi, AddressApi, WishlistApi, CartSlice } from "@/redux";

import AddressForm from "@/components/AddressForm/AddressForm";
import useRazorpay from "react-razorpay";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function CheckoutPage() {
  const router = useRouter();

  const { updateCart } = CartSlice;
  const { useGetAddressQuery } = AddressApi;
  const { useGetCartQuery, useRemoveAllCartMutation } = CartApi;
  const { useGetWishlistQuery } = WishlistApi;

  const { data: { cart: userCartItems } = {} } = useGetCartQuery({
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

  const [Razorpay] = useRazorpay();

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
          `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/payu/cart-hash${!!appliedCoupon && appliedCoupon._id ? "?coupon=" + appliedCoupon._id : ""}`
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
        { withCredentials: true }
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
        shippingPrice
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
        subtotalPrice - (couponDiscountPrice || 0) + shippingPrice
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section - Delivery Details */}
        <div className="lg:w-3/5">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Delivery Details</h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ) : addresses?.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">Select Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address._id)}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedAddress === address._id
                          ? "border-primary shadow-md"
                          : "border-gray-200"
                      }`}>
                      <div className="flex justify-between">
                        <h4 className="font-medium">{address.fullName}</h4>
                        {selectedAddress === address._id && (
                          <span className="text-primary">✓ Selected</span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">
                        {address.streetName}, {address.city}, {address.state} -{" "}
                        {address.postalCode}
                      </p>
                      <p className="text-gray-600">Phone: {address.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No saved addresses found</p>
              </div>
            )}

            <button
              onClick={() => setIsAddingAddress(true)}
              className="mt-6 w-full py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary/10">
              + Add New Address
            </button>

            {isAddingAddress && (
              <AddressForm
                onSuccess={() => {
                  setIsAddingAddress(false);
                  // Refetch addresses
                  refetch();
                }}
                onCancel={() => setIsAddingAddress(false)}
              />
            )}
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="lg:w-2/5">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-green-600">₹{totalShippingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Coupon Discount</span>
                <span className="text-green-600">-₹{totalDiscountPrice}</span>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{subtotalPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinueToPayment}
              disabled={!selectedAddress}
              className={`flex justify-center items-center mt-6 w-full py-3 rounded-lg font-medium ${
                selectedAddress
                  ? "bg-[#DA4544] text-white hover:bg-primary-dark"
                  : "bg-[#DA4544] text-white cursor-not-allowed"
              }`}>
              {!isPaymentLoading ? (
                <span className="text-white">Continue to Payment</span>
              ) : (
                <>
                  <div>
                    <span className="text-white">Please Wait ...</span>
                    <div className="spinner max-lg:ml-1"></div>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
