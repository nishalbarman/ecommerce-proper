"use server";

// Server action to handle variant selection
async function handleVariantSelection(formData, product) {
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
          `${process.env.NEXT_PUBLIC_SERVER_URL}/products/instock/${productId}`,
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
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products/instock/${productId}`,
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

export default handleVariantSelection;
