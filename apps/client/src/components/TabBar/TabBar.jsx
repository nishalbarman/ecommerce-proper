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

import tree_leaf from "../../../public/bg.png";
import Image from "next/image";

const TabBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  console.log("Current pathname in TabBar:", pathname);

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
      icon: <FaHome size={20} />,
      label: "Home",
      path: "/",
    },
    {
      icon: <FaHeart size={20} />,
      label: "Wishlist",
      path: "/wishlist",
    },
    {
      icon: <FaShoppingCart size={20} />,
      label: "Cart",
      path: "/cart",
    },
    {
      icon: <FaUser size={20} />,
      label: "Profile",
      path: "/profile",
    },
  ];

  return (
    <>
      {!(pathname === "/auth/login" || pathname === "/auth/signup") && (
        <div
          className={`fixed md:hidden bottom-0 left-0 right-0 w-full border-[rgb(0,0,0,0.1)] border-b-[1px] lg:pl-[10%] lg:pr-[10%] pl-[3%] pr-[3%] border-1 bg-[rgb(219,69,69)] rounded-t-xl z-[999] shadow transition-transform duration-300 bg-black bg-gradient-to-r from-[#FFFEE5] to-white ${
            isVisible ? "translate-y-0" : "translate-y-full"
          }`}>
          {/* Tree leaf image with pointer-events: none; */}
          <div className="h-full w-full absolute top-0 left-0 pointer-events-none">
            <Image
              className="select-none drag-none"
              src={tree_leaf}
              alt="Tree Leaf"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </div>

          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  pathname === tab.path ? "text-primary" : "text-gray-500"
                }`}>
                {tab.icon}
                <span className="text-xs mt-1 text-black text-black">
                  {tab.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TabBar;
