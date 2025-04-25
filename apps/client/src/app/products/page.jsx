"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductItem from "@/components/ProductComps/ProductItem/ProductItem";
import Loading from "../cart/loading";
import { ProductApi } from "@/redux";
import { useSelector } from "react-redux";

export default function ProductList() {
  const { useGetProductsQuery } = ProductApi;
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useSelector((state) => state.auth.jwtToken);

  // Parse initial filters from URL
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
    } catch (e) {
      console.error("Error parsing filter params", e);
      return {
        category: [],
        color: [],
        price: [0, 200],
        rating: 0,
      };
    }
  };

  // Initialize state
  const [localFilters, setLocalFilters] = useState(parseInitialFilters());
  const [appliedFilters, setAppliedFilters] = useState(localFilters);
  const [localSearch, setLocalSearch] = useState(
    searchParams.get("query") || ""
  );
  const [appliedSearch, setAppliedSearch] = useState(localSearch);
  const [localSort, setLocalSort] = useState(
    searchParams.get("sort") || "newest"
  );
  const [appliedSort, setAppliedSort] = useState(localSort);
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Get current page from URL or default to 1
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 12;

  // Update the URL building logic
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    // Add page
    params.set("page", page);

    // Add search query if exists
    if (appliedSearch) {
      params.set("query", appliedSearch);
    }

    // Add sort if not default
    if (appliedSort !== "newest") {
      params.set("sort", appliedSort);
    }

    // Add category filters as a single comma-separated parameter
    if (appliedFilters.category.length > 0) {
      params.set("category", appliedFilters.category.join(","));
    }

    // Add price range filters
    if (appliedFilters.price[0] > 0) {
      params.set("minPrice", appliedFilters.price[0]);
    }
    if (appliedFilters.price[1] < 200) {
      params.set("maxPrice", appliedFilters.price[1]);
    }

    // Update URL without page refresh
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [page, appliedSearch, appliedSort, appliedFilters, router]);

  // Initialize from URL on first render
  useEffect(() => {
    updateURL();
  }, []);

  // RTK Query hook with proper filter handling
  const { data, error, isLoading, isFetching } = useGetProductsQuery(
    {
      page: page - 1, // Convert to 0-based index
      limit,
      query: appliedSearch || undefined,
      sort: appliedSort !== "newest" ? appliedSort : undefined,
      // Always include category and price filters, even if empty
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Force refetch when filters change
      refetchOnMountOrArgChange: true,
    }
  );

  // Update URL when filters change
  useEffect(() => {
    updateURL();
  }, [appliedFilters, appliedSearch, appliedSort, page, updateURL]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/categories`
        );
        const data = await res.json();
        if (res.ok) {
          setAvailableCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    params.set("page", newPage);
    if (appliedSearch) params.set("query", appliedSearch);
    if (appliedSort !== "newest") params.set("sort", appliedSort);
    params.set("filter", encodeURIComponent(JSON.stringify(appliedFilters)));
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(localSearch);
    // Reset to first page when search changes
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("query", localSearch);
    if (appliedSort !== "newest") params.set("sort", appliedSort);
    params.set("filter", encodeURIComponent(JSON.stringify(appliedFilters)));
    router.push(`/products?${params.toString()}`);
  };

  const handleFilterChange = (filterName, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(localFilters);
    // Reset to first page when filters change
    setPage(1);
  };

  const handleSortChange = (value) => {
    setLocalSort(value);
    setAppliedSort(value);
    const params = new URLSearchParams();
    params.set("sort", value);
    params.set("page", "1");
    if (appliedSearch) params.set("query", appliedSearch);
    params.set("filter", encodeURIComponent(JSON.stringify(appliedFilters)));
    router.push(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    const newFilters = {
      category: [],
      color: [],
      price: [0, 200],
      rating: 0,
    };
    setLocalFilters(newFilters);
    setAppliedFilters(newFilters);
    setLocalSort("newest");
    setAppliedSort("newest");
    setLocalSearch("");
    setAppliedSearch("");
    setPage(1);
  };

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">Error: {error.message}</div>
      </div>
    );

  // Filter component
  const FiltersPanel = ({ isMobile = false }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
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
                    category._id
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

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">
                View our product catalogue
              </p>
            </div>
          </div>

          {/* Mobile: Search and Filter Controls */}
          <div className="md:hidden flex flex-col justify-between items-center mb-6 gap-4 mt-3">
            <form onSubmit={handleSearchSubmit} className="w-full flex">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-700 transition-colors">
                Search
              </button>
            </form>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                {showFilters ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Hide Filters
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Show Filters
                  </>
                )}
              </button>

              <select
                value={localSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">Newest</option>
                <option value="popularity">Popularity</option>
                <option value="low-to-hight-price">Price: Low to High</option>
                <option value="hight-to-low-price">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Desktop: Sticky Filters Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <FiltersPanel />
              </div>
            </div>

            {/* Product Content */}
            <div className="flex-1">
              {/* Desktop: Search and Sort */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <form onSubmit={handleSearchSubmit} className="w-1/2 flex">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search products..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-700 transition-colors">
                    Search
                  </button>
                </form>

                <div className="flex gap-2">
                  <select
                    value={localSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="newest">Newest</option>
                    <option value="popularity">Popularity</option>
                    <option value="low-to-hight-price">
                      Price: Low to High
                    </option>
                    <option value="hight-to-low-price">
                      Price: High to Low
                    </option>
                  </select>
                </div>
              </div>

              {/* Mobile: Filters Panel (when toggled) */}
              {showFilters && (
                <div className="md:hidden mb-6">
                  <FiltersPanel isMobile />
                </div>
              )}

              {/* Product Grid */}
              {data?.data?.length === 0 ? (
                <div className="text-center py-20">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, data.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (data.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= data.totalPages - 2) {
                            pageNum = data.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-2 border rounded-lg ${
                                page === pageNum
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "hover:bg-gray-100"
                              }`}>
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          handlePageChange(Math.min(data.totalPages, page + 1))
                        }
                        disabled={page === data.totalPages}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
