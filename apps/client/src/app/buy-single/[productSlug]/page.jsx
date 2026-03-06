import React from "react";
import BuySingleClientData from "./(component)/BuySingleClientPage";

const getProductInfo = async ({ params, searchParams }) => {
  try {
    const productSlug = params.productSlug;
    const productVariantId = searchParams.productVariantId;
    // const quantity = searchParams.get("quantity");

    let response = null;
    if (productVariantId) {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/products/view-variant/${productVariantId}`,
        {
          headers: {
            "Contect-Type": "application/json",
          },
          method: "POST",
        },
      );
      const data = await response.json();
      console.log("What is data from getProductInfo: line 174", data);
      return {
        ...data?.variant?.product,
        ...data?.variant,
      };
    } else {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/products/view/${productSlug}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      return data?.product;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function Page({ params, searchParams }) {
  const p = await params;
  const sP = await searchParams;

  const productData = await getProductInfo({ params: p, searchParams: sP });

  console.log("Product Data in Page Component", productData);

  return (
    <>
      <BuySingleClientData initialProductData={productData} />
    </>
  );
}
