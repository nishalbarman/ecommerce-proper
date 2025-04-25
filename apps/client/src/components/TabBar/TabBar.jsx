"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";

const TabBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past 100px
          setIsVisible(false);
        }

        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  const tabs = [
    {
      icon: <FaHome size={20} fill="white" color="white" />,
      label: "Home",
      path: "/",
    },
    // {
    //   icon: <FaSearch size={20} fill="white" color="white" />,
    //   label: "Search",
    //   path: "/search",
    // },
    {
      icon: <FaHeart size={20} fill="white" color="white" />,
      label: "Wishlist",
      path: "/wishlist",
    },
    {
      icon: <FaShoppingCart size={20} fill="white" color="white" />,
      label: "Cart",
      path: "/cart",
    },
    {
      icon: <FaUser size={20} fill="white" color="white" />,
      label: "Account",
      path: "/myaccount",
    },
  ];

  return (
    <div
      className={`md:hidden max-md:fixed bottom-0 left-0 right-0 w-full border-[rgb(0,0,0,0.1)] border-b-[1px] lg:pl-[10%] lg:pr-[10%] pl-[3%] pr-[3%] bg-primary z-[999] shadow transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}>
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              pathname === tab.path ? "text-primary" : "text-gray-500"
            }`}>
            {tab.icon}
            <span className="text-xs mt-1 text-white">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
