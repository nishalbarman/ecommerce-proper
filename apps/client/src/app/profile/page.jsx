"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUserCircle,
  FaUser,
  FaShoppingBag,
  FaStar,
  FaSignOutAlt,
  FaHeart,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const brand = {
  primary: "#DA4445",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = useSelector((state) => state.auth.jwtToken);

  // Optional: preload user to greet on profile
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/user/me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.status === 401) {
          router.push("/auth/login?redirect=profile");
          return;
        }
        const data = await res.json();
        const u = data?.user || data;
        if (!ignore) setUser(u || null);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [router]);

  // if (loading) {
  //   return (
  //     <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
  //       <div
  //         className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-200 border-t-[3px]"
  //         style={{ borderTopColor: brand.primary }}
  //       />
  //     </div>
  //   );
  // }

  if (!token) {
    redirect("/auth/login?redirect=myreviews");
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-1.5 rounded-full bg-primary"
            // style={{ background: brand.primary }}
          />
          <span
            className="text-sm font-semibold text-primary"
            // style={{ color: brand.primary }}
          >
            Profile
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {/* <div className="w-14 h-14 rounded-full bg-[#EEF7FF] flex items-center justify-center">
            <FaUserCircle className="w-10 h-10 bg-[#EEF7FF]" />
          </div> */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user?.name ? `Hello, ${user.name.split(" ")[0]}` : "My Profile"}
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your account, orders & reviews
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {!loading ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Quick actions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <ProfileCard
              href="/myaccount"
              title="My Account"
              description="Edit profile details, change password"
              icon={<FaUser className="text-blue-600" size={22} />}
            />
            <ProfileCard
              href="/myorders"
              title="My Orders"
              description="Track and manage your orders"
              icon={<FaShoppingBag className="text-green-600" size={22} />}
            />
            <ProfileCard
              href="/myreviews"
              title="My Reviews"
              description="View and manage your ratings"
              icon={<FaStar className="text-yellow-500" size={22} />}
            />
            <ProfileCard
              href="/logout"
              title="Logout"
              description="Securely sign out from account"
              icon={<FaSignOutAlt className="text-red-500" size={22} />}
            />
          </div>

          {/* Secondary sections */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security status */}
            {/* <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
                <FaShieldAlt className="text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Account Security
                </h2>
              </div>
              <div className="px-5 sm:px-6 py-5 space-y-4">
                <RowStatus
                  label="Email Verification"
                  value={user?.isEmailVerfied ? "Verified" : "Not Verified"}
                  actionLabel={!user?.isEmailVerfied ? "Verify Now" : null}
                  onAction={() => router.push("/verify-email")}
                />
                <RowStatus
                  label="Mobile Verification"
                  value={user?.isMobileNoVerified ? "Verified" : "Not Verified"}
                  actionLabel={!user?.isMobileNoVerified ? "Verify Now" : null}
                  onAction={() => router.push("/verify-mobile")}
                />
              </div>
            </div> */}

            {/* Helpful links */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
                <FaHeart className="text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Quick Access
                </h2>
              </div>
              <div className="px-5 sm:px-6 py-5 flex flex-wrap gap-3">
                <Chip href="/wishlist" label="Wishlist" />
                <Chip href="/cart" label="Cart" />
                <Chip href="/support" label="Support" />
                <Chip href="/faq" label="FAQ" />
                <Chip href="/policies/refund" label="Refund Policy" />
              </div>
            </div>

            {/* <div className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6 flex flex-col justify-between max-sm:flex-col max-sm:items-start gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
                <p className="text-sm text-gray-500">
                  Review latest purchases and delivery status
                </p>
              </div>
              <Link
                href="/myorders"
                className="text-white inline-flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-[#DA4445] hover:bg-red-500">
                View Orders
              </Link>
            </div> */}
          </div>

          {/* <div className="mt-8 bg-white rounded-2xl shadow-sm border p-5 sm:p-6 flex items-center justify-between max-sm:flex-col max-sm:items-start gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h3>
              <p className="text-sm text-gray-500">
                Review latest purchases and delivery status
              </p>
            </div>
            <Link
              href="/myorders"
              className="text-white inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DA4445] hover:bg-red-500">
              View All Orders <FaArrowRight color="white" fill="white" />
            </Link>
          </div> */}
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Quick actions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
                <div className="h-8 w-8 bg-gray-300 rounded-md" />
                <div className="h-4 w-28 bg-gray-300 rounded" />
                <div className="h-3 w-40 bg-gray-300 rounded" />
              </div>
            ))}
          </div>

          {/* Secondary sections */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Security */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded" />
                <div className="h-4 w-36 bg-gray-300 rounded" />
              </div>

              {/* Rows */}
              <div className="px-5 sm:px-6 py-5 space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-gray-300 rounded" />
                      <div className="h-3 w-24 bg-gray-300 rounded" />
                    </div>

                    <div className="h-8 w-24 bg-gray-300 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded" />
                <div className="h-4 w-32 bg-gray-300 rounded" />
              </div>

              {/* Chips */}
              <div className="px-5 sm:px-6 py-5 flex flex-wrap gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-300 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Orders CTA strip */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border p-5 sm:p-6 flex items-center justify-between max-sm:flex-col max-sm:items-start gap-3">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-300 rounded" />
              <div className="h-3 w-52 bg-gray-300 rounded" />
            </div>

            <div className="h-10 w-40 bg-gray-300 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ href, title, description, icon }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl shadow-md hover:shadow-md transition-all p-4 sm:p-5 flex items-start gap-4">
      <div className="w-11 h-11 max-sm:w-8 max-sm:h-8 rounded-xl bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        {/* <div className="mt-3 text-sm font-medium" style={{ color: "#2563EB" }}>
          Continue <span className="opacity-80">→</span>
        </div> */}
      </div>
    </Link>
  );
}

function RowStatus({ label, value, actionLabel, onAction }) {
  const verified = value === "Verified";
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <p
          className={`text-sm ${verified ? "text-green-600" : "text-gray-500"}`}>
          {value}
        </p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-blue-600 hover:text-blue-500">
          {actionLabel}
        </button>
      )}
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
