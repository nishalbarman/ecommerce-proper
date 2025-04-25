"use client";

import { notFound, useParams } from "next/navigation";

import ReviewSection from "@/components/ReviewSection/ReviewSection";
import { useActionState, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
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

export default function ViewProduct({ params }) {
  // const cookie = await cookies();
  const navigate = useRouter();

  const { productId } = useParams();

  const token = useSelector((state) => state.auth.jwtToken);

  const { useAddOneToCartMutation } = CartApi;

  const [isLoading, setIsLoading] = useState(true);
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
        }
      );

      console.log("Response Data of Product", responseData);

      const product = responseData.data.product;
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
        (variant) => variant.size === size && variant.color === color
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
        }
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
          selectedColor
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
          }
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
          product._id
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
        }
      );
      const data = await response.json();
      console.log("Cart status response:", data);
      return data.incart;
    } catch (error) {
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

  const [addToCart] = useAddOneToCartMutation();

  const handleAddToCart = async () => {
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

      const response = await addToCart(cartObject).unwrap();
      setInCart(true);
      toast.success(response.message);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    const queryParams = new URLSearchParams();
    queryParams.set("productId", product._id);
    queryParams.set("quantity", quantity.toString());
    queryParams.set("productType", product.type);

    if (filteredVariant?._id) {
      queryParams.set("variantId", filteredVariant._id);
    }
    if (product.type === "rent") {
      queryParams.set("rentDays", rentDays.toString());
    }

    navigate(`/checkout?${queryParams.toString()}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="container mx-auto mt-16">
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
                  )
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
                  )
                )}
              </Swiper>

              <ReviewStats
                averageRating={product.stars}
                totalReviews={product.totalFeedbacks}
              />
            </div>

            {/* Right Side: Product Details */}
            <div className="sm:pl-8 max-sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t sm:mt-0">
              <p className="mb-2 max-md:text-sm">
                {inStock ? (
                  <span className="text-green-800 font-bold">In stock</span>
                ) : (
                  <span className="text-red-800 font-bold">Out of Stock</span>
                )}
              </p>

              <h1 className="text-4xl max-md:text-lg font-bold mb-2 text-gray-800">
                {product && product.title}
              </h1>

              <div className="my-6">
                <RateStar stars={product.stars || 0} />
              </div>

              {/* Pricing */}
              <div className="mb-6 bg-green-50 p-6 rounded-lg">
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
                <p className="text-gray-600 mt-2">
                  Shipping: ₹
                  {filteredVariant
                    ? filteredVariant.shippingPrice
                    : product.shippingPrice}
                </p>
              </div>

              <div className="mb-3 rounded-sm">
                {/* Variants (Only if VariantAvailable is true) */}
                {product &&
                  product.isVariantAvailable &&
                  productVariants?.length > 0 && (
                    <div className="border shadow p-4">
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
                                  className={`px-4 py-2 border rounded-lg ${
                                    selectedSize === size
                                      ? "bg-primary bg-gray-200 text-white"
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
                                  className={`px-4 py-2 border rounded-lg ${
                                    selectedColor === color
                                      ? "bg-primary bg-gray-200 text-white"
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
              <div className="mb-6 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-sm font-semibold mb-4">Quantity</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center border rounded-full">
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(50, prev + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center border rounded-full">
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

                  {!inCart ? (
                    <button
                      type="submit"
                      disabled={!inStock || isAddToCartLoading}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium ${
                        !inStock || isAddToCartLoading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}>
                      {isAddToCartLoading ? "Adding..." : "Add to Cart"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate.push("/cart")}
                      className="flex-1 py-3 px-6 rounded-lg font-medium bg-black text-white hover:bg-gray-800">
                      Go to Cart
                    </button>
                  )}
                </form>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium ${
                    !inStock
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-primary-dark"
                  }`}>
                  Buy Now
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div
                  className="prose prose-stone my-10"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <ReviewSection product={product} />
    </>
  );
}
