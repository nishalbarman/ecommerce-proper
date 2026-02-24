"use client";

import { notFound, useParams } from "next/navigation";

import ReviewSection from "@/components/ReviewSection/ReviewSection";
import { useActionState, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "@/styles/swiper-style.css";
import "@/styles/view-product.css";
import RateStar from "@/components/RatingStart";
import checkStock from "@/actions/product/checkStock";
import ReviewStats from "@/components/ReviewForm/ReviewStats";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CartApi } from "@/redux";
import axiosInstance from "@/services/axiosInstance";
import Loading from "@/app/cart/loading";
import axios from "axios";
import { setLoginModalState } from "@/redux/slices/loginModalSlice";
import { IoCartOutline } from "react-icons/io5";
import { CiShoppingCart } from "react-icons/ci";

export default function ViewProduct({ params }) {
  // const cookie = await cookies();
  const navigate = useRouter();

  const { productId } = useParams();

  console.log("Am I geting the productId", productId);

  const token = useSelector((state) => state.auth.jwtToken);

  const { useAddOneToCartMutation } = CartApi;

  const [isLoading, setIsLoading] = useState(true);
  const [hasUserBoughtThisProduct, setHasUserBoughtThisProduct] =
    useState(false);
  const [product, setProduct] = useState({});

  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [validCombinations, setValidCombinations] = useState([]);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [filteredVariant, setFilteredVariant] = useState(null);
  const [inStock, setInStock] = useState(true);
  const [combinationExists, setCombinationExists] = useState(true);
  const [error, setError] = useState(null);

  // Ref to the form element
  const formRef = useRef(null);

  const [quantity, setQuantity] = useState(1);
  const [rentDays, setRentDays] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const [productVariants, setProductVariants] = useState([]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const responseData = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Response Data of Product", responseData);

      const product = responseData.data.product;
      const hasUserBoughtThisProduct =
        responseData.data.hasUserBoughtThisProduct;
      const variants = product.productVariant || [];
      setProductVariants(variants);

      // Extract sizes and colors from variants
      const sizes = new Set();
      const colors = new Set();
      const combinations = new Set();

      variants.forEach((variant) => {
        sizes.add(variant.size);
        colors.add(variant.color);
        combinations.add(`${variant.size}-${variant.color}`);
      });

      const availableSizes = Array.from(sizes);
      const availableColors = Array.from(colors);
      const validCombinations = combinations;

      setAvailableColors(availableColors);
      setAvailableSizes(availableSizes);
      setValidCombinations(validCombinations);
      setProduct(product);
      setHasUserBoughtThisProduct(hasUserBoughtThisProduct);

      // Set default selected size and color
      let selectedSize = "";
      let selectedColor = "";
      if (variants.length > 0) {
        selectedSize = variants[0].size;
        selectedColor = variants[0].color;
      }
      setSelectedColor(selectedColor);
      setSelectedSize(selectedSize);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to load product details");
      notFound();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  // Client-side variant selection handler
  const handleVariantSelection = async (size, color) => {
    try {
      if (!product.isVariantAvailable) {
        return {
          matchedVariant: null,
          inStock: true,
          combinationExists: true,
        };
      }

      // Find the matched variant based on size and color
      const matchedVariant = productVariants.find(
        (variant) => variant.size === size && variant.color === color,
      );

      if (!matchedVariant) {
        return {
          matchedVariant: null,
          inStock: false,
          combinationExists: false,
        };
      }

      // Check stock availability for the matched variant
      const stockResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products/variant/instock/${productId}`,
        { variant: matchedVariant._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        matchedVariant,
        inStock: stockResponse.data.inStock,
        combinationExists: true,
      };
    } catch (error) {
      console.error("Error in variant selection:", error);
      setError("Failed to select variant. Please try again.");
      return {
        matchedVariant: null,
        inStock: false,
        combinationExists: false,
      };
    }
  };

  // Update variant selection effect
  useEffect(() => {
    const updateVariantSelection = async () => {
      if (product.isVariantAvailable && selectedSize && selectedColor) {
        const result = await handleVariantSelection(
          selectedSize,
          selectedColor,
        );
        setFilteredVariant(result.matchedVariant);
        setInStock(result.inStock);
        setCombinationExists(result.combinationExists);
      } else if (!product.isVariantAvailable) {
        // For individual products without variants
        const stockResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/products/variant/instock/${productId}`,
          { variant: null },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setInStock(stockResponse.data.inStock);
        setCombinationExists(true);
      }
    };

    updateVariantSelection();
  }, [selectedSize, selectedColor, product.isVariantAvailable, productId]);

  useEffect(() => {
    if (!product.isVariantAvailable) {
      (async () => {
        console.log(
          "Checking Product Stock",
          "Calling checkStock",
          product._id,
        );
        const res = await checkStock(product._id);
        setInStock(res.inStock);
      })();
    }
  }, [product]);

  const isCombinationValid = (size, color) => {
    return validCombinations.has(`${size}-${color}`);
  };

  const checkCartStatus = async (productId, variantId) => {
    console.log("Checking cart status for:", {
      productId,
      variantId,
    });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/cart/incart/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": `application/json`,
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            variant: !!variantId ? variantId : null,
          }),
        },
      );
      const data = await response.json();
      console.log("Cart status response:", data);
      return data.incart;
    } catch (error) {
      console.error("Error checking cart status:", error);
      return false;
    }
  };

  useEffect(() => {
    console.log("filterd variant:", product, filteredVariant);
    (async () => {
      const inCart = await checkCartStatus(product._id, filteredVariant?._id);
      setInCart(inCart);
    })();
  }, [filteredVariant, product]);

  // Handle form submission

  const [addToCart, { isLoading: isCartAddLoading }] =
    useAddOneToCartMutation();

  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    if (!token) {
      console.log(token);
      toast.success("You need to be logged in first.");
      dispatch(setLoginModalState({ modalVisible: true }));
      return;
    }

    try {
      setIsAddToCartLoading(true);

      const cartObject = {
        productId: product._id,
        quantity,
        productType: product.productType,
      };

      if (product.isVariantAvailable && filteredVariant) {
        cartObject.variant = filteredVariant._id;
      }

      if (product.type === "rent") {
        cartObject.rentDays = rentDays;
      }

      // const response = await addToCart(cartObject).unwrap();

      toast.promise(addToCart(cartObject), {
        loading: "Adding to cart...",
        success: (res) => {
          setInCart(true);
          toast.success("Added to cart");
        },
        error: (res) => {
          toast.error("Failed to add to cart");
          console.error("Error adding to cart:", res);
        },
      });

      // toast.dismiss("addtocart-loading");
      // toast.success("Added to cart", response?.message);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  const [isBying, setIsBying] = useState(false);

  const handleBuyNow = () => {
    if (!token) {
      console.log(token);
      toast.success("You need to be logged in first.");
      dispatch(setLoginModalState({ modalVisible: true }));
      return;
    }

    setIsBying(true);

    const queryParams = new URLSearchParams();
    queryParams.set("productId", product._id);
    queryParams.set("quantity", quantity.toString());
    queryParams.set("productType", product.type || "buy");

    if (filteredVariant?._id) {
      queryParams.set("productVariantId", filteredVariant._id);
    }
    // if (product.type === "rent") {
    //   queryParams.set("rentDays", rentDays.toString());
    // }

    navigate.push(`/buy-single?${queryParams.toString()}`);
  };

  if (isLoading) {
    return (
      <>
        <div className="container mx-auto mt-13 max-md:mt-2">
          <div className="w-full p-4 min-h-[100vh] bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
              {/* LEFT SIDE */}
              <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
                {/* Category */}
                <div className="h-4 w-32 bg-gray-200 rounded mb-4" />

                {/* Main Image */}
                <div className="w-full h-[400px] max-md:h-[320px] bg-gray-200 rounded-lg mb-4" />

                {/* Thumbnails */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
                  ))}
                </div>

                {/* Review stats */}
                <div className="mt-6 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="sm:pl-8 max-sm:pt-8 sm:border-l border-gray-200">
                {/* Stock */}
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />

                {/* Title */}
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />

                {/* Rating */}
                <div className="h-5 w-32 bg-gray-200 rounded mb-6" />

                {/* Pricing */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-3">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-8 w-40 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>

                {/* Variants */}
                <div className="hidden border-none p-4 rounded-md mb-6 space-y-4">
                  <div className="h-4 w-32 bg-gray-200 rounded" />

                  {/* Size */}
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="h-10 w-16 bg-gray-200 rounded" />
                    ))}
                  </div>

                  {/* Color */}
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="h-10 w-20 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                  <div className="h-10 w-32 bg-gray-200 rounded" />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mb-12">
                  <div className="h-12 w-40 bg-gray-200 rounded-lg" />
                  <div className="h-12 w-40 bg-gray-200 rounded-lg" />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Review Section Skeleton */}
          <div className="mb-10 space-y-4 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            {[1, 2].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>

                  <div className="flex-1">
                    {/* Name + Date */}
                    <div className="flex justify-between mb-3">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <div
                              key={j}
                              className="w-4 h-4 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      </div>

                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mb-4">
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                      <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
                    </div>

                    {/* Images */}
                    <div className="flex gap-3">
                      {[...Array(3)].map((_, k) => (
                        <div
                          key={k}
                          className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-13 max-md:mt-2">
        <div className="w-full p-4 text-black min-h-[100vh] bg-white rounded-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Product Images (Sticky on Desktop) */}
            <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold mb-3 text-gray-600 border-l-5 border-l-primary pl-1">
                  {product && product?.category?.categoryName}
                </p>
              </div>
              {/* Main Image Slider */}
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                navigation
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper }}
                spaceBetween={10}
                slidesPerView={1}
                className="my-swiper w-full h-[400px] bg-gray-50 max-md:h-[320px] aspect-square rounded-lg shadow-lg mb-4">
                {/* Main Image */}
                <SwiperSlide>
                  <img
                    src={`${filteredVariant?.previewImage || product.previewImage}`}
                    alt={product ? product.title : undefined}
                    className="w-full h-full object-contain select-none"
                  />
                </SwiperSlide>

                {/* Slider Images */}
                {(filteredVariant?.slideImages || product.slideImages)?.map(
                  (image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={`${image}`}
                        alt={`Product Image ${index + 1}`}
                        className="w-full h-full object-contain select-none"
                      />
                    </SwiperSlide>
                  ),
                )}
              </Swiper>

              {/* Thumbnail Slider */}
              <Swiper
                modules={[Thumbs]}
                onSwiper={(swiper) => {
                  setThumbsSwiper(swiper);
                }}
                spaceBetween={10}
                slidesPerView={4}
                className="w-full h-24 max-sm:h-14 ">
                {/* Main Image Thumbnail */}
                <SwiperSlide>
                  <img
                    src={`${filteredVariant?.previewImage || product.previewImage}`}
                    alt={product ? product?.title : undefined}
                    className="w-full h-full !border shadow-lg border-primary object-contain rounded-lg cursor-pointer select-none"
                  />
                </SwiperSlide>

                {/* Slider Images Thumbnails */}
                {(filteredVariant?.slideImages || product.slideImages)?.map(
                  (image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={`${image}`}
                        alt={`Product Image ${index + 1}`}
                        className="w-full h-full !border shadow-lg border-primary  object-contain rounded-lg cursor-pointer select-none"
                      />
                    </SwiperSlide>
                  ),
                )}
              </Swiper>

              <ReviewStats
                averageRating={product.stars}
                totalReviews={product.totalFeedbacks}
              />
            </div>

            {/* Right Side: Product Details */}
            <div className="sm:pl-8 max-sm:pt-8 sm:border-l border-gray-200 sm:border-t-0 border-t sm:mt-0">
              <p className="mb-2 max-md:text-sm">
                {inStock ? (
                  <span className="text-green-800 font-bold">In stock</span>
                ) : (
                  <span className="text-red-800 font-bold">Out of Stock</span>
                )}
              </p>

              <h1 className="text-4xl max-md:text-lg font-bold text-gray-800">
                {product && product.title}
              </h1>

              <div className="mt-3 mb-6">
                <RateStar stars={product.stars || 0} />
              </div>

              <div className="flex items-center justify-start bg-gray-50 rounded-lg">
                {/* Pricing */}
                <div className="mb-6 bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-sm font-semibold mb-2">Pricing</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-green-900">
                      ₹
                      {filteredVariant
                        ? filteredVariant.discountedPrice
                        : product.discountedPrice}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ₹
                        {filteredVariant
                          ? filteredVariant.originalPrice
                          : product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 text-xs">
                    + Shipping Charges
                    {/* : ₹
                  {filteredVariant
                    ? filteredVariant.shippingPrice
                    : product.shippingPrice} */}
                  </p>
                </div>
                <div className="mb-6 bg-gray-50 p-6 rounded-lg max-sm:hidden">
                  {/* <h2 className="text-sm font-semibold mb-4">Quantity</h2> */}
                  {/* <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center border rounded-full cursor-pointer">
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(50, prev + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center border rounded-full cursor-pointer">
                    +
                  </button>
                </div> */}

                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
                    <button
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      disabled={quantity <= 1}>
                      -
                    </button>
                    <span className="px-4 py-2 text-center min-w-[40px]">
                      {quantity} Qty
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((prev) => Math.min(50, prev + 1))
                      }
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      disabled={quantity >= 50}>
                      +
                    </button>
                  </div>

                  {product.type === "rent" && (
                    <>
                      <h2 className="text-sm font-semibold mb-4 mt-6">
                        Rental Duration
                      </h2>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            setRentDays((prev) => Math.max(1, prev - 1))
                          }
                          className="w-10 h-10 flex items-center justify-center border rounded-full">
                          -
                        </button>
                        <span className="text-lg font-medium">
                          {rentDays} days
                        </span>
                        <button
                          onClick={() =>
                            setRentDays((prev) => Math.min(30, prev + 1))
                          }
                          className="w-10 h-10 flex items-center justify-center border rounded-full">
                          +
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-3 rounded-sm">
                {/* Variants (Only if VariantAvailable is true) */}
                {product &&
                  product.isVariantAvailable &&
                  productVariants?.length > 0 && (
                    <div className="border shadow p-4 rounded-md border-primary">
                      <input type="hidden" name="productId" value={productId} />
                      <div className="mb-6">
                        <h2 className="text-sm font-semibold mb-2">
                          Select Option
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {/* Size Selection */}
                          <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">Size</h3>
                            <div className="flex flex-wrap gap-2">
                              {availableSizes.map((size, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setSelectedSize(size)}
                                  disabled={
                                    !isCombinationValid(size, selectedColor)
                                  }
                                  className={`px-4 py-2 border rounded-lg cursor-pointer ${
                                    selectedSize === size
                                      ? "text-white bg-[rgb(219,69,69)]"
                                      : "bg-white text-black hover:bg-gray-100"
                                  } ${
                                    !isCombinationValid(size, selectedColor)
                                      ? "opacity-50 cursor-not-allowed border-none diagonal-line"
                                      : ""
                                  }`}>
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color Selection */}
                          <div className="w-full mt-4">
                            <h3 className="text-lg font-semibold mb-2">
                              Color
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {availableColors.map((color, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setSelectedColor(color)}
                                  className={`px-4 py-2 border rounded-lg cursor-pointer ${
                                    selectedColor === color
                                      ? "text-white bg-[rgb(219,69,69)]"
                                      : "bg-white text-black hover:bg-gray-100"
                                  }`}>
                                  {color}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Warning if combination does not exist */}
                        {!combinationExists && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">
                              This combination of size and color does not exist.
                            </p>
                          </div>
                        )}

                        {/* Display error message */}
                        {error && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Stock Availability */}
              {!inStock && (
                <div className="mb-6 bg-red-50 p-6 rounded-lg">
                  <h2 className="text-sm font-semibold mb-2">Availability</h2>
                  <p className="text-red-600 font-bold">
                    {inStock ? "In stock" : "Out of stock"}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="max-sm:block hidden mb-6 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-sm font-semibold mb-4">Quantity</h2>
                {/* <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center border rounded-full cursor-pointer">
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(50, prev + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center border rounded-full cursor-pointer">
                    +
                  </button>
                </div> */}

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    disabled={quantity <= 1}>
                    -
                  </button>
                  <span className="px-4 py-2 text-center min-w-[40px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(50, prev + 1))
                    }
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    disabled={quantity >= 50}>
                    +
                  </button>
                </div>

                {product.type === "rent" && (
                  <>
                    <h2 className="text-sm font-semibold mb-4 mt-6">
                      Rental Duration
                    </h2>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          setRentDays((prev) => Math.max(1, prev - 1))
                        }
                        className="w-10 h-10 flex items-center justify-center border rounded-full">
                        -
                      </button>
                      <span className="text-lg font-medium">
                        {rentDays} days
                      </span>
                      <button
                        onClick={() =>
                          setRentDays((prev) => Math.min(30, prev + 1))
                        }
                        className="w-10 h-10 flex items-center justify-center border rounded-full">
                        +
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-12">
                <form action={handleAddToCart}>
                  <input type="hidden" name="productId" value={product._id} />
                  <input
                    type="hidden"
                    name="productType"
                    value={product.type}
                  />
                  <input type="hidden" name="quantity" value={quantity} />
                  {filteredVariant?._id && (
                    <input
                      type="hidden"
                      name="variantId"
                      value={filteredVariant._id}
                    />
                  )}

                  {inStock ? (
                    !inCart ? (
                      <button
                        type="submit"
                        disabled={!inStock || isCartAddLoading}
                        className={`flex items-center justify-center gap-1 py-3 px-6 rounded-lg font-medium cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed bg-black text-white hover:bg-gray-800
                      }`}>
                        {/* <CiShoppingCart size={24} /> */}
                        {isAddToCartLoading || isCartAddLoading ? (
                          <div className="flex items-center justify-center">
                            <span>
                              Adding{" "}
                              <div className="inline-block animate-spin">
                                😎
                              </div>
                            </span>
                          </div>
                        ) : (
                          <span>
                            <span>🛒 Add to Cart</span>
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate.push("/cart")}
                        className="flex-1 py-3 px-6 rounded-lg font-medium bg-black text-white hover:bg-gray-800 cursor-pointer">
                        ✔️ Go to Cart
                      </button>
                    )
                  ) : (
                    <></>
                  )}
                </form>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock || isBying}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark`}>
                  {!inStock ? (
                    <span>Out of Stock</span>
                  ) : isBying ? (
                    <div className="flex items-center justify-center">
                      <span>
                        Please wait{" "}
                        <div className="inline-block animate-spin">✌️</div>
                      </span>
                    </div>
                  ) : (
                    <span>
                      <span>Buy Now 🤞</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div
                  className="prose prose-stone mt-10"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <ReviewSection
        product={product}
        hasUserBoughtThisProduct={hasUserBoughtThisProduct}
      />
    </>
  );
}
