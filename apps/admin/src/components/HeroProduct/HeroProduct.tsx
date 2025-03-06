import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileLibraryListItem } from "react-media-library";
import AssetPicker from "../../components/AssetPicker/AssetPicker";
import { HeroProduct } from "../../types";
import cAxios from "../../axios/cutom-axios";
import no_image from "../../assets/no-image.svg";
import CustomCKE from "../CustomCKE/CustomCKE";

const HeroProductAdd = () => {
  const [heroProductData, setHeroProductData] = useState<HeroProduct>({
    title: "",
    category: "",
    shortDescription: "",
    imageUrl: "",
    productReference: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [existingHeroProduct, setExistingHeroProduct] =
    useState<HeroProduct | null>(null);

  // Fetch the existing hero product on component mount
  useEffect(() => {
    const fetchHeroProduct = async () => {
      try {
        const response = await cAxios.get(
          `${process.env.VITE_APP_API_URL}/hero-products`
        );
        if (response.data && response.data.length > 0) {
          setExistingHeroProduct(response.data[0]); // Set the first hero product
          setHeroProductData(response.data[0]); // Pre-fill the form with existing data
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message);
      }
    };

    fetchHeroProduct();
  }, []);

  // Validate form fields
  useEffect(() => {
    const isEverythingOk =
      !!heroProductData?.title &&
      heroProductData.title.length >= 3 &&
      !!heroProductData?.category &&
      heroProductData.category.length >= 3 &&
      !!heroProductData?.shortDescription &&
      heroProductData.shortDescription.length >= 10 &&
      !!heroProductData?.imageUrl &&
      !!heroProductData?.productReference;
    setIsSubmitDisabled(!isEverythingOk);
  }, [heroProductData]);

  // Handle form submission (add or update)
  const handleSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    try {
      setIsFormSubmitting(true);

      if (existingHeroProduct) {
        // Update existing hero product
        const response = await cAxios.patch(
          `${process.env.VITE_APP_API_URL}/hero-products/${existingHeroProduct._id}`,
          { heroProductData }
        );
        toast.success(response?.data?.message);
      } else {
        // Add new hero product
        const response = await cAxios.post(
          `${process.env.VITE_APP_API_URL}/hero-products`,
          { heroProductData }
        );
        toast.success(response?.data?.message);
      }

      // Reset form after successful submission
      // setHeroProductData({
      //   category: "",
      //   shortDescription: "",
      //   imageUrl: "",
      //   productReference: "",
      // });
      // setExistingHeroProduct(null); // Reset existing hero product state
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Hero Product</h1>
      </div>
      <div className="bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">
          {existingHeroProduct ? "Update Hero Product" : "Add Hero Product"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="mb-4 w-1/2">
              <label htmlFor="title" className="block font-semibold mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="Enter Title"
                value={heroProductData.title}
                onChange={(e) =>
                  setHeroProductData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                minLength={3}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4 w-1/2">
              <label htmlFor="category" className="block font-semibold mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                placeholder="Enter Category"
                value={heroProductData.category}
                onChange={(e) =>
                  setHeroProductData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                minLength={3}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="shortDescription"
              className="block font-semibold mb-2">
              About
            </label>
            <CustomCKE
              id="shortDescription"
              content={heroProductData.shortDescription}
              changeContent={(content: any) => {
                setHeroProductData((prev) => ({
                  ...prev,
                  shortDescription: content,
                }));
              }}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="productReference"
              className="block font-semibold mb-2">
              Product ID
            </label>
            <input
              type="text"
              id="productReference"
              placeholder="Enter product ID"
              value={heroProductData.productReference}
              onChange={(e) =>
                setHeroProductData((prev) => ({
                  ...prev,
                  productReference: e.target.value,
                }))
              }
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4 w-1/2">
            <label htmlFor="image" className="block font-semibold mb-2">
              Image
            </label>
            <div className="flex justify-center gap-4">
              <AssetPicker
                htmlFor="image"
                fileSelectCallback={(
                  imageItems: Array<FileLibraryListItem>
                ) => {
                  setHeroProductData((prev) => ({
                    ...prev,
                    imageUrl: imageItems[0].imageLink,
                  }));
                }}
                multiSelect={false}
              />
              <div className="w-full flex justify-center items-center aspect-square overflow-hidden mt-1 border-2 rounded">
                {heroProductData.imageUrl ? (
                  <img
                    className="w-full h-full w-[200px] aspect-square object-contain"
                    src={heroProductData.imageUrl}
                  />
                ) : (
                  <img
                    className="w-full h-full w-60 aspect-square object-contain"
                    src={no_image}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitDisabled || isFormSubmitting}
              className={`px-4 py-2 rounded-md text-white ${
                isSubmitDisabled || isFormSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}>
              {existingHeroProduct ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroProductAdd;
