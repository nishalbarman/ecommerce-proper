import ProductPageClient from "./(component)/ProductPageClient";

const fetchInitialData = async (searchParams) => {
  try {
    const page = Number(searchParams.page) || 1;
    const query = searchParams.query || "";
    const sort = searchParams.sort || "newest";
    const category = searchParams.category || "";
    const minPrice = searchParams.minPrice || "";
    const maxPrice = searchParams.maxPrice || "";

    const url = new URL(
      `/api/proxy/products`,
      process.env.NEXT_PUBLIC_DOMAIN_URL,
    );

    url.searchParams.set("page", page - 1);
    url.searchParams.set("limit", 12);

    if (query) url.searchParams.set("query", query);
    if (sort !== "newest") url.searchParams.set("sort", sort);
    if (category) url.searchParams.set("category", category);
    if (minPrice) url.searchParams.set("minPrice", minPrice);
    if (maxPrice) url.searchParams.set("maxPrice", maxPrice);

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], total: 0 };
  }
};

export default async function Page({ searchParams }) {
  const sP = await searchParams;
  const data = await fetchInitialData(sP);
  const page = Number(sP.page) || 1;

  return <ProductPageClient initialData={data} initialPage={page} />;
}
