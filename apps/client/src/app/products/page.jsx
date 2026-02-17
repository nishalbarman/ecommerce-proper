"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { MdErrorOutline } from "react-icons/md";
import { ProductApi } from "@/redux";
import ProductItem from "@/components/ProductComps/ProductItem/ProductItem";
import Loading from "@/components/LoadingComponent/Loading";

const BRAND = { primary: "#DA4445" };

export default function ProductList() {
  const { useGetProductsQuery } = ProductApi;
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useSelector((state) => state.auth.jwtToken);

  // Parse initial filters from URL (kept same)
  const parseInitialFilters = () => {
    try {
      const categoryParam = searchParams.get("category");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      return {
        category: categoryParam ? categoryParam.split(",") : [],
        color: [],
        price: [
          minPrice ? parseInt(minPrice) : 0,
          maxPrice ? parseInt(maxPrice) : 200,
        ],
        rating: 0,
      };
    } catch {
      return { category: [], color: [], price: [0, 200], rating: 0 };
    }
  };

  // State
  const [localFilters, setLocalFilters] = useState(parseInitialFilters());
  const [appliedFilters, setAppliedFilters] = useState(localFilters);
  const [localSearch, setLocalSearch] = useState(
    searchParams.get("query") || "",
  );
  const [appliedSearch, setAppliedSearch] = useState(localSearch);
  const [localSort, setLocalSort] = useState(
    searchParams.get("sort") || "newest",
  );
  const [appliedSort, setAppliedSort] = useState(localSort);
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  const limit = 12;

  // URL writer (kept same behavior)
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", page); // UI page (1-based)

    if (appliedSearch) params.set("query", appliedSearch);
    if (appliedSort !== "newest") params.set("sort", appliedSort);

    if (appliedFilters.category.length > 0) {
      params.set("category", appliedFilters.category.join(","));
    }

    if (appliedFilters.price[0] > 0) {
      params.set("minPrice", appliedFilters.price[0]);
    }

    if (appliedFilters.price[1] < 200) {
      params.set("maxPrice", appliedFilters.price[1]);
    }

    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [page, appliedSearch, appliedSort, appliedFilters, router]);

  useEffect(() => {
    updateURL();
  }, []); // eslint-disable-line

  // Data
  const { data, error, isLoading } = useGetProductsQuery(
    {
      page: page - 1, // ✅ convert UI → server
      limit,
      query: appliedSearch || undefined,
      sort: appliedSort !== "newest" ? appliedSort : undefined,
      category:
        appliedFilters.category.length > 0
          ? appliedFilters.category.join(",")
          : undefined,
      minPrice:
        appliedFilters.price[0] > 0 ? appliedFilters.price[0] : undefined,
      maxPrice:
        appliedFilters.price[1] < 200 ? appliedFilters.price[1] : undefined,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    updateURL();
  }, [appliedFilters, appliedSearch, appliedSort, page, updateURL]);

  // Categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/categories`,
        );
        const json = await res.json();
        if (res.ok) setAvailableCategories(json.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    })();
  }, []);

  // Handlers (kept your behavior)
  const handlePageChange = (newPage) => {
    setPage(newPage);

    const params = new URLSearchParams();

    params.set("page", newPage);

    if (appliedSearch) params.set("query", appliedSearch);
    if (appliedSort !== "newest") params.set("sort", appliedSort);

    if (appliedFilters.category.length > 0) {
      params.set("category", appliedFilters.category.join(","));
    }

    if (appliedFilters.price[0] > 0) {
      params.set("minPrice", appliedFilters.price[0]);
    }

    if (appliedFilters.price[1] < 200) {
      params.set("maxPrice", appliedFilters.price[1]);
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setAppliedSearch(localSearch);
    setPage(1);

    const params = new URLSearchParams();

    params.set("page", "1");

    if (localSearch) params.set("query", localSearch);
    if (appliedSort !== "newest") params.set("sort", appliedSort);

    if (appliedFilters.category.length > 0) {
      params.set("category", appliedFilters.category.join(","));
    }

    if (appliedFilters.price[0] > 0) {
      params.set("minPrice", appliedFilters.price[0]);
    }

    if (appliedFilters.price[1] < 200) {
      params.set("maxPrice", appliedFilters.price[1]);
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleFilterChange = (filterName, value) => {
    setLocalFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(localFilters);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setLocalSort(value);
    setAppliedSort(value);
    setPage(1);

    const params = new URLSearchParams();

    params.set("page", "1");
    params.set("sort", value);

    if (appliedSearch) params.set("query", appliedSearch);

    if (appliedFilters.category.length > 0) {
      params.set("category", appliedFilters.category.join(","));
    }

    if (appliedFilters.price[0] > 0) {
      params.set("minPrice", appliedFilters.price[0]);
    }

    if (appliedFilters.price[1] < 200) {
      params.set("maxPrice", appliedFilters.price[1]);
    }

    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
  const newPage = parseInt(searchParams.get("page")) || 1;
  setPage(newPage);
}, [searchParams]);

  const resetFilters = () => {
    const newFilters = { category: [], color: [], price: [0, 200], rating: 0 };
    setLocalFilters(newFilters);
    setAppliedFilters(newFilters);
    setLocalSort("newest");
    setAppliedSort("newest");
    setLocalSearch("");
    setAppliedSearch("");
    setPage(1);
  };

  // UI – redesigned

  const FiltersPanel = ({ isMobile = false }) => (
    <div className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6">
      <h3 className="text-xl font-semibold mb-4">Filters</h3>

      {/* Category filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Categories</h4>
        <div className="space-y-2">
          {availableCategories?.map((category, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localFilters.category.includes(category._id)}
                onChange={() => {
                  const newCategories = localFilters.category.includes(
                    category._id,
                  )
                    ? localFilters.category.filter((c) => c !== category._id)
                    : [...localFilters.category, category._id];
                  handleFilterChange("category", newCategories);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>{category.categoryName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Price Range</h4>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">₹{localFilters.price[0]}</span>
          <div className="flex-grow space-y-2">
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={localFilters.price[0]}
              onChange={(e) =>
                handleFilterChange("price", [
                  parseInt(e.target.value),
                  localFilters.price[1],
                ])
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={localFilters.price[1]}
              onChange={(e) =>
                handleFilterChange("price", [
                  localFilters.price[0],
                  parseInt(e.target.value),
                ])
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <span className="text-gray-600">₹{localFilters.price[1]}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-colors">
          Apply
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-gray-50 min-h-[72vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border p-6 text-center max-w-md w-full">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MdErrorOutline className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-5">
            We couldn’t load the products right now.
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 rounded-lg text-white"
            style={{ background: BRAND.primary }}>
            Go To Home Page
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen ">
      {/* Section header with pre-title bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-1.5 rounded-full"
            style={{ background: BRAND.primary }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: BRAND.primary }}>
            Catalogue
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Products
        </h1>
        <p className="text-gray-500 text-sm">View our product catalogue</p>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-8">
        {/* Mobile controls */}
        <div className="md:hidden flex flex-col gap-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="w-full flex">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-r-lg text-white cursor-pointer disabled:cursor-not-allowed"
              style={{ background: BRAND.primary }}>
              Search
            </button>
          </form>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <select
              value={localSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1">
              <option value="newest">Newest</option>
              <option value="popularity">Popularity</option>
              <option value="low-to-hight-price">Price: Low to High</option>
              <option value="hight-to-low-price">Price: High to Low</option>
            </select>
          </div>

          {showFilters && <FiltersPanel isMobile />}
        </div>

        {/* Main area */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersPanel />
            </div>
          </aside>

          {/* Products */}
          <section className="flex-1">
            {/* Desktop search + sort */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <form onSubmit={handleSearchSubmit} className="w-1/2 flex">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-r-lg text-white cursor-pointer "
                  style={{ background: BRAND.primary }}>
                  Search
                </button>
              </form>

              <div className="flex gap-2">
                <select
                  value={localSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="newest">Newest</option>
                  <option value="popularity">Popularity</option>
                  <option value="low-to-hight-price">Price: Low to High</option>
                  <option value="hight-to-low-price">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {data?.data?.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-lg text-gray-600">
                  No products found matching your criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {data?.data?.map((product) => (
                    <ProductItem
                      key={product._id}
                      productDetails={{ ...product }}
                      options={{
                        isRatingVisible: false,
                        isEyeVisible: true,
                        isWishlistIconVisible: true,
                        deleteCartIconVisible: false,
                        deleteWishlistIconVisible: false,
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data?.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                      Previous
                    </button>

                    {Array.from(
                      { length: Math.min(5, data.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (data.totalPages <= 5) pageNum = i + 1;
                        else if (page <= 3) pageNum = i + 1;
                        else if (page >= data.totalPages - 2)
                          pageNum = data.totalPages - 4 + i;
                        else pageNum = page - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 border rounded-lg ${
                              page === pageNum
                                ? "text-white border-blue-600 cursor-not-allowed"
                                : "bg-white hover:bg-gray-50 cursor-pointer"
                            }`}
                            style={
                              page === pageNum
                                ? {
                                    background: BRAND.primary,
                                    borderColor: BRAND.primary,
                                  }
                                : {}
                            }>
                            {pageNum}
                          </button>
                        );
                      },
                    )}

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(data.totalPages, page + 1))
                      }
                      disabled={page === data.totalPages}
                      className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
