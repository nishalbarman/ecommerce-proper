// components/ProductDetails.js
"use client";

import { useActionState, useEffect, useState, useRef } from "react";
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

export default function ProductDetails({
  product,
  productVariants,
  availableSizes,
  availableColors,
  validCombinations,
  selectedSize: initialSelectedSize,
  selectedColor: initialSelectedColor,
  productId,
  handleVariantSelection,
}) {
  const [selectedSize, setSelectedSize] = useState(initialSelectedSize);
  const [selectedColor, setSelectedColor] = useState(initialSelectedColor);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [filteredVariant, setFilteredVariant] = useState(null);
  const [inStock, setInStock] = useState(true);
  const [combinationExists, setCombinationExists] = useState(true);
  const [error, setError] = useState(null);

  // Ref to the form element
  const formRef = useRef(null);

  // Use server action for variant selection
  const [state, formAction] = useActionState(
    async (prevState, formData) => {
      try {
        const result = await handleVariantSelection(prevState, formData);
        setError(null); // Clear any previous errors
        return result;
      } catch (error) {
        setError(error.message); // Set the error message
        return prevState; // Return the previous state
      }
    },
    {
      matchedVariant: null,
      inStock: false,
      combinationExists: true,
    }
  );

  // Update state when server action completes
  useEffect(() => {
    console.log("What is state=>>", state);

    if (state.matchedVariant) {
      setFilteredVariant(state.matchedVariant);
      setInStock(state.inStock);
      setCombinationExists(state.combinationExists);
    } else if (!product.isVariantAvailable) {
      // For individual products without variants
      setInStock(state.inStock);
      setCombinationExists(true); // Always true for individual products
    }
  }, [state, product.isVariantAvailable]);

  // Trigger form submission when both size and color are selected (only for products with variants)
  useEffect(() => {
    console.log(
      "Submitting the form with:",
      product.isVariantAvailable &&
        selectedSize &&
        selectedColor &&
        formRef.current
    );

    if (
      product.isVariantAvailable &&
      selectedSize &&
      selectedColor &&
      formRef.current
    ) {
      console.log("Submitting form with:", {
        selectedSize,
        selectedColor,
        productId,
      });
      formRef.current.requestSubmit(); // Trigger form submission
    }
  }, [selectedSize, selectedColor, product.isVariantAvailable]);

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

  return (
    <div className="container mx-auto mt-16">
      <div className="w-full p-4 text-black min-h-[100vh] bg-white rounded-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Product Images (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold mb-3 text-gray-600 border-l-5 border-l-primary pl-1">
                {product && product.category.categoryName}
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

            <div className="mt-10">
              {/* Variants (Only if VariantAvailable is true) */}
              {product &&
                product.isVariantAvailable &&
                productVariants?.length > 0 && (
                  <form ref={formRef} action={formAction}>
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="size" value={selectedSize} />
                    <input type="hidden" name="color" value={selectedColor} />
                    <button type="submit" style={{ display: "none" }} />
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">
                        Select Variant
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
                                    ? "bg-primary bg-gray-200 text-black border-black "
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
                          <h3 className="text-lg font-semibold mb-2">Color</h3>
                          <div className="flex flex-wrap gap-2">
                            {availableColors.map((color, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 border rounded-lg ${
                                  selectedColor === color
                                    ? "bg-primary bg-gray-200 text-black border-black "
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
                  </form>
                )}
            </div>
          </div>

          {/* Right Side: Product Details */}
          <div className="sm:pl-8 max-sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t sm:mt-0">
            <p className="mb-2">
              {inStock ? (
                <span className="text-green-800 font-bold">In stock</span>
              ) : (
                <span className="text-red-800 font-bold">Out of Stock</span>
              )}
            </p>

            <h1 className="text-4xl font-bold mb-2 text-gray-800">
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

            {/* Stock Availability */}
            <div className="mb-6 bg-green-50 p-6 rounded-lg">
              <h2 className="text-sm font-semibold mb-2">Availability</h2>
              {combinationExists ? (
                <p className="text-gray-600">
                  {inStock ? "In stock" : "Out of stock"}
                </p>
              ) : (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">
                    This combination of size and color does not exist.
                  </p>
                </div>
              )}
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
  );
}
