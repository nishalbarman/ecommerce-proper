import { notFound } from "next/navigation";
import ProductDetails from "@/components/ProductComps/ProductDetails/ProductPageDetails";

// Server action to handle variant selection
async function handleVariantSelection(prevState, formData) {
  "use server";

  const size = formData.get("size");
  const color = formData.get("color");
  const productId = formData.get("productId");

  console.log("On action what are the values for variants", {
    size,
    color,
    productId,
  });

  try {
    // Fetch the product and its variants
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view/${productId}`,
      { method: "POST" }
    );

    const responseData = await response.json();

    const product = responseData.product;
    const isProductVariantAvailable = product.isVariantAvailable;
    const productVariants = product.productVariant || [];

    console.log("Does the variant get matched", {
      product,
      isProductVariantAvailable,
      productVariants,
    });

    if (isProductVariantAvailable) {
      // Find the matched variant based on size and color
      const matchedVariant = productVariants.find((variant) => {
        return variant.size === size && variant.color === color;
      });

      console.log("Does the variant get matched", {
        matchedVariant,
      });

      // Check stock availability for the matched variant
      let inStock = false;

      if (matchedVariant) {
        console.log(
          "Is Product In Stock",
          JSON.stringify({ variant: matchedVariant._id })
        );
        const stockResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/products/variant/instock/${productId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ variant: matchedVariant._id }),
          }
        );

        const sResponse = await stockResponse.json();

        inStock = sResponse.inStock;
      }

      console.log("At last", {
        matchedVariant,
        inStock,
        combinationExists: !!matchedVariant,
      });

      return {
        matchedVariant,
        inStock,
        combinationExists: !!matchedVariant,
      };
    } else {
      const stockResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products/variant/instock/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variant: null,
          }),
        }
      );

      const sResponse = await stockResponse.json();

      inStock = sResponse.inStock;
      console.log(inStock);
    }
  } catch (error) {
    console.error("Error handling variant selection:", error);
    throw new Error("Failed to handle variant selection");
  }
}

export default async function ViewProduct({ params }) {
  const { productId } = await params;

  try {
    // Fetch product details

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view/${productId}`,
      {
        method: "POST",
      }
    );

    const responseData = await response.json();

    console.log("Response Data of Product", responseData);

    const product = responseData.product;
    const productVariants = product.productVariant || [];

    // Extract sizes and colors from variants
    const sizes = new Set();
    const colors = new Set();
    const combinations = new Set();

    productVariants.forEach((variant) => {
      sizes.add(variant.size);
      colors.add(variant.color);
      combinations.add(`${variant.size}-${variant.color}`);
    });

    const availableSizes = Array.from(sizes);
    const availableColors = Array.from(colors);
    const validCombinations = combinations;

    // Set default selected size and color
    let selectedSize = "";
    let selectedColor = "";
    if (productVariants.length > 0) {
      selectedSize = productVariants[0].size;
      selectedColor = productVariants[0].color;
    }

    return (
      <ProductDetails
        product={product}
        productVariants={productVariants}
        availableSizes={availableSizes}
        availableColors={availableColors}
        validCombinations={validCombinations}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        productId={productId}
        handleVariantSelection={handleVariantSelection}
      />
    );
  } catch (error) {
    console.error("Error fetching product details:", error);
    notFound();
  }
}
