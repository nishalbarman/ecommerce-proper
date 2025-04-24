"use client";

import { useState, useEffect } from "react";
import ProductDetails from "@/components/ProductComps/ProductDetails/ProductPageDetails";
import ReviewSection from "@/components/ReviewSection/ReviewSection";
import { useParams } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";

export default function ViewProduct() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [validCombinations, setValidCombinations] = useState(new Set());
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variantSelection, setVariantSelection] = useState({
    matchedVariant: null,
    inStock: false,
    combinationExists: false,
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axiosInstance.post(
          `/products/view/${productId}`
        );
        const responseData = response.data;
        const productData = responseData.product;
        const variants = productData.productVariant || [];

        setProduct(productData);
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

        setAvailableSizes(Array.from(sizes));
        setAvailableColors(Array.from(colors));
        setValidCombinations(combinations);

        // Set default selected size and color
        if (variants.length > 0) {
          setSelectedSize(variants[0].size);
          setSelectedColor(variants[0].color);
          // Check initial variant availability
          checkVariantAvailability(variants[0].size, variants[0].color);
        }
      } catch (err) {
        setError("Failed to fetch product details");
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const checkVariantAvailability = async (size, color) => {
    try {
      if (!product) return;

      const isProductVariantAvailable = product.isVariantAvailable;

      if (isProductVariantAvailable) {
        // Find the matched variant based on size and color
        const matchedVariant = productVariants.find(
          (variant) => variant.size === size && variant.color === color
        );

        // Check stock availability for the matched variant
        let inStock = false;

        if (matchedVariant) {
          const stockResponse = await axiosInstance.post(
            `/products/variant/instock/${productId}`,
            { variant: matchedVariant._id }
          );
          inStock = stockResponse.data.inStock;
        }

        setVariantSelection({
          matchedVariant,
          inStock,
          combinationExists: !!matchedVariant,
        });
      } else {
        const stockResponse = await axiosInstance.post(
          `/products/variant/instock/${productId}`,
          { variant: null }
        );
        setVariantSelection({
          inStock: stockResponse.data.inStock,
          combinationExists: true,
        });
      }
    } catch (error) {
      console.error("Error checking variant availability:", error);
      setVariantSelection({
        matchedVariant: null,
        inStock: false,
        combinationExists: false,
      });
    }
  };

  const handleSizeChange = async (size) => {
    setSelectedSize(size);
    await checkVariantAvailability(size, selectedColor);
  };

  const handleColorChange = async (color) => {
    setSelectedColor(color);
    await checkVariantAvailability(selectedSize, color);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <ProductDetails
        product={product}
        productVariants={productVariants}
        availableSizes={availableSizes}
        availableColors={availableColors}
        validCombinations={validCombinations}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        productId={productId}
        variantSelection={variantSelection}
        onSizeChange={handleSizeChange}
        onColorChange={handleColorChange}
      />
      <ReviewSection product={product} />
    </>
  );
}
