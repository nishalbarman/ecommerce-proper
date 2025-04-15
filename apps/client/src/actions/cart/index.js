// actions/cart/addToCart.ts
"use server";

import { cookies } from "next/headers";

export async function addToCart(formData) {
  try {
    const token = await cookies().get("token")?.value;
    const allCookies = cookies();
    if (!token) {
      throw new Error("Authentication required");
    }

    const productId = formData.get("productId");
    const productType = formData.get("productType");
    const quantity = formData.get("quantity");
    const rentDays = formData.get("rentDays");
    const variantId = formData.get("variantId");

    const cartObject = {
      productId,
      quantity: parseInt(quantity),
      productType,
    };

    // if (productType === "rent") {
    //   cartObject.rentDays = parseInt(rentDays);
    // }

    if (variantId) {
      cartObject.variant = variantId;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/cart`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookies: `token=${token}`,
      },
      body: JSON.stringify(cartObject),
    });

    return {
      success: true,
      message: "Added to cart successfully",
      data: response.data,
    };
  } catch (error) {
    console.log("Error adding to cart:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add to cart",
    };
  }
}
