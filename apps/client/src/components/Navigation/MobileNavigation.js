"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaShoppingCart,
  FaUser,
  FaHeart,
  FaBars,
} from "react-icons/fa";

const MobileNavigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: FaHome, label: "Home" },
    { path: "/products", icon: FaBars, label: "Products" },
    { path: "/cart", icon: FaShoppingCart, label: "Cart" },
    { path: "/wishlist", icon: FaHeart, label: "Wishlist" },
    { path: "/profile", icon: FaUser, label: "Profile" },
  ];

  return (
    <nav className="mobile-nav safe-area-padding">
      <div className="flex justify-between items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center p-2 ${
                isActive ? "text-primary" : "text-gray-600"
              }`}>
              <Icon className="text-xl" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
