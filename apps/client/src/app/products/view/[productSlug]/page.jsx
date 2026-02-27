import ViewOneProductClient from "../../(component)/ViewOneProductClient";

export default async function Page({ params }) {
  const p = await params;
  const { productSlug } = p;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view/${productSlug}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  console.log("Product Slug", productSlug);
  const product = await response.json();

  return (
    <>
      <ViewOneProductClient initialProductData={product} />
    </>
  );
}
