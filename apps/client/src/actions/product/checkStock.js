"use server";
export default async function checkStock(productId) {
  try {
    const response = await fetch(`/products/instock/${productId}`, {
      method: "POST",
    });
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
