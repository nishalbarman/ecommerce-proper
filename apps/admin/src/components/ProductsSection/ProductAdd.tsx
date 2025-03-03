import React, {
  BaseSyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";
import { Category, Product } from "../../types";
import { useAppSelector } from "../../redux/index";
import { FaRegCopy } from "react-icons/fa";
import { SlRefresh } from "react-icons/sl";
import cAxios from "../../axios/cutom-axios";

import CustomCKE from "../CustomCKE/CustomCKE";
import AssetPicker from "../../components/AssetPicker/AssetPicker";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

import "../../styles/swiper-style.css";

import no_image from "../../assets/no-image.svg";
import { FileLibraryListItem } from "react-media-library";

type ProductAddProps = {
  loading?: boolean | undefined;
  setIsUpdateLoading?: any | undefined;
  fetchProductData?: any;
  setVisible?: any;
};

const ProductAdd: React.FC<ProductAddProps> = ({
  // loading = undefined,
  setIsUpdateLoading = undefined,
  fetchProductData = undefined,
  setVisible = undefined,
}) => {
  const { jwtToken } = useAppSelector((state) => state.auth);

  const [updateProductId, setUpdateProductId] = useState<string | null>(null);

  const [variantQuantity, setVariantQuantity] = useState<number | undefined>();

  const [productData, setProductData] = useState<Product>({
    title: "",
    previewImage: "",
    slideImages: [],
    description: "",
    category: "",
    productType: "buy",
    rentingPrice: "",
    discountedPrice: "",
    originalPrice: "",
    shippingPrice: "",
    availableStocks: "",
    isVariantAvailable: false,
    productVariant: {},
  });

  console.log(productData);

  const [categoryList, setCategoryList] = useState([]);

  // ! Fetch category logic

  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const fetchCategoryData = useCallback(async () => {
    try {
      setIsCategoryLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/categories`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setCategoryList(response.data.categories);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data?.message || "Some unknown error occured");
    } finally {
      setIsCategoryLoading(false);
    }
  }, [jwtToken]);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  // ! Update product logic
  useEffect(() => {
    const id = sessionStorage.getItem("productId") || null;
    setUpdateProductId(id);

    if (!!id) {
      const fetchData = async () => {
        try {
          const response = await cAxios.get(
            `${process.env.VITE_APP_API_URL}/products/admin-view/${id}`,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );

          const product: Product = response.data.product;

          console.log(product);

          setProductData({
            title: product.title,
            previewImage: product.previewImage,
            slideImages: product.slideImages || [],
            description: product.description,
            category: product.category,
            productType: product.productType,
            rentingPrice: product.rentingPrice,
            discountedPrice: product.discountedPrice,
            originalPrice: product.originalPrice,
            shippingPrice: product.shippingPrice,
            availableStocks: product.availableStocks,
            isVariantAvailable: product.isVariantAvailable,
            productVariant:
              product.productVariant !== undefined &&
              Array.isArray(product.productVariant) &&
              product.productVariant.length > 0
                ? product.productVariant.reduce((acc, variant, index) => {
                    // variant.previewImage = [];
                    // variant.slideImages = [];
                    return { ...acc, [`variant_no_${index}`]: variant };
                  }, {})
                : {},
          });

          setVariantQuantity(
            product.productVariant !== undefined &&
              Array.isArray(product.productVariant)
              ? product?.productVariant?.length
              : 0
          );
          if (typeof setIsFormSubmitting !== undefined)
            setIsUpdateLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, []);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    let isEverythingOk =
      !!productData?.title &&
      productData.title.length >= 5 &&
      productData.previewImage !== null &&
      productData.previewImage !== "" &&
      productData.slideImages !== null &&
      productData.slideImages.length > 0 &&
      productData.description?.length > 5 &&
      !!productData.category &&
      // !!productData.productType &&
      !isNaN(Number(productData.rentingPrice)) &&
      !isNaN(Number(productData.discountedPrice)) &&
      !isNaN(Number(productData.originalPrice)) &&
      +productData.discountedPrice <= +productData.originalPrice;

    console.log("Product Data", productData);
    console.log("Product Data Is Everything Ok", isEverythingOk);

    // if (productData.isVariantAvailable) {
    //   isEverythingOk =
    //     isEverythingOk && Object.keys(productData.productVariant).length === variantQuantity
    // }

    setIsSubmitDisabled(!isEverythingOk);
  }, [productData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleAddProduct = async () => {
    const response = await cAxios.post(
      `${process.env.VITE_APP_API_URL}/products`,
      {
        productData,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    console.log(response);
  };

  const handleUpdateProduct = async () => {
    await cAxios.patch(
      `${process.env.VITE_APP_API_URL}/products/update/${updateProductId}`,
      {
        productData,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (typeof fetchProductData !== undefined) {
      fetchProductData();
    }

    if (typeof setVisible !== undefined) {
      setVisible(false);
    }
    sessionStorage.removeItem("productId");
  };

  const handleProductSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    const id = toast.loading("Sending your request.. Please wait..");
    try {
      setIsFormSubmitting(true);
      if (!!updateProductId) {
        await handleUpdateProduct();
        toast.update(id, {
          render: "Product Updated",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        await handleAddProduct();
        toast.update(id, {
          render: "Product Created",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.update(id, {
        render:
          error.response?.data?.message ||
          error.message ||
          "Opps, Some error occured",
        type: "error",
        isLoading: false,
        closeOnClick: true,
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div
      className={`flex flex-col flex-1bg-gray-100 ${
        !updateProductId && "ml-64 p-3 md:p-6 "
      } max-md:ml-0`}>
      {!updateProductId && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Product</h1>
        </div>
      )}

      <div
        className={`bg-white shadow-md rounded mb-4 ${
          !updateProductId && "p-3 md:p-6"
        }`}>
        {!updateProductId && (
          <h2 className="text-lg font-bold mb-4">Add Product</h2>
        )}
        <form onSubmit={handleProductSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded shadow-lg border">
            <h3 className="text-xl font-semibold mb-3">Product Details</h3>

            <div className="mb-3">
              <label
                htmlFor="productTitle"
                className="block text-sm font-medium text-gray-700">
                Product Title{" "}
                {!updateProductId && (
                  <span className="text-red-500 font-extrabold">*</span>
                )}
              </label>
              <input
                type="text"
                id="productTitle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                placeholder="Enter your product title here"
                value={productData.title}
                onChange={(e) => {
                  setProductData((prev) => {
                    return { ...prev, title: e.target.value };
                  });
                }}
                minLength={10}
                required={!updateProductId}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-3">
              <div>
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="centerCategory"
                    className="block text-sm font-medium text-gray-700">
                    Category{" "}
                    {!updateProductId && (
                      <span className="text-red-500 font-extrabold">*</span>
                    )}
                  </label>
                </div>

                <div className="flex items-center mt-1 h-10 w-full ">
                  <select
                    id="centerCategory"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2 rounded-r-none"
                    value={(productData?.category as Category)?._id}
                    onChange={(e) => {
                      setProductData((prev) => {
                        return { ...prev, category: e.target.value };
                      });
                    }}
                    required={!updateProductId}
                    aria-label="Product Category">
                    <option>Select Category</option>
                    {categoryList?.map((category) => (
                      <option
                        key={(category as Category)?._id?.toString()}
                        value={(category as Category)._id}>
                        {(category as Category).categoryName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isCategoryLoading}
                    onClick={fetchCategoryData}
                    className={`flex justify-center items-center bg-gray-200 h-full border border-gray-300 border-l-none rounded-r-lg w-10`}>
                    <SlRefresh
                      className={`${isCategoryLoading && "animate-spin"} `}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="productType"
                  className="block text-sm font-medium text-gray-700">
                  Product Type{" "}
                  {!updateProductId && (
                    <span className="text-red-500 font-extrabold">*</span>
                  )}
                </label>
                <select
                  disabled // currently disabled cause in this project we dont need this option
                  id="productType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2 bg-gray-500"
                  value={productData.productType}
                  onChange={(e) => {
                    setProductData((prev) => {
                      return { ...prev, productType: e.target.value };
                    });
                  }}
                  required={!updateProductId}
                  aria-label="Product Type">
                  <option value={"buy"}>Disabled - No Need</option>
                  <option>Select Product Type</option>
                  <option value="rent">Rent</option>
                  <option value="buy">Buy</option>
                  <option value="both">Both Rent and Buy</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label
                htmlFor="productDescription"
                className="block text-sm font-medium text-gray-700 mb-1">
                Description{" "}
                {!updateProductId && (
                  <span className="text-red-500 font-extrabold">*</span>
                )}
              </label>
              <CustomCKE
                id="productDescription"
                content={productData?.description}
                changeContent={(content: any) => {
                  setProductData((prev) => {
                    return { ...prev, description: content };
                  });
                }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-lg border">
            <h3 className="text-xl font-semibold mb-3">Product Images</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div>
                  <label
                    htmlFor="productPreviewImage"
                    className="block text-sm font-medium text-gray-700">
                    Preview Image{" "}
                    {!updateProductId && (
                      <span className="text-red-500 font-extrabold">*</span>
                    )}
                  </label>

                  <div className="mt-1 flex items-center justify-center w-fit h-fit w-full">
                    {/* <label
                      htmlFor={`productPreviewImage`}
                      className="cursor-pointer bg-white p-8 rounded-md border-2 border-dashed border-gray-600 shadow-md mt-1 w-full">
                      <div className="flex flex-row items-center justify-start gap-3 w-full">
                        <svg
                          viewBox="0 0 640 512"
                          className="h-12 fill-gray-600">
                          <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                        </svg>

                        <span className="bg-gray-600 text-white py-1 px-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
                          Browse file
                        </span>
                      </div>
                      <input
                        id="productPreviewImage"
                        type="file"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border border-gray-300 hidden"
                        aria-label="Preview Image"
                        accept="image/*"
                        onChange={async (e) => {
                          const base64convertedFiles =
                            (await convertImagesToBase64(
                              e.target.files as FileList
                            )) as Base64StringWithType[];

                          setProductData((prev) => {
                            return {
                              ...prev,
                              previewImage: base64convertedFiles,
                            };
                          });
                        }}
                        required={!updateProductId}
                      />
                    </label> */}
                    <AssetPicker
                      htmlFor="productPreviewImage"
                      fileSelectCallback={(
                        imageItems: Array<FileLibraryListItem>
                      ) => {
                        console.log("Selected Image Link-->", imageItems);
                        setProductData((prev) => {
                          return {
                            ...prev,
                            previewImage: imageItems[0].imageLink,
                          };
                        });
                      }}
                      multiSelect={false}
                    />
                  </div>
                </div>

                <div className="w-full h-[400px] flex justify-center aspect-square overflow-hidden mt-1 border-2 rounded">
                  {productData.previewImage ? (
                    <img
                      className="w-full h-full w-[200px] aspect-square object-contain"
                      src={productData?.previewImage as string}
                    />
                  ) : (
                    <img
                      className="w-full h-full w-[150px] aspect-square object-contain"
                      src={no_image}
                    />
                  )}
                </div>
              </div>

              <div>
                <div>
                  <label
                    htmlFor="productSlideImage"
                    className="block text-sm font-medium text-gray-700">
                    Slider Images{" "}
                    {!updateProductId && (
                      <span className="text-red-500 font-extrabold">*</span>
                    )}
                  </label>

                  <div className="mt-1 flex items-center justify-center w-fit h-fit w-full">
                    {/* <label
                      htmlFor={`productSlideImage`}
                      className="cursor-pointer bg-white p-8 rounded-md border-2 border-dashed border-gray-600 shadow-md mt-1 w-full">
                      {" "}
                      <div className="flex flex-row items-center justify-start gap-3 w-full">
                        <svg
                          viewBox="0 0 640 512"
                          className="h-12 fill-gray-600">
                          <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                        </svg>

                        <span className="bg-gray-600 text-white py-1 px-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
                          Browse file
                        </span>
                      </div>
                      <input
                        id="productSlideImage"
                        type="file"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border border-gray-300 hidden"
                        aria-label="Slide Images"
                        accept="image/*"
                        onChange={async (e) => {
                          const base64convertedFiles =
                            (await convertImagesToBase64(
                              e.target.files as FileList
                            )) as Base64StringWithType[];

                          setProductData((prev) => {
                            return {
                              ...prev,
                              slideImages: base64convertedFiles,
                            };
                          });
                        }}
                        multiple={true}
                        required={!updateProductId}
                      />
                    </label> */}

                    <AssetPicker
                      htmlFor="productSlideImage"
                      fileSelectCallback={(
                        imageItems: Array<FileLibraryListItem>
                      ) => {
                        console.log("Selected Image Link-->", imageItems);
                        setProductData((prev) => {
                          return {
                            ...prev,
                            slideImages: imageItems.map(
                              (eachImage) => eachImage.imageLink
                            ),
                          };
                        });
                      }}
                      multiSelect={true}
                    />
                  </div>
                </div>

                <div className="w-full h-[400px] flex justify-center aspect-square overflow-hidden mt-1 border-2 rounded">
                  {productData.slideImages?.length ? (
                    <Swiper
                      modules={[Navigation, Pagination, Thumbs]}
                      navigation
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      slidesPerView={1}
                      className="my-swiper w-full h-full bg-gray-50 min-md:h-[500px] aspect-square rounded-lg shadow-lg mb-4">
                      {/* Slider Images */}

                      {(productData.slideImages as string[])?.map(
                        (image, index) => (
                          <SwiperSlide key={index}>
                            <img
                              src={`${image}`}
                              alt={`Product Image ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </SwiperSlide>
                        )
                      )}
                    </Swiper>
                  ) : (
                    <img
                      className="w-full h-full w-[150px] aspect-square object-contain"
                      src={no_image}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-lg border">
            <h3 className="text-xl font-semibold mb-3">Product Pricing</h3>

            <div className="mb-2 bg-green-200 p-3 rounded-md">
              <p className="text-body-secondary small mb-1">
                <strong>
                  Below are the instructions how to fill the pricing fields.
                </strong>
              </p>
              <ul>
                <li>
                  <code>Rent Price is the default rent price</code>
                </li>
                <li>
                  <code>
                    Buy price is the discounted buying price of the product
                  </code>
                </li>
                <li>
                  <code>
                    Original Price is the original price or MRP price of the
                    product
                  </code>
                </li>
                <li>
                  <code>
                    Shipping price is the shipping price for an product,
                    shipping price will only be applied to buy products. Rent
                    products will have 0 as shipping price as it is going to be
                    picked by user from `Center`
                  </code>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="productRentPrice"
                  className="block text-sm font-medium text-gray-700">
                  Rent Price{" "}
                  {!updateProductId && (
                    <span className="text-red-500 font-extrabold">*</span>
                  )}
                </label>
                <input
                  id="productRentPrice"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                  placeholder="Enter renting price for product"
                  value={productData.rentingPrice}
                  onChange={(e) => {
                    setProductData((prev) => {
                      return { ...prev, rentingPrice: +e.target.value || "" };
                    });
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                  }}
                  type="number"
                  required={!updateProductId}
                />
              </div>

              <div>
                <label
                  htmlFor="productPurchasePrice"
                  className="block text-sm font-medium text-gray-700">
                  Purchasable Price{" "}
                  {!updateProductId && (
                    <span className="text-red-500 font-extrabold">*</span>
                  )}
                </label>
                <input
                  id="productPurchasePrice"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                  placeholder="Enter purchasable price for product"
                  value={productData.discountedPrice}
                  onWheel={(e) => {
                    e.preventDefault();
                  }}
                  onChange={(e) => {
                    setProductData((prev) => {
                      return {
                        ...prev,
                        discountedPrice: +e.target.value || "",
                      };
                    });
                  }}
                  type="number"
                  required={!updateProductId}
                />
              </div>

              <div>
                <label
                  htmlFor="producOriginalMRP"
                  className="block text-sm font-medium text-gray-700">
                  Original MRP{" "}
                  {!updateProductId && (
                    <span className="text-red-500 font-extrabold">*</span>
                  )}
                </label>
                <input
                  id="producOriginalMRP"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                  placeholder="Enter orignal MRP of product"
                  value={productData.originalPrice}
                  onWheel={(e) => {
                    e.preventDefault();
                  }}
                  onChange={(e) => {
                    setProductData((prev) => {
                      return { ...prev, originalPrice: +e.target.value || "" };
                    });
                  }}
                  type="number"
                  required={!updateProductId}
                />
              </div>

              <div>
                <label
                  htmlFor="productShippingPrice"
                  className="block text-sm font-medium text-gray-700">
                  Delivery Charge{" "}
                  {!updateProductId && (
                    <span className="text-red-500 font-extrabold">*</span>
                  )}
                </label>
                <input
                  id="productShippingPrice"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                  placeholder="Enter delivery charge of product"
                  value={productData.shippingPrice}
                  onWheel={(e) => {
                    e.preventDefault();
                  }}
                  onChange={(e) => {
                    setProductData((prev) => {
                      return { ...prev, shippingPrice: +e.target.value || "" };
                    });
                  }}
                  type="number"
                  required={!updateProductId}
                />
              </div>

              <div>
                <label
                  htmlFor="productAvailableStocks"
                  className="block text-sm font-medium text-gray-700">
                  Available Stocks{" "}
                  {!updateProductId && (
                    <span className="text-red-500 font-extrabold">*</span>
                  )}
                </label>
                <input
                  id="productAvailableStocks"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                  placeholder="Enter available stocks of the product"
                  value={productData.availableStocks}
                  onChange={(e) => {
                    setProductData((prev) => {
                      return {
                        ...prev,
                        availableStocks: +e.target.value || "" || "",
                      };
                    });
                  }}
                  type="number"
                  required={!updateProductId}
                />
              </div>
            </div>
          </div>

          {!updateProductId ||
          (!!updateProductId &&
            Object.keys(productData.productVariant as {}).length > 0) ? (
            <div className="bg-white p-4 rounded shadow-lg border">
              <h3 className="text-xl font-semibold mb-3">
                Variant Information
              </h3>

              <div className="mb-2 bg-green-200 p-3 rounded-md">
                <p className="text-body-secondary mb-1">
                  <strong>
                    Product variants are different product sizes and colors.
                    Each different product variant has different pricing
                    infomation and has different preview images
                  </strong>
                </p>
                <ul>
                  <li>
                    <code>Click the chekbox if you want to add variants</code>
                  </li>
                  <li>
                    <code>
                      Enter the number of variants you need beside the checkbox
                      to populate variant filling boxes
                    </code>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex h-10 items-center justify-start gap-3">
                    <label
                      htmlFor="variantRequiredConfirm"
                      className="block text-sm font-medium text-gray-700 ">
                      Are you planning to add variants ?
                    </label>
                    <input
                      id="variantCheckbox"
                      type="checkbox"
                      className="form-checkbox h-6 w-6 text-blue-600"
                      onChange={(e) => {
                        setProductData((prev) => {
                          return {
                            ...prev,
                            isVariantAvailable: e.target.checked,
                          };
                        });
                      }}
                      checked={!!productData?.isVariantAvailable}
                      aria-label="Product Variant Checkbox"
                      disabled={!!updateProductId}
                    />
                  </div>

                  <div className="flex items-center mb-3">
                    {productData.isVariantAvailable && (
                      <input
                        type="number"
                        className="form-input p-2 border border-gray-300 rounded-md flex-1"
                        onChange={(e) => {
                          setVariantQuantity(+e.target.value);
                        }}
                        value={variantQuantity}
                        onWheel={(e) => {
                          e.preventDefault();
                        }}
                        min={0}
                        placeholder="Number of variants requried"
                        aria-label="Variant quantity"
                      />
                    )}
                  </div>

                  {!!productData?.isVariantAvailable &&
                    variantQuantity !== undefined && (
                      <p className="text-body-secondary ">
                        Fill the variant details:
                      </p>
                    )}
                </div>
              </div>

              {!!productData?.isVariantAvailable &&
                variantQuantity !== undefined && (
                  <div className="grid grid-cols-1 grid-flow-rows gap-4 [1680px]:grid-cols-2 w-full [1680px]:border [1680px]:p-2 rounded-sm">
                    {Array.from({
                      length:
                        variantQuantity === undefined ? 0 : variantQuantity,
                    }).map((_, index) => {
                      return (
                        <div className="grow">
                          <div className="w-full p-3 bg-orange-300 rounded-t-md">
                            <p className="">
                              <strong>Variant No. {index + 1}</strong>
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-lg border">
                            <h3 className="text-xl font-semibold mb-3">
                              Variant Images
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <div>
                                  <label
                                    htmlFor={`variantPreviewImages-${
                                      index + 1
                                    }`}
                                    className="block text-sm font-medium text-gray-700">
                                    Preview Image{" "}
                                    {!updateProductId && (
                                      <span className="text-red-500 font-extrabold">
                                        *
                                      </span>
                                    )}
                                  </label>

                                  <div className="mt-1 flex items-center justify-center w-fit h-fit w-full">
                                    {/* <label
                                      htmlFor={`variantPreviewImages-${index + 1}`}
                                      className="cursor-pointer bg-white p-8 rounded-md border-2 border-dashed border-gray-600 shadow-md mt-1 w-full">
                                      {" "}
                                      <div className="flex flex-row items-center justify-start gap-3 w-full">
                                        <svg
                                          viewBox="0 0 640 512"
                                          className="h-12 fill-gray-600">
                                          <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                                        </svg>

                                        <span className="bg-gray-600 text-white py-1 px-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
                                          Browse file
                                        </span>
                                      </div>
                                      <input
                                        id={`variantPreviewImages-${index + 1}`}
                                        type="file"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border border-gray-300 hidden"
                                        aria-label="Variant Preview Images"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const base64convertedFiles =
                                            (await convertImagesToBase64(
                                              e.target.files as FileList
                                            )) as Base64StringWithType[];
                                          setProductData((prev) => {
                                            return {
                                              ...prev,
                                              productVariant: {
                                                ...prev.productVariant,
                                                [`variant_no_${index}`]: {
                                                  ...(
                                                    prev.productVariant as {
                                                      [key: string]: any;
                                                    }
                                                  )[`variant_no_${index}`],
                                                  previewImage:
                                                    base64convertedFiles,
                                                },
                                              },
                                            };
                                          });
                                        }}
                                        required={!updateProductId}
                                        multiple={false}
                                      />
                                    </label> */}

                                    <AssetPicker
                                      htmlFor={`variantPreviewImages-${index + 1}`}
                                      fileSelectCallback={(
                                        imageItems: Array<FileLibraryListItem>
                                      ) => {
                                        setProductData((prev) => {
                                          return {
                                            ...prev,
                                            productVariant: {
                                              ...prev.productVariant,
                                              [`variant_no_${index}`]: {
                                                ...(
                                                  prev.productVariant as {
                                                    [key: string]: any;
                                                  }
                                                )[`variant_no_${index}`],
                                                previewImage:
                                                  imageItems[0].imageLink,
                                              },
                                            },
                                          };
                                        });
                                      }}
                                      multiSelect={false}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-center w-full h-[400px] aspect-square overflow-hidden mt-1 border-2 rounded">
                                  {productData.productVariant &&
                                  !Array.isArray(productData.productVariant) &&
                                  productData.productVariant[
                                    `variant_no_${index}`
                                  ]?.previewImage ? (
                                    <img
                                      className="h-full w-full aspect-square object-contain"
                                      src={
                                        productData.productVariant[
                                          `variant_no_${index}`
                                        ]?.previewImage as string
                                      }
                                    />
                                  ) : (
                                    <img
                                      className="w-full h-full w-[150px] aspect-square object-contain"
                                      src={no_image}
                                    />
                                  )}
                                </div>
                              </div>

                              <div>
                                <div>
                                  <label
                                    htmlFor={`variantSlideImages-${index + 1}`}
                                    className="block text-sm font-medium text-gray-700">
                                    Slider Images{" "}
                                    {!updateProductId && (
                                      <span className="text-red-500 font-extrabold">
                                        *
                                      </span>
                                    )}
                                  </label>

                                  <div className="mt-1 flex items-center justify-center w-fit h-fit w-full">
                                    {/* <label
                                      htmlFor={`variantSlideImages-${index + 1}`}
                                      className="cursor-pointer bg-white p-8 rounded-md border-2 border-dashed border-gray-600 shadow-md mt-1 w-full">
                                      {" "}
                                      <div className="flex flex-row items-center justify-start gap-3 w-full">
                                        <svg
                                          viewBox="0 0 640 512"
                                          className="h-12 fill-gray-600">
                                          <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                                        </svg>
                                        
                                        <span className="bg-gray-600 text-white py-1 px-3 rounded-lg transition-all duration-300 hover:bg-gray-800">
                                          Browse file
                                        </span>
                                      </div>
                                      <input
                                        id={`variantSlideImages-${index + 1}`}
                                        type="file"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border border-gray-300 hidden"
                                        aria-label="Variant Slide Images"
                                        accept="image/*"
                                        multiple
                                        required={!updateProductId}
                                        onChange={async (e) => {
                                          const base64convertedFiles =
                                            (await convertImagesToBase64(
                                              e.target.files as FileList
                                            )) as Base64StringWithType[];
                                          setProductData((prev) => {
                                            return {
                                              ...prev,
                                              productVariant: {
                                                ...prev.productVariant,
                                                [`variant_no_${index}`]: {
                                                  ...(
                                                    prev.productVariant as {
                                                      [key: string]: any;
                                                    }
                                                  )[`variant_no_${index}`],
                                                  slideImages:
                                                    base64convertedFiles,
                                                },
                                              },
                                            };
                                          });
                                        }}
                                      />
                                    </label> */}
                                    <AssetPicker
                                      htmlFor={`variantSlideImages-${index + 1}`}
                                      fileSelectCallback={(
                                        imageItems: Array<FileLibraryListItem>
                                      ) => {
                                        console.log(
                                          "Selected Image Link-->",
                                          imageItems
                                        );
                                        setProductData((prev) => {
                                          return {
                                            ...prev,
                                            productVariant: {
                                              ...prev.productVariant,
                                              [`variant_no_${index}`]: {
                                                ...(
                                                  prev.productVariant as {
                                                    [key: string]: any;
                                                  }
                                                )[`variant_no_${index}`],
                                                slideImages: imageItems.map(
                                                  (eachImage) =>
                                                    eachImage.imageLink
                                                ),
                                              },
                                            },
                                          };
                                        });
                                      }}
                                      multiSelect={true}
                                    />
                                  </div>
                                </div>
                                <div className="w-full h-[400px] aspect-square overflow-hidden mt-1 border-2 rounded">
                                  <Swiper
                                    modules={[Navigation, Pagination, Thumbs]}
                                    navigation
                                    pagination={{ clickable: true }}
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    className="my-swiper w-full h-full bg-gray-50 min-md:h-[500px] aspect-square rounded-lg shadow-lg mb-4">
                                    {/* Slider Images */}

                                    {productData.productVariant &&
                                    !Array.isArray(
                                      productData.productVariant
                                    ) &&
                                    (
                                      productData.productVariant[
                                        `variant_no_${index}`
                                      ]?.slideImages as string[]
                                    )?.length > 0 ? (
                                      (
                                        productData.productVariant[
                                          `variant_no_${index}`
                                        ]?.slideImages as string[]
                                      )?.map((image, index) => (
                                        <SwiperSlide key={index}>
                                          <img
                                            src={`${image}`}
                                            alt={`Product Image ${index + 1}`}
                                            className="w-full h-full object-contain"
                                          />
                                        </SwiperSlide>
                                      ))
                                    ) : (
                                      <SwiperSlide className="flex justify-center">
                                        <img
                                          className="w-full h-full w-[150px] aspect-square object-contain"
                                          src={no_image}
                                        />
                                      </SwiperSlide>
                                    )}
                                  </Swiper>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded shadow-lg border">
                            <div className="flex justify-between">
                              <h3 className="text-xl font-semibold mb-3">
                                Variant Pricing
                              </h3>
                              <button
                                onClick={() => {
                                  setProductData((prev) => {
                                    return {
                                      ...prev,
                                      productVariant: {
                                        ...prev.productVariant,
                                        [`variant_no_${index}`]: {
                                          ...(
                                            prev.productVariant as {
                                              [key: string]: any;
                                            }
                                          )[`variant_no_${index}`],
                                          rentingPrice:
                                            +productData.rentingPrice || "",
                                          originalPrice:
                                            +productData.originalPrice || "",
                                          discountedPrice:
                                            +productData.discountedPrice || "",
                                          shippingPrice:
                                            +productData.shippingPrice || "",
                                          availableStocks:
                                            +productData.availableStocks || "",
                                        },
                                      },
                                    };
                                  });
                                }}
                                type="button"
                                className="text-md flex items-center border border-indigo-400 bg-indigo-400 p-1 font-semibold mb-3 text-white gap-x-1 px-2 rounded-md">
                                <FaRegCopy /> Copy Base
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label
                                  htmlFor={`variantRentablePrice-${index + 1}`}
                                  className="block text-sm font-medium text-gray-700">
                                  Rent Price{" "}
                                  {!updateProductId && (
                                    <span className="text-red-500 font-extrabold">
                                      *
                                    </span>
                                  )}
                                </label>
                                <input
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                  placeholder="Enter renting price for variant"
                                  value={
                                    (
                                      productData?.productVariant as {
                                        [key: string]: any;
                                      }
                                    )[`variant_no_${index}`]?.rentingPrice
                                  }
                                  onChange={(e) => {
                                    setProductData((prev) => {
                                      return {
                                        ...prev,
                                        productVariant: {
                                          ...prev.productVariant,
                                          [`variant_no_${index}`]: {
                                            ...(
                                              prev.productVariant as {
                                                [key: string]: any;
                                              }
                                            )[`variant_no_${index}`],
                                            rentingPrice:
                                              +e.target.value || "" || "",
                                          },
                                        },
                                      };
                                    });
                                  }}
                                  onWheel={(e) => {
                                    e.preventDefault();
                                  }}
                                  type="number"
                                  id={`variantRentablePrice-${index + 1}`}
                                  required={!updateProductId}
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`variantPurchasablePrice-${
                                    index + 1
                                  }`}
                                  className="block text-sm font-medium text-gray-700">
                                  Purchasable Price{" "}
                                  {!updateProductId && (
                                    <span className="text-red-500 font-extrabold">
                                      *
                                    </span>
                                  )}
                                </label>
                                <input
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                  placeholder="Enter purchasable price for product"
                                  value={
                                    (
                                      productData?.productVariant as {
                                        [key: string]: any;
                                      }
                                    )[`variant_no_${index}`]?.discountedPrice
                                  }
                                  onChange={(e) => {
                                    setProductData((prev) => {
                                      return {
                                        ...prev,
                                        productVariant: {
                                          ...prev.productVariant,
                                          [`variant_no_${index}`]: {
                                            ...(
                                              prev.productVariant as {
                                                [key: string]: any;
                                              }
                                            )[`variant_no_${index}`],
                                            discountedPrice:
                                              +e.target.value || "",
                                          },
                                        },
                                      };
                                    });
                                  }}
                                  onWheel={(e) => {
                                    e.preventDefault();
                                  }}
                                  type="number"
                                  id={`variantPurchasablePrice-${index + 1}`}
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`variantOriginalMRP-${index + 1}`}
                                  className="block text-sm font-medium text-gray-700">
                                  Original MRP{" "}
                                  {!updateProductId && (
                                    <span className="text-red-500 font-extrabold">
                                      *
                                    </span>
                                  )}
                                </label>
                                <input
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                  placeholder="Enter orignal MRP of product"
                                  value={
                                    (
                                      productData?.productVariant as {
                                        [key: string]: any;
                                      }
                                    )[`variant_no_${index}`]?.originalPrice
                                  }
                                  onChange={(e) => {
                                    setProductData((prev) => {
                                      return {
                                        ...prev,
                                        productVariant: {
                                          ...prev.productVariant,
                                          [`variant_no_${index}`]: {
                                            ...(
                                              prev.productVariant as {
                                                [key: string]: any;
                                              }
                                            )[`variant_no_${index}`],
                                            originalPrice:
                                              +e.target.value || "",
                                          },
                                        },
                                      };
                                    });
                                  }}
                                  onWheel={(e) => {
                                    e.preventDefault();
                                  }}
                                  type="number"
                                  id={`variantOriginalMRP-${index + 1}`}
                                  required={!updateProductId}
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`variantDeliveryCharges-${
                                    index + 1
                                  }`}
                                  className="block text-sm font-medium text-gray-700">
                                  Delivery Charge{" "}
                                  {!updateProductId && (
                                    <span className="text-red-500 font-extrabold">
                                      *
                                    </span>
                                  )}
                                </label>
                                <input
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                  placeholder="Enter delivery charge of product"
                                  value={
                                    (
                                      productData?.productVariant as {
                                        [key: string]: any;
                                      }
                                    )[`variant_no_${index}`]?.shippingPrice
                                  }
                                  onChange={(e) => {
                                    setProductData((prev) => {
                                      return {
                                        ...prev,
                                        productVariant: {
                                          ...prev.productVariant,
                                          [`variant_no_${index}`]: {
                                            ...(
                                              prev.productVariant as {
                                                [key: string]: any;
                                              }
                                            )[`variant_no_${index}`],
                                            shippingPrice:
                                              +e.target.value || "",
                                          },
                                        },
                                      };
                                    });
                                  }}
                                  onWheel={(e) => {
                                    e.preventDefault();
                                  }}
                                  type="number"
                                  id={`variantDeliveryCharges-${index + 1}`}
                                  required={!updateProductId}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded shadow-lg border">
                            <h3 className="text-xl font-semibold mb-3">
                              Variants Stocks
                            </h3>

                            <div>
                              <label
                                htmlFor={`variantAvailableStocks-${index + 1}`}
                                className="block text-sm font-medium text-gray-700">
                                Available Stocks{" "}
                                {!updateProductId && (
                                  <span className="text-red-500 font-extrabold">
                                    *
                                  </span>
                                )}
                              </label>
                              <input
                                id={`variantAvailableStocks-${index + 1}`}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                placeholder="Enter available stocks of the variant"
                                value={
                                  (
                                    productData?.productVariant as {
                                      [key: string]: any;
                                    }
                                  )[`variant_no_${index}`]?.availableStocks
                                }
                                onChange={(e) => {
                                  setProductData((prev) => {
                                    return {
                                      ...prev,
                                      productVariant: {
                                        ...prev.productVariant,
                                        [`variant_no_${index}`]: {
                                          ...(
                                            prev.productVariant as {
                                              [key: string]: any;
                                            }
                                          )[`variant_no_${index}`],
                                          availableStocks:
                                            +e.target.value || "",
                                        },
                                      },
                                    };
                                  });
                                }}
                                type="number"
                                required={!updateProductId}
                              />
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded shadow-lg border">
                            <h3 className="text-xl font-semibold mb-3">
                              Variation
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label
                                  htmlFor={`variantColor-${index + 1}`}
                                  className="block text-sm font-medium text-gray-700">
                                  Color{" "}
                                  {!updateProductId && (
                                    <span className="text-red-500 font-extrabold">
                                      *
                                    </span>
                                  )}
                                </label>
                                <input
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                  // placeholder="Enter color for product variant"
                                  value={
                                    (
                                      productData?.productVariant as {
                                        [key: string]: any;
                                      }
                                    )[`variant_no_${index}`]?.color
                                  }
                                  onChange={(e) => {
                                    setProductData((prev) => {
                                      return {
                                        ...prev,
                                        productVariant: {
                                          ...prev.productVariant,
                                          [`variant_no_${index}`]: {
                                            ...(
                                              prev.productVariant as {
                                                [key: string]: any;
                                              }
                                            )[`variant_no_${index}`],
                                            color: e.target.value,
                                          },
                                        },
                                      };
                                    });
                                  }}
                                  type="text"
                                  id={`variantColor-${index + 1}`}
                                  placeholder="Black | White | Red etc."
                                  required={!updateProductId}
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`variantSize-${index + 1}`}
                                  className="block text-sm font-medium text-gray-700">
                                  Size(s){" "}
                                  {!updateProductId && (
                                    <span className="text-red-500 font-extrabold">
                                      *
                                    </span>
                                  )}
                                  {/* <span className="text-red-500 ml-1"></span> */}
                                </label>
                                <input
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border border-gray-300 px-2"
                                  // placeholder="Enter Size for product variant"
                                  value={
                                    (
                                      productData?.productVariant as {
                                        [key: string]: any;
                                      }
                                    )[`variant_no_${index}`]?.size
                                  }
                                  onChange={(e) => {
                                    setProductData((prev) => {
                                      return {
                                        ...prev,
                                        productVariant: {
                                          ...prev.productVariant,
                                          [`variant_no_${index}`]: {
                                            ...(
                                              prev.productVariant as {
                                                [key: string]: any;
                                              }
                                            )[`variant_no_${index}`],
                                            size: e.target.value,
                                          },
                                        },
                                      };
                                    });
                                  }}
                                  type="text"
                                  id={`variantSize-${index + 1}`}
                                  placeholder="Comma separated sizes or single size."
                                  required={!updateProductId}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          ) : (
            <></>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="cursor-pointer inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-200"
              disabled={
                !(updateProductId || (!isSubmitDisabled && !isFormSubmitting))
              }>
              {updateProductId ? "Update Product" : "Submit form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAdd;
