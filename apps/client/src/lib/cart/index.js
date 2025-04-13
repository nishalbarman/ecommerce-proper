"use server";

import { revalidateTag } from "next/cache";

export const fetchCart = async ({ page = 0, limit = 10 } = {}) => {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/cart`);
    url.searchParams.append("productType", "buy");
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);

    const res = await fetch(url.href, {
      credentials: "include",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { tags: ["Cart"] }, // Revalidation tag for Next.js
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const addProductToCart = async ({
  variant = undefined,
  productId,
  rentDays = undefined,
  productType = "buy",
  quantity = 1,
}) => {
  try {
    const url = new URL(`/cart/create`, process.env.NEXT_PUBLIC_SERVER_URL);

    const res = await fetch(url.href, {
      credentials: "include",
      headers: {
        method: "POST",
      },
      body: JSON.stringify({
        productId: productId,
        variant: variant,
        quantity: quantity,
        rentDays: rentDays,
        productType: productType,
      }),
    });

    revalidateTag("Cart");
  } catch (error) {
    console.error(error);
  }
};

export const updateCartItem = async ({ id = undefined, updatedItem = {} }) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    const url = new URL(`/api/cart/update/${id}`, backendUrl);

    const res = await fetch(url.href, {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });

    revalidateTag("Cart");

    // return res.json();
  } catch (error) {
    console.error(error);
  }
};

export const updateCartItemQuantity = async ({
  id = undefined,
  productType = undefined,
  quantity = 1,
}) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    const url = new URL(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/cart/update`,
      backendUrl
    );
    url.searchParams.append(cart, id);

    const res = await fetch(url.href, {
      credentials: "include",
      headers: {
        method: "PATCH",
      },
      body: JSON.stringify({
        quantity: quantity,
      }),
    });

    revalidateTag("Cart");

    // return res.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteCartItem = async ({ id = undefined, token = undefined }) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

    const url = new URL(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/cart/delete/${id}`,
      backendUrl
    );

    await fetch(url.href, {
      credentials: "include",
      headers: {
        method: "DELETE",
      },
    });

    revalidateTag("Cart");

    // return res.json();
  } catch (error) {
    console.error(error);
  }
};
