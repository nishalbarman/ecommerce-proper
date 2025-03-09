import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaImage,
  FaCogs,
  FaKey,
  FaExchangeAlt,
  FaBox,
  FaTags,
  FaUsers,
  FaStar,
  FaCubes,
  FaCog,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import anime_image from "../assets/shinobu.jpg";

type SidebarProps = {
  navbarToggle: boolean;
  setNavbarToggle: (value: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ navbarToggle, setNavbarToggle }) => {
  const navigator = useNavigate();
  const location = useLocation();
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const variants = {
    open: { width: "260px" },
    closed: { width: "0px" },
  };

  const sidebarInnerDivVariant = {
    open: { display: "block" },
    closed: { display: "none" },
  };

  const isMobile = width <= 1023;

  const menuItems = [
    // {
    //   title: "Dashboard",
    //   icon: <FaTachometerAlt className="mr-4" />,
    //   path: "/",
    // },
    {
      title: "ORDERS",
      items: [
        {
          title: "Orders",
          icon: <FaBox className="mr-4" />,
          path: "/orders/list",
        },
        {
          title: "Track Order",
          icon: <FaFileAlt className="mr-4" />,
          path: "/orders/view",
        },
      ],
    },
    {
      title: "MESSAGE",
      items: [
        {
          title: "Messages",
          icon: <FaMessage className="mr-4" />,
          path: "/contacts",
        },
      ],
    },
    {
      title: "PRODUCTS",
      items: [
        {
          title: "Add Product",
          icon: <FaBox className="mr-4" />,
          path: "/product/add",
        },
        {
          title: "Product List",
          icon: <FaFileAlt className="mr-4" />,
          path: "/product/list",
        },
        {
          title: "View Product",
          icon: <FaFileAlt className="mr-4" />,
          path: "/product/view",
        },
      ],
    },
    {
      title: "CATEGORIES",
      items: [
        {
          title: "View Categories",
          icon: <FaTags className="mr-4" />,
          path: "/categories",
        },
      ],
    },
    {
      title: "FEATURES",
      items: [
        {
          title: "Features",
          icon: <FaStar className="mr-4" />,
          path: "/features",
        },
      ],
    },
    {
      title: "Testimonials",
      items: [
        {
          title: "Testimonials",
          icon: <FaImage className="mr-4" />,
          path: "/testimonials",
        },
      ],
    },
    {
      title: "Users",
      items: [
        {
          title: "List Users",
          icon: <FaUsers className="mr-4" />,
          path: "/users",
        },
      ],
    },
    {
      title: "Singles",
      items: [
        {
          title: "Hero Product",
          icon: <FaImage className="mr-4" />,
          path: "/hero-product",
        },
      ],
    },
    {
      title: "Dynamic Pages",
      items: [
        {
          title: "Dynamic Pages",
          icon: <FaCubes className="mr-4" />,
          path: "/dynamic-pages",
        },
      ],
    },
    {
      title: "Assets",
      items: [
        {
          title: "Manage Assets",
          icon: <FaImage className="mr-4" />,
          path: "/asset-manager",
        },
      ],
    },
    {
      title: "CENTER",
      items: [
        {
          title: "Create Center",
          icon: <FaCog className="mr-4" />,
          path: "/center/add",
        },
        {
          title: "View Centers",
          icon: <FaFileAlt className="mr-4" />,
          path: "/center/list",
        },
      ],
    },
    {
      title: "SETTINGS",
      items: [
        { title: "Roles", icon: <FaCogs className="mr-4" />, path: "/roles" },
        {
          title: "Requests",
          icon: <FaKey className="mr-4" />,
          path: "/requests",
        },
        {
          title: "Preferences",
          icon: <FaExchangeAlt className="mr-4" />,
          path: "/preferences",
        },
      ],
    },
  ];

  return (
    <motion.div
      animate={isMobile ? (navbarToggle ? "closed" : "open") : "open"}
      variants={variants}
      className={`z-50 min-h-screen w-64 bg-gray-800 text-white flex top-0 bottom-0 flex-col fixed overflow-y-auto scrollbar ${
        isMobile ? (navbarToggle ? "hidden" : "visible") : "visible"
      }`}
      aria-label="Sidebar">
      <motion.div
        animate={isMobile ? (navbarToggle ? "closed" : "open") : "open"}
        variants={sidebarInnerDivVariant}
        transition={{ delay: 0.2 }}>
        <div
          className="absolute right-2 top-2 border border-white rounded-sm lg:hidden"
          onClick={() => setNavbarToggle(!navbarToggle)}
          role="button"
          aria-label="Close Sidebar">
          <IoMdClose size={20} />
        </div>

        <div className="flex items-center justify-start px-3 h-20 border-b border-gray-700 gap-2">
          <img
            src={anime_image}
            className="w-14 h-14 rounded-full"
            alt="Admin Avatar"
          />
          <h1 className="text-2xl font-semibold ml-1">Admin</h1>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="text-md">
            <li>
              <Link
                to="/"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaTachometerAlt className="mr-4" />
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>
          {menuItems.map((section, index) => (
            <div key={index}>
              <h2 className="mt-8 mb-4 text-sm text-gray-500 uppercase">
                {section.title}
              </h2>
              <ul className="text-md">
                {section.items?.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                        location.pathname === item.path && "bg-[rgb(43,49,61)]"
                      }`}
                      aria-label={item.title}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
