import {
  BaseSyntheticEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useParams, useSearchParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

import "../../styles/swiper-style.css";

import "../../styles/view-product.css";

import { Category, Product, ProductVariant } from "../../types"; // Assuming you have types defined for Product and ProductVariant
import cAxios from "../../axios/cutom-axios";
import { useAppSelector } from "@/redux";

const ViewProduct = () => {
  const { jwtToken } = useAppSelector((state) => state.auth);

  // const { productId } = useParams<{ productId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [productId, setProductId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  const [thumbsSwiper, setThumbsSwiper] = useState(null); // For thumbnail slider

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [filteredVariant, setFilteredVariant] = useState<ProductVariant | null>(
    null
  );
  const [inStock, setInStock] = useState<boolean>(false); // Stock availability
  const [combinationExists, setCombinationExists] = useState<boolean>(true); // Whether the selected combination exists

  // Extract available sizes and colors
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Track valid combinations of size and color
  const [validCombinations, setValidCombinations] = useState<Set<string>>(
    new Set()
  );

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      if (!productId) return;
      setIsLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/products/admin-view/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setProduct(response.data.product);
      setProductVariants(response.data.product.productVariant || []);

      // Extract sizes and colors from variants
      const sizes = new Set<string>();
      const colors = new Set<string>();
      const combinations = new Set<string>();

      response.data.product.productVariant?.forEach(
        (variant: ProductVariant) => {
          sizes.add(variant.size);
          colors.add(variant.color);
          combinations.add(`${variant.size}-${variant.color}`);
        }
      );

      setAvailableSizes(Array.from(sizes));
      setAvailableColors(Array.from(colors));
      setValidCombinations(combinations);

      // Set default selected size and color
      if (response.data.product.productVariant?.length > 0) {
        setSelectedSize(response.data.product.productVariant[0].size);
        setSelectedColor(response.data.product.productVariant[0].color);
      }
    } catch (error: any) {
      toast.error(error.response?.message || error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check stock availability for the selected variant or product
  const checkStockAvailability = async () => {
    try {
      if (!productId) return;

      let variantId = null;
      if (filteredVariant) {
        variantId = filteredVariant._id;
      }

      const response = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/products/variant/instock/${productId}`,
        {
          variant: variantId,
          productType: product?.productType,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      setInStock(response.data.inStock);
    } catch (error: any) {
      toast.error(error.response?.message || error.message);
      console.error(error);
    }
  };

  // Filter variant based on selected size and color
  useEffect(() => {
    if (productVariants.length > 0 && selectedSize && selectedColor) {
      const matchedVariant = productVariants.find(
        (variant) =>
          variant.size === selectedSize && variant.color === selectedColor
      );
      setFilteredVariant(matchedVariant || null);
      setCombinationExists(!!matchedVariant); // Set whether the combination exists
    }
  }, [selectedSize, selectedColor, productVariants]);

  // Check stock availability when filteredVariant changes
  useEffect(() => {
    if (filteredVariant || product) {
      checkStockAvailability();
    }
  }, [filteredVariant, product]);

  // Fetch product details on component mount
  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Check if a combination of size and color is valid
  const isCombinationValid = (size: string, color: string) => {
    return validCombinations.has(`${size}-${color}`);
  };

  useEffect(() => {
    if (productInputReference.current && (productInputReference.current as any))
      (productInputReference.current as any).value =
        searchParams.get("productId");
    setProductId(searchParams.get("productId"));
  }, [searchParams]);

  const productInputReference = useRef(null);

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Product Details
        </h1>
      </div>

      <div>
        {
          <div className="bg-white rounded-lg shadow-md p-6 mb-2">
            <form
              onSubmit={(e: BaseSyntheticEvent) => {
                e.preventDefault();
                console.log("I am working here");
                setSearchParams({ productId: e.target.productId.value.trim() });
                // setProductId(e.target.productId.value.trim());
              }}>
              <label htmlFor="productId" className="block font-bold mb-2">
                Product ID
              </label>
              <div className="flex justify-center items-center mb-4">
                <input
                  ref={productInputReference}
                  id="productId"
                  type="text"
                  placeholder={productId ? productId : "Product Id"}
                  className="border border-gray-300 rounded-l-md px-4 py-2 w-full"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md">
                  Search
                </button>
              </div>
            </form>
          </div>
        }
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : product ? (
        <>
          <div className="w-full p-4 text-black min-h-[100vh] bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Product Images (Sticky on Desktop) */}
              <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold mb-3 text-gray-600 border-l-5 border-l-primary pl-1">
                    {product && (product.category as Category).categoryName}
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
                  className="my-swiper w-full h-[320px] bg-gray-50 min-md:h-[500px] aspect-square rounded-lg shadow-lg mb-4">
                  {/* Main Image */}
                  <SwiperSlide>
                    <img
                      src={`${filteredVariant?.previewImage || product.previewImage}`}
                      alt={product ? (product.title as string) : undefined}
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
                  onSwiper={(swiper: any) => {
                    setThumbsSwiper(swiper);
                  }}
                  spaceBetween={10}
                  slidesPerView={4}
                  className="w-full h-24 max-sm:h-14">
                  {/* Main Image Thumbnail */}
                  <SwiperSlide>
                    <img
                      src={`${filteredVariant?.previewImage || product.previewImage}`}
                      alt={product ? product?.title : undefined}
                      className="w-full border border-gray-300 shadow h-full object-cover rounded-lg cursor-pointer select-none"
                    />
                  </SwiperSlide>

                  {/* Slider Images Thumbnails */}
                  {(filteredVariant?.slideImages || product.slideImages)?.map(
                    (image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={`${image}`}
                          alt={`Product Image ${index + 1}`}
                          className="w-full border border-gray-300 shadow h-full object-cover rounded-lg cursor-pointer select-none"
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
                            <h3 className="text-lg font-semibold mb-2">
                              Color
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {availableColors.map((color, index) => (
                                <button
                                  key={index}
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
                      </div>
                    )}
                </div>
              </div>

              {/* Right Side: Product Details */}
              <div className="sm:pl-8 max-sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t sm:mt-0">
                <h1 className="text-4xl font-bold mb-6 text-gray-800">
                  {product && product.title}
                </h1>

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

                  {/* Warning if combination does not exist */}
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
        </>
      ) : (
        <div className="text-center my-4">
          No product found with the provided ID.
        </div>
      )}
    </div>
  );
};

export default ViewProduct;
