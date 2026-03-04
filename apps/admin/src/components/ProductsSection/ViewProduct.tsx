import {
  BaseSyntheticEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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
import axios from "axios";
import ReviewStats from "./ReviewStats";

const ViewProduct = () => {
  const { jwtToken } = useAppSelector((state) => state.auth);

  // const { productSlug } = useParams<{ productId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleProductSearch = (text: string) => {
    if (!text) {
      return toast.error("Enter slug to find for product..");
    }

    setSearchParams({ productSlug: text });
  };

  const [productSlug, setProductSlug] = useState<string | null>(
    searchParams.get("productSlug"),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  console.log("What is product: ", product);

  const [thumbsSwiper, setThumbsSwiper] = useState(null); // For thumbnail slider

  // Variant selection state
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [validCombinations, setValidCombinations] = useState<Set<string>>(
    new Set(),
  );
  const [validCombinationsMap, setValidCombinationsMap] = useState<
    Map<string, any>
  >(new Map());

  console.log("What are validCombinationsMap", validCombinationsMap);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const [filteredVariant, setFilteredVariant] = useState(null);
  const [inStock, setInStock] = useState(true);
  const [combinationExists, setCombinationExists] = useState(true);
  const [error, setError] = useState(null);

  console.log("filteredVariant", filteredVariant);

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      if (!productSlug) return;
      setIsLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/products/admin-view/${productSlug}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
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
        },
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
      if (!productSlug) return;

      let variantId = null;
      if (filteredVariant) {
        variantId = filteredVariant._id;
      }

      const response = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/products/instock/${productSlug}`,
        {
          variant: variantId,
          productType: product?.productType,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      setInStock(response.data.inStock);
    } catch (error: any) {
      toast.error(error.response?.message || error.message);
      console.error(error);
    }
  };

  // // Filter variant based on selected size and color
  // useEffect(() => {
  //   if (productVariants.length > 0 && selectedSize && selectedColor) {
  //     const matchedVariant = productVariants.find(
  //       (variant) =>
  //         variant.size === selectedSize && variant.color === selectedColor,
  //     );
  //     setFilteredVariant(matchedVariant || null);
  //     setCombinationExists(!!matchedVariant); // Set whether the combination exists
  //   }
  // }, [selectedSize, selectedColor, productVariants]);

  // Check stock availability when filteredVariant changes
  useEffect(() => {
    if (filteredVariant || product) {
      checkStockAvailability();
    }
  }, [filteredVariant, product]);

  // Fetch product details on component mount
  useEffect(() => {
    fetchProductDetails();
  }, [productSlug]);

  const generateProductVariant = useCallback(async () => {
    try {
      const variants = (product?.productVariant as ProductVariant[]) || [];
      console.log("Available variants: ", product?.productVariant);
      if (!variants.length) {
        return;
      }

      setProductVariants(variants);

      // Extract sizes and colors from variants
      const sizes = new Set();
      const colors = new Set();
      const combinations = new Set<string>();
      const combinationsMap = new Map<string, any>();

      variants.forEach((variant) => {
        console.log("What is variant from generateProductVariant: ", variant);
        sizes.add(variant.size);
        colors.add(variant.color);
        combinations.add(`${variant.size}-${variant.color}`);
        combinationsMap.set(`${variant.size}-${variant.color}`, variant);
      });

      const availableSizes = Array.from(sizes);
      const availableColors = Array.from(colors);
      const validCombinations = combinations;

      setAvailableColors(availableColors);
      setAvailableSizes(availableSizes);
      setValidCombinations(validCombinations);
      setValidCombinationsMap(combinationsMap);

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
      console.error("Error variant handling:", error);
      toast.error("Product variant handling failed");
      // notFound();
    }
  }, [product]);

  useEffect(() => {
    (() => {
      if (!isLoading && product) {
        generateProductVariant();
      }
    })();
  }, [product, isLoading]);

  // Client-side variant selection handler
  const handleVariantSelection = useCallback(
    async (size: string, color: string) => {
      try {
        if (!product?.isVariantAvailable) {
          return {
            matchedVariant: null,
            inStock: true,
            combinationExists: true,
          };
        }

        // Find the matched variant based on size and color
        // const matchedVariant = productVariants.find(
        //   (variant) => variant.size === size && variant.color === color,
        // );
        console.log("Trying to find variant for Size:", `${size}-${color}`);

        const matchedVariant = validCombinationsMap.get(`${size}-${color}`);

        console.log("Trying to find variant for Size:", matchedVariant);

        if (!matchedVariant) {
          return {
            matchedVariant: null,
            inStock: false,
            combinationExists: false,
          };
        }

        // Check stock availability for the matched variant
        const stockResponse = await axios.post(
          `${process.env.VITE_APP_API_URL}/products/instock/${product.slug}`,
          { variant: matchedVariant._id },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );

        console.log("Trying to find variant for Size:", stockResponse.data);

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
    },
    [validCombinationsMap, product, jwtToken],
  );

  // Update variant selection effect
  useEffect(() => {
    const updateVariantSelection = async () => {
      if (!product) return;
      console.log("what is product", product);
      if (product?.isVariantAvailable && selectedSize && selectedColor) {
        const result = await handleVariantSelection(
          selectedSize,
          selectedColor,
        );

        console.log("Trying to find variant for Size:", result);

        setFilteredVariant(result.matchedVariant);
        setInStock(result.inStock);
        setCombinationExists(result.combinationExists);
      } else if (!product?.isVariantAvailable) {
        // For individual products without variants
        const stockResponse = await axios.post(
          `${process.env.VITE_APP_API_URL}/products/instock/${product?.slug}`,
          { variant: null },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );
        setInStock(stockResponse.data.inStock);
        setCombinationExists(true);
      }
    };

    updateVariantSelection();
  }, [selectedSize, selectedColor, product, jwtToken]);

  useEffect(() => {
    if (productInputReference.current && (productInputReference.current as any))
      (productInputReference.current as any).value =
        searchParams.get("productSlug");
    setProductSlug(searchParams.get("productSlug"));
  }, [searchParams]);

  const productInputReference = useRef(null);

  console.log("Preview Image", filteredVariant);

  const images = useMemo(() => {
    if (!product) return [];
    if (product.isVariantAvailable && !filteredVariant) return [];
    const images = new Set();
    if (product?.isVariantAvailable) {
      images.add(filteredVariant?.previewImage);
      filteredVariant.slideImages.forEach(
        (each: { imageUrl: string; bgColor: string }) => images.add(each),
      );
    } else {
      images.add(product?.previewImage);
      product.slideImages.forEach(
        (each: { imageUrl: string; bgColor: string }) => images.add(each),
      );
    }
    return Array.from(images);
  }, [filteredVariant, product]);

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
                handleProductSearch(e.target.productId.value.trim());
                // setProductId(e.target.productId.value.trim());
              }}>
              <label htmlFor="productId" className="block font-bold mb-2">
                Product Slug
              </label>
              <div className="flex justify-center items-center mb-4">
                <input
                  ref={productInputReference}
                  id="productSlug"
                  type="text"
                  placeholder={
                    productSlug ? productSlug : "your-product-slug-here"
                  }
                  defaultValue={productSlug}
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
        <div className="flex justify-center my-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
        </div>
      ) : product ? (
        <>
          <div className="w-full p-4 text-black min-h-[100vh] bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT SIDE — EXACT SAME AS CLIENT */}
              <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold mb-3 text-gray-600 border-l-5 border-l-primary pl-1">
                    {product && (product.category as Category).categoryName}
                  </p>
                </div>

                {/* MAIN SWIPER */}
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation
                  pagination={{ clickable: true }}
                  thumbs={{ swiper: thumbsSwiper }}
                  spaceBetween={10}
                  slidesPerView={1}
                  className="my-swiper w-full h-[400px] bg-gray-50 max-md:h-[320px] aspect-square rounded-lg shadow-lg mb-4">
                  {images.map((image: any, index) => (
                    <SwiperSlide key={index}>
                      <img
                        style={{ backgroundColor: image.bgColor }}
                        src={image.imageUrl}
                        className="w-full h-full object-contain select-none"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* THUMBNAILS */}
                <Swiper
                  modules={[Thumbs]}
                  onSwiper={(swiper) => setThumbsSwiper(swiper)}
                  spaceBetween={10}
                  slidesPerView={4}
                  className="w-full h-24 max-sm:h-14">
                  {images.map((image: any, index) => (
                    <SwiperSlide key={index}>
                      <img
                        style={{ backgroundColor: image.bgColor }}
                        src={image.imageUrl}
                        className="w-full border border-gray-300 shadow h-full object-cover rounded-lg cursor-pointer select-none"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <ReviewStats
                  averageRating={parseInt(product?.stars?.toString())}
                  totalReviews={parseInt(product?.totalFeedbacks?.toString())}
                />
              </div>

              {/* RIGHT SIDE — EXACT SAME STRUCTURE */}
              <div className="md:pl-8 max-sm:pt-8 md:border-l border-gray-200 sm:border-t-0 border-t sm:mt-0">
                {/* STOCK */}
                <p className="mb-2 max-md:text-sm">
                  {inStock ? (
                    <span className="text-green-800 font-bold">In stock</span>
                  ) : (
                    <span className="text-red-800 font-bold">Out of Stock</span>
                  )}
                </p>

                {/* TITLE */}
                <h1 className="text-4xl max-md:text-lg font-bold text-gray-800">
                  {product?.title}
                </h1>

                {/* PRICING */}
                <div className="flex items-center justify-start bg-gray-50 rounded-lg mb-6 max-sm:mb-0 mt-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-sm font-semibold mb-2">Pricing</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-green-900">
                        ₹
                        {filteredVariant
                          ? filteredVariant.discountedPrice
                          : product.discountedPrice}
                      </span>
                      {product?.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ₹
                          {filteredVariant
                            ? filteredVariant.originalPrice
                            : product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VARIANTS (Same UI) */}
                {product?.isVariantAvailable && productVariants?.length > 0 && (
                  <div className="border shadow p-4 rounded-md border-primary mb-6">
                    <h2 className="text-sm font-semibold mb-2">
                      Select Option
                    </h2>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Size</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded-lg ${
                              selectedSize === size
                                ? "text-white bg-[rgb(219,69,69)]"
                                : "bg-white text-black hover:bg-gray-100"
                            }`}>
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 border rounded-lg ${
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
                )}

                {/* DESCRIPTION */}
                {product?.description && (
                  <div
                    className="prose prose-stone mt-10"
                    dangerouslySetInnerHTML={{
                      __html: product?.description,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* REVIEW SECTION — SAME AS CLIENT */}
          {/* <ReviewSection
            product={product}
            hasUserBoughtThisProduct={true}
          /> */}
        </>
      ) : (
        <div className="w-full p-4 text-black min-h-[50vh] bg-white rounded-md shadow-lg flex items-center justify-center">
          <div className="text-center text-gray-500 mx-auto">
            No product found.
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;
