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
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";

type SidebarProps = {
  navbarToogle: boolean;
  setNavbarToogle: (value: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ navbarToogle, setNavbarToogle }) => {
  const navigator = useNavigate();
  const location = useLocation();
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Debugging log
  console.log("Sidebar rendering with navbarToogle:", navbarToogle);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize all sections as expanded by default
  useEffect(() => {
    const initialExpandedState = menuItems.reduce(
      (acc, item) => {
        acc[item.title] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setExpandedSections(initialExpandedState);
    console.log("Initialized expanded sections:", initialExpandedState);
  }, []);

  const variants = {
    open: {
      width: "260px",
      transition: { duration: 0.3 },
      display: "block",
    },
    closed: {
      width: "0px",
      transition: { duration: 0.3 },
      display: "none",
    },
  };

  const isMobile = width <= 1023;

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Your menuItems array remains the same
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
      title: "COUPONS",
      items: [
        {
          title: "View Coupons",
          icon: <FaTags className="mr-4" />,
          path: "/coupons",
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
        {
          title: "Logout",
          icon: <FaExchangeAlt className="mr-4" />,
          path: "/logout",
        },
      ],
    },
  ];

  return (
    <motion.div
      animate={isMobile ? (navbarToogle ? "closed" : "open") : "open"}
      variants={variants}
      className={`z-50 min-h-screen bg-gray-800 text-white fixed top-0 bottom-0 overflow-y-auto scrollbar`}
      aria-label="Sidebar">
      <div className="w-[250px]">
        {" "}
        {/* Fixed width container */}
        {/* Close button */}
        <div
          className="absolute right-2 top-2 border border-white rounded-sm lg:hidden p-1 hover:bg-gray-700 transition-colors"
          onClick={() => setNavbarToogle(!navbarToogle)}
          role="button"
          aria-label="Close Sidebar">
          <IoMdClose size={20} />
        </div>
        {/* Admin profile */}
        <div className="flex items-center justify-start px-3 h-20 border-b border-gray-700 gap-2">
          <img
            src={"https://i.ibb.co/Q3FPrQQm/64c844d378e5.png"}
            className="h-14"
            alt="Admin Avatar"
          />
          <h1 className="text-2xl font-semibold ml-1 text-white">Admin</h1>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4">
          {/* Dashboard link */}
          <Link
            to="/"
            className={`mb-2 flex items-center hover:bg-gray-700 py-2 px-4 rounded-md cursor-pointer transition-colors ${
              location.pathname === "/" ? "bg-gray-700" : ""
            }`}>
            <FaTachometerAlt className="mr-4 text-white" />
            <span className="text-white">Dashboard</span>
          </Link>

          {/* Menu sections */}
          {menuItems.map((section, index) => (
            <div key={index} className="mb-4">
              {/* Section header */}
              <div
                className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:text-white uppercase cursor-pointer transition-colors"
                onClick={() => toggleSection(section.title)}>
                <span className="text-sm text-gray-500 uppercase">
                  {section.title}
                </span>
                {expandedSections[section.title] ? (
                  <FaChevronDown className="text-xs" />
                ) : (
                  <FaChevronRight className="text-xs" />
                )}
              </div>

              {/* Section items */}
              <AnimatePresence>
                {expandedSections[section.title] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    {section.items.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        className={`flex items-center py-2 px-6 hover:bg-gray-700 rounded-md cursor-pointer transition-colors ${
                          location.pathname === item.path ? "bg-gray-700" : ""
                        }`}>
                        <span className="mr-3 text-gray-400">{item.icon}</span>
                        <span className="text-gray-300 hover:text-white">
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
