"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";

import Image from "next/image";
import ClientWishlistIcon from "./ClientWishlistIcon";
import ClientCartIcon from "./ClientCartIcon";

import {
  FaUser,
  FaShoppingBag,
  FaTimes,
  FaStar,
  FaSignOutAlt,
  FaRegUser,
  FaUserCircle,
} from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

function NavbarPartNonLogged() {
  const token = useSelector((state) => state.auth.jwtToken);
  console.log("Token from NavbarPartNonLogged: ", token);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [localSearch, setLocalSearch] = useState(
    searchParams.get("query") || "",
  );
  const [localSort, setLocalSort] = useState(
    searchParams.get("sort") || "newest",
  );
  const [appliedSearch, setAppliedSearch] = useState(localSearch);
  const [appliedSort, setAppliedSort] = useState(localSort);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // setAppliedSearch(localSearch);
    // Reset to first page when search changes
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("query", localSearch);
    params.set("sort", appliedSort);
    // params.set("filter", encodeURIComponent(JSON.stringify(appliedFilters)));
    router.push(`/products?${params.toString()}`);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-5 h-full">
        {!!token ? (
          <>
            {/* search bar with icon */}
            {pathname === "/products" || (
              <div
                // href={"/products"}
                className="hidden lg:flex items-center justify-center h-[42px] w-fit rounded-[4px] bg-white border-black border-1 ">
                <input
                  className="font-andika tracking-[1px] flex items-center placeholder:text-sm h-full w-full border-black rounded-[4px] bg-transparent p-4 focus:outline-none focus:ring-none"
                  type="text"
                  name="search-text"
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="What are you looking for?"
                />
                <div className="h-[25px] w-[25px] mr-3 flex items-center">
                  {/* <button onSubmit={handleSearchSubmit}> */}
                  <button onClick={handleSearchSubmit}>
                    <CiSearch size={27} />
                  </button>
                </div>
              </div>
            )}

            <ClientWishlistIcon />
            <ClientCartIcon />

            <div className="h-fit w-fit relative group mb-[8px] max-sm:hidden">
              {/* <Image
                className="cursor-pointer transform translate-y-[0.14rem]"
                src="/assets/user.svg"
                alt="user logo"
                width={35}
                height={35}
              /> */}
              <FaUserCircle
                className="w-[35px] h-[35px] my-auto cursor-pointer transform translate-y-[0.14rem]"
                color="#DA4445"
                fill="#DA4445"
              />
              <div className="absolute top-6 pt-2 right-[-15px] z-[999] ease-linear duration-300 group-hover:flex hidden rounded-lg">
                <div className="bg-black opacity-[0.8] rounded-lg">
                  <div className="flex h-fit flex-col gap-1 p-[18px_12px_18px_12px] text-white w-[250px] justify-center items-center text-md bg-[rgba(0,0,0,0.2)] backdrop-blur">
                    <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/profile"}>
                        <div className="h-fit w-fit">
                          <FaUser
                            size={20}
                            color="white"
                            className="text-white"
                            fill="white"
                          />
                        </div>
                        My Profile
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/myaccount"}>
                        <div className="h-fit w-fit">
                          <FaUser
                            size={20}
                            color="white"
                            className="text-white"
                            fill="white"
                          />
                        </div>
                        My Account
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/myorders"}>
                        <div className="h-fit w-fit">
                          <FaShoppingBag
                            size={20}
                            color="white"
                            className="text-white"
                            fill="white"
                          />
                        </div>
                        My Orders
                      </Link>
                    </div>
                    {/* <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/mycancelations"}>
                        <div className="h-fit w-fit">
                          <FaTimes size={20} color="white" className="text-white" fill="white" />
                        </div>
                        My Cancellations
                      </Link>
                    </div> */}
                    <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/myreviews"}>
                        <div className="h-fit w-fit">
                          <FaStar
                            size={20}
                            color="white"
                            className="text-white"
                            fill="white"
                          />
                        </div>
                        My Reviews
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/logout"}>
                        <div className="h-fit w-fit">
                          <FaSignOutAlt
                            size={20}
                            color="white"
                            className="text-white"
                            fill="white"
                          />
                        </div>
                        Logout
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-5 h-[100%]">
              {/* search bar with icon */}
              <div className="hidden lg:flex items-center justify-center h-[42px] w-fit rounded-[4px] bg-white">
                <input
                  className="font-andika tracking-[1px] flex items-center placeholder:text-sm h-full w-full border-none outline-none border-black border-[1px] rounded-[4px] p-4 bg-transparent"
                  type="text"
                  name="search-text"
                  placeholder="What are you looking for?"
                />
                <div className="h-[25px] w-[25px] mr-3 flex items-center">
                  <div className="h-[25px] w-[25px] mr-3 flex items-center">
                    <CiSearch size={27} />
                  </div>
                </div>
              </div>

              <div className="h-[100%] w-fit relative group flex items-center">
                {/* <Link
                  className="underline align-center text-md font-semibold text-white"
                  href={"/auth/login"}>
                  Login / Signup
                </Link> */}
                {/* <Image
                className="cursor-pointer transform translate-y-[0.14rem]"
                src="/assets/user.svg"
                alt="user logo"
                width={35}
                height={35}
              /> */}
                <div className="h-fit w-fit relative group mb-[8px]">
                  <FaUserCircle
                    className="w-[35px] h-[35px] my-auto cursor-pointer transform translate-y-[0.14rem]"
                    color="#DA4445"
                    fill="#DA4445"
                  />
                  <div className="absolute top-6 pt-2 right-[-15px] z-[999] ease-linear duration-300 group-hover:flex hidden rounded-lg">
                    <div className="bg-black opacity-[0.8] rounded-lg">
                      <div className="flex h-fit flex-col gap-1 p-[18px_12px_18px_12px] text-white w-[250px] justify-center items-center text-md bg-[rgba(0,0,0,0.2)] backdrop-blur">
                        <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                          <Link
                            className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                            href={"/auth/login"}>
                            <div className="h-fit w-fit">
                              <FaUser
                                size={20}
                                color="white"
                                className="text-white"
                                fill="white"
                              />
                            </div>
                            Login/Register
                          </Link>
                        </div>

                        {/* <div className="flex items-center gap-4 w-[100%] cursor-pointer">
                      <Link
                        className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
                        href={"/mycancelations"}>
                        <div className="h-fit w-fit">
                          <FaTimes size={20} color="white" className="text-white" fill="white" />
                        </div>
                        My Cancellations
                      </Link>
                    </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default NavbarPartNonLogged;
