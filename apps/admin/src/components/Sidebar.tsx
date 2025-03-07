import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  // FaEnvelope,
  // FaUsers,
  FaFileAlt,
  FaImage,
  FaCogs,
  FaKey,
  FaExchangeAlt,
  // FaCogs,
  // FaKey,
  // FaExchangeAlt,
} from "react-icons/fa";

import { IoMdClose } from "react-icons/io";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import anime_image from "../assets/shinobu.jpg";

type SidebarProps = {
  navbarToogle: Boolean;
  setNavbarToogle: any;
};

const Sidebar: React.FC<SidebarProps> = ({ navbarToogle, setNavbarToogle }) => {
  const navigator = useNavigate();

  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    setWidth(window.innerWidth || window.screen.width);
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth || window.screen.width);
    });
  }, []);

  const variants = {
    open: { width: "260px" },
    closed: { width: "0px" },
  };

  const sidebarInnerDivVarient = {
    open: { display: "block" },
    closed: { display: "none" },
  };

  return (
    <motion.div
      // initial={{ width: 0 }}
      animate={width <= 1023 ? (navbarToogle ? "closed" : "open") : "open"}
      variants={variants}
      className={`z-50 min-h-screen w-64 bg-gray-800 text-white flex top-0 bottom-0 flex-col fixed  overflow-y-auto scrollbar ${
        width <= 1023 ? (navbarToogle ? "hidden" : "visible") : "visible"
      }`}>
      <motion.div
        animate={width <= 1023 ? (navbarToogle ? "closed" : "open") : "open"}
        variants={sidebarInnerDivVarient}
        transition={{ delay: 0.2 }}>
        <div
          className="absolute right-2 top-2 border border-white rounded-sm lg:hidden"
          onClick={() => {
            console.log(navbarToogle);
            setNavbarToogle((prev: boolean) => !prev);
          }}>
          <IoMdClose size={20} />
        </div>

        <div className="flex items-center justify-start px-3 h-20 border-b border-gray-700 gap-2">
          <img src={anime_image} className="w-14 h-14" />
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

          <h2 className="mt-8 mb-4 text-sm text-gray-500">ORDERS</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/orders/list"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/orders/list" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaTachometerAlt className="mr-4" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                to="/orders/view"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/orders/view" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaFileAlt className="mr-4" />
                <span>Track Order</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500">PRODUCTS</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/product/add"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/product/add" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaTachometerAlt className="mr-4" />
                <span>Add Product</span>
              </Link>
            </li>
            <li>
              <Link
                to="/product/list"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/product/list" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaFileAlt className="mr-4" />
                <span>Product List</span>
              </Link>
            </li>
            <li>
              <Link
                to="/product/view"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/product/view" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaFileAlt className="mr-4" />
                <span>View Product</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500">CATEGORIES</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/categories"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/categories" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaTachometerAlt className="mr-4" />
                <span>View Categories</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500">FEATURES</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/features"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/features" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaTachometerAlt className="mr-4" />
                <span>Features</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500 uppercase">
            Testimonials
          </h2>
          <ul className="text-md">
            <li>
              <Link
                to="/testimonials"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/testimonials" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaImage className="mr-4" />
                <span>Testimonials</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500 uppercase">Users</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/users"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/users" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaImage className="mr-4" />
                <span>List Users</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500 uppercase">Singles</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/hero-product"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/hero-product" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaImage className="mr-4" />
                <span>Hero Product</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500 uppercase">
            Dynamic Pages
          </h2>
          <ul className="text-md">
            <li>
              <Link
                to="/dynamic-pages"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/dynamic-pages" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaImage className="mr-4" />
                <span>Dynamic Pages</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500 uppercase">Assets</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/asset-manager"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/asset-manager" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaImage className="mr-4" />
                <span>Manage Assets</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500">CENTER</h2>
          <ul className="text-md">
            <li>
              <Link
                to="/center/add"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/center/add" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaTachometerAlt className="mr-4" />
                <span>Create Center</span>
              </Link>
            </li>
            <li>
              <Link
                to="/center/list"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/center/list" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaFileAlt className="mr-4" />
                <span>View Centers</span>
              </Link>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-sm text-gray-500">SETTINGS</h2>
          <ul>
            <li>
              <Link
                to="/roles"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/roles" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaCogs className="mr-4" />
                <span>Roles</span>
              </Link>
            </li>
            <li>
              <Link
                to="/requests"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/requests" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaKey className="mr-4" />
                <span>Requests</span>
              </Link>
            </li>
            <li>
              <Link
                to="/preferences"
                className={`mb-[1px] flex items-center hover:bg-[rgb(43,49,61)] py-2 px-4 rounded-md cursor-pointer ${
                  location.pathname === "/preferences" && "bg-[rgb(43,49,61)]"
                }`}>
                <FaExchangeAlt className="mr-4" />
                <span>Preferences</span>
              </Link>
            </li>
          </ul>
        </nav>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
