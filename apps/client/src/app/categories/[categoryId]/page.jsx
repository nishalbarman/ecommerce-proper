import CategoryPageClient from "./(component)/CategoryPageClient";

export default async function Page({ params, searchParams }) {
  // ✅ unwrap searchParams
  const sp = await searchParams;
  const p = await params;

  const page = Number(sp.page) || 1;
  const limit = Number(sp.limit) || 12;

  const productRes = fetch(
    `/products?page=${page - 1}&limit=${limit}&category=${p.categoryId}`,
    { cache: "no-store" },
  );

  const res = fetch(`/categories/view/${p.categoryId}`, { cache: "no-store" });

  const response = await Promise.all([productRes, res]);

  const data = await Promise.all([response[0].json(), response[1].json()]);

  if (!response[0].ok || !response[1].ok) {
    throw new Error("Failed to fetch category products");
  }

  return (
    <CategoryPageClient
      initialCategory={data[1]}
      initialProduct={data[0]}
      initialPage={page}
    />
  );
}
