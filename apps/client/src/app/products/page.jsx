"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductItem from "@/components/ProductComps/ProductItem/ProductItem";
import Loading from "../cart/loading";

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: [],
    color: [],
    price: [0, 200],
    rating: 0,
  });
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get current page from URL or default to 1
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      params.set("page", page - 1); // Your API uses 0-based index
      params.set("limit", limit);

      if (search) params.set("query", search);
      if (sort) params.set("sort", sort);

      // Add filters if they exist
      const activeFilters = {};
      if (filters.category.length > 0)
        activeFilters.category = filters.category;
      if (filters.color.length > 0) activeFilters.color = filters.color;
      if (filters.price[0] > 0 || filters.price[1] < 200) {
        activeFilters.price = filters.price;
      }
      if (filters.rating > 0) activeFilters.rating = filters.rating;

      if (Object.keys(activeFilters).length > 0) {
        params.set("filter", JSON.stringify(activeFilters));
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products?${params.toString()}`
      );
      const data = await res.json();

      if (res.ok) {
        setProducts(data.data);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, filters]);

  useEffect(() => {
    fetchProducts();
  }, [page, sort, filters]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("query", search);
    router.push(`/products?${params.toString()}`);
    fetchProducts();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: [],
      color: [],
      price: [0, 10000],
      rating: 0,
    });
    setSort("newest");
    setSearch("");
    router.push("/products");
  };

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="container mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Products
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  View our product catelogue
                </p>
              </div>
            </div>

            {/* <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1> */}

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 mt-3">
              <form onSubmit={handleSearch} className="w-full md:w-1/2 flex">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-700 transition-colors">
                  Search
                </button>
              </form>

              <div className="flex gap-2 w-full md:w-auto">
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
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="newest">Newest</option>
                  <option value="popularity">Popularity</option>
                  <option value="low-to-hight-price">Price: Low to High</option>
                  <option value="hight-to-low-price">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-sm max-w-[500px]">
                <h3 className="text-xl font-semibold mb-4">Filters</h3>

                <div className="mb-6">
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">₹{filters.price[0]}</span>
                    <div className="flex-grow space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="10"
                        value={filters.price[0]}
                        onChange={(e) =>
                          handleFilterChange("price", [
                            parseInt(e.target.value),
                            filters.price[1],
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="10"
                        value={filters.price[1]}
                        onChange={(e) =>
                          handleFilterChange("price", [
                            filters.price[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <span className="text-gray-600">₹{filters.price[1]}</span>
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductItem
                      productDetails={{ ...product }}
                      options={{
                        isRatingVisible: false,
                        isEyeVisible: true,
                        isWishlistIconVisible: true,
                        deleteCartIconVisible: false,
                        deleteWishlistIconVisible: false,
                      }}
                      // wishlistIdMapped={wishlistIdMapped}
                      // cartIdMapped={cartIdMapped}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border rounded-lg ${page === pageNum ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, page + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
