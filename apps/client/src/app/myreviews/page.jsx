"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { FaStar, FaEdit, FaTrash, FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";

const brand = { primary: "#DA4445" };

export default function MyFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const { jwtToken: token } = useSelector((state) => state.auth);

  const fetchFeedbacks = async (p = 1) => {
    try {
      setLoading(true);
      // Use querystring for fetch; params option is for axios
      const qs = new URLSearchParams({ page: String(p), limit: String(limit) });
      const res = await fetch(`/feedbacks/all?${qs.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/auth/login?redirect=myreviews");
        return;
      }

      const data = await res.json();
      // Expecting { data: [...], totalCount: number } — adjust if your API differs
      const rows = data?.data || [];
      const totalCount = data?.totalCount ?? rows.length;
      setFeedbacks(rows);
      setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
      setPage(p);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) {
      console.log("Token from myreviews: ", token);
      router.push("/auth/login");
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`/feedbacks/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Feedback deleted");
      // If current page becomes empty after delete, step back one page if possible
      const nextCount = feedbacks.length - 1;
      const nextPage = nextCount === 0 && page > 1 ? page - 1 : page;
      fetchFeedbacks(nextPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete feedback");
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const Stars = ({ rating = 0, size = 16 }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`${i < rating ? "text-yellow-400" : "text-gray-300"}`}
          style={{
            width: size,
            height: size,
          }}
          color={`${i < rating ? "#DA4445" : "gray"}`}
          fill={`${i < rating ? "#DA4445" : "gray"}`}
        />
      ))}
    </div>
  );

  if (!token) {
    redirect("/auth/login?redirect=myreviews");
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-1.5 rounded-full"
            style={{ background: brand.primary }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: brand.primary }}>
            Your Activity
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          My Reviews
        </h1>
        <p className="text-gray-500 text-sm">
          View and manage your product reviews
        </p>
      </div>

      {/* Content card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                All Feedback ({feedbacks.length})
              </span>
              {/* <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white"
                style={{ background: brand.primary }}>
                Browse Products{" "}
                <FaArrowRight
                  color="white"
                  fill="white"
                  className="opacity-90"
                />
              </Link> */}
            </div>
          </div>

          {/* List / Empty / Loading */}
          <div className="px-5 sm:px-6 py-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-[3px]"
                  style={{ borderTopColor: brand.primary }}
                />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No feedback found. Share your first review!
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                  style={{ background: brand.primary }}>
                  Browse Products <FaArrowRight className="opacity-90" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-6">
                {feedbacks.map((f) => (
                  <li
                    key={f._id}
                    className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <Link href={`/products/view/${f?.product?._id || ""}`}>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-500">
                            {f?.product?.title || "Untitled Product"}
                          </h3>
                        </Link>
                        <div className="mt-1 flex items-center flex-wrap gap-3 text-sm">
                          <Stars rating={f?.starsGiven} />
                          <span className="text-gray-500">
                            {formatDate(f?.createdAt)}
                          </span>
                          {f?.product?._id && (
                            <Link
                              href={`/products/view/${f.product._id}`}
                              className="text-primary font-semibold">
                              View Product
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/myreviews/edit/${f._id}`}>
                          <button
                            className="px-2.5 py-2 rounded-md border text-primary hover:bg-red-50 cursor-pointer"
                            aria-label="Edit feedback">
                            <FaEdit />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(f._id)}
                          className="px-2.5 py-2 rounded-md border text-red-600 hover:bg-red-50 cursor-pointer"
                          aria-label="Delete feedback">
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {f?.description && (
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                        {f.description}
                      </p>
                    )}

                    {f?.givenBy && (
                      <p className="mt-2 text-xs text-gray-500">
                        Submitted : {f.givenBy}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-5 sm:px-6 py-4 border-t bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => fetchFeedbacks(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1.5 rounded-md border text-sm ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}>
                    Previous
                  </button>
                  <button
                    onClick={() => fetchFeedbacks(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1.5 rounded-md border text-sm ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick access chips like your site */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Chip href="/myaccount" label="My Account" />
          <Chip href="/myorders" label="My Orders" />
          <Chip href="/wishlist" label="Wishlist" />
          <Chip href="/cart" label="Cart" />
          <Chip href="/support" label="Support" />
        </div>
      </div>
    </div>
  );
}

function Chip({ href, label }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-full border text-sm text-gray-700 bg-white hover:bg-gray-50">
      {label}
    </Link>
  );
}
