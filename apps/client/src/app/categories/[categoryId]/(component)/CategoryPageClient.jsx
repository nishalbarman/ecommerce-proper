"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductItem from "@/components/ProductComps/ProductItem/ProductItem";
import Loading from "@/app/cart/loading";
import TitleWithBar from "@/components/TitleWithBar/TitleWithBar";
import Link from "next/link";
import { useGetOneCategoryQuery } from "@/redux/apis/categoryApi";
import { useGetProductsQuery } from "@/redux/apis/productApi";

export default function CategoryPage({
  initialCategory,
  initialProduct,
  initialPage,
}) {
  const { categoryId } = useParams();

  const router = useRouter();
  // const [category, setCategory] = useState(null);
  // const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage || 1);
  // const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const {
    data: { category },
    isLoading: isCategoryRtkLoading,
    error: categoryRtkError,
  } = useGetOneCategoryQuery(categoryId, {
    refetchOnMountOrArgChange: true,
    selectFromResult: (result) => ({
      ...result,
      data: result.data || initialCategory,
    }),
  });

  const {
    data: { data: products, totalPages, totalProductCount },
    error: productRtkError,
    isLoading: isProductRtkLoading,
  } = useGetProductsQuery(
    {
      page: page - 1, // ✅ convert UI → server
      limit,

      sort: "popularity",
      category: categoryId,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data || initialProduct,
      }),
      refetchOnMountOrArgChange: true,
    },
  );

  // useEffect(() => {
  //   const fetchCategoryAndProducts = async () => {
  //     try {
  //       if (initialProduct) {
  //         setCategory(initialCategory.category)
  //         setProducts(initialProduct.data);
  //         setTotalPages(initialProduct.totalPages);
  //         return;
  //       }

  //       setLoading(true);

  //       // Fetch category details
  //       const categoryRes = await fetch(
  //         `/categories/view/${categoryId}`,
  //       );
  //       const categoryData = await categoryRes.json();

  //       if (!categoryRes.ok)
  //         throw new Error(categoryData.message || "Failed to fetch category");
  //       setCategory(categoryData?.category || {});

  //       // Fetch products for this category
  //       const productsRes = await fetch(
  //         `/products?page=${page - 1}&limit=${limit}&category=${categoryId}`,
  //       );
  //       const productsData = await productsRes.json();

  //       if (!productsRes.ok)
  //         throw new Error(productsData.message || "Failed to fetch products");

  //       setProducts(productsData.data);
  //       setTotalPages(productsData.totalPages);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategoryAndProducts();
  // }, [categoryId, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Update URL without page reload
    router.replace(`/categories/${categoryId}?page=${newPage}`, {
      scroll: true,
    });
  };

  if (categoryRtkError || productRtkError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">
          Error: {categoryRtkError}, {productRtkError}
        </div>
      </div>
    );
  }

  if (isProductRtkLoading || isCategoryRtkLoading) {
    return <Loading />;
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Category not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        {/* Category Header */}
        <div className="flex flex-row justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl max-sm:text-base max-md:text-lg font-semibold text-gray-900">
              {category.categoryName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Category Collection</p>
          </div>

          <div className="rounded-full w-[100px] h-[100px] shadow-lg flex items-center justify-center">
            {category?.categoryImageUrl && (
              <img
                src={category.categoryImageUrl}
                alt={category.categoryName}
                className="w-[200px] object-contain rounded-full w-[100px] h-[100px]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <TitleWithBar title={"Category Products"} />
        <div className="w-full flex justify-between items-center mb-10 max-[597px]:mb-6 max-sm:zoom-0_1">
          <span className="text-2xl xl:text-3xl font-bold align-center max-[597px]:text-[20px]">
            {/* Best Selling Products */}
            Category Collection
          </span>

          <Link
            href={`/products?category=${categoryId}`}
            className="pt-3 pb-3 pl-8 pr-8 text-sm rounded-lg bg-[#DB4444] text-white font-semibold cursor-poiner hover:scale-[1.05] max-[597px]:p-[8px_25px]">
            View All
          </Link>
        </div>

        {products.length === 0 ? (
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
              No products found in this category
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {products.map((product) => (
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
                      className={`px-4 py-2 border rounded-lg ${
                        page === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-100"
                      }`}>
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
  );
}
