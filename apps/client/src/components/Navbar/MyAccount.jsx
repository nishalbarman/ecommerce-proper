import Link from "next/link";
import React from "react";
import {
  FaUser,
  FaShoppingBag,
  FaTimes,
  FaStar,
  FaSignOutAlt,
} from "react-icons/fa";

function MyAccount() {
  return (
    <div className="flex h-fit flex-col gap-1 p-[18px_12px_18px_12px] text-white w-[250px] justify-center items-center text-md bg-[rgba(0,0,0,0.2)] backdrop-blur">
      <div className="flex items-center gap-4 w-[100%] cursor-pointer">
        <Link
          className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
          href={"/myaccount"}>
          <div className="h-fit w-fit">
            <FaUser size={5} />
          </div>
          My Account
        </Link>
      </div>
      <div className="flex items-center gap-4 w-[100%] cursor-pointer">
        <Link
          className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
          href={"/myorders"}>
          <div className="h-fit w-fit">
            <FaShoppingBag size={5} />
          </div>
          My Orders
        </Link>
      </div>
      <div className="flex items-center gap-4 w-[100%] cursor-pointer">
        <Link
          className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
          href={"/mycancelations"}>
          <div className="h-fit w-fit">
            <FaTimes size={5} />
          </div>
          My Cancellations
        </Link>
      </div>
      <div className="flex items-center gap-4 w-[100%] cursor-pointer">
        <Link
          className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
          href={"/myreviews"}>
          <div className="h-fit w-fit">
            <FaStar size={5} />
          </div>
          My Reviews
        </Link>
      </div>
      <div className="flex items-center gap-4 w-[100%] cursor-pointer">
        <Link
          className="hover:bg-[rgb(200,200,200,0.2)] p-[10px_7px] backdrop-blur-0 flex gap-4 items-center text-white w-[100%] rounded-md"
          href={"/logout"}>
          <div className="h-fit w-fit">
            <FaSignOutAlt size={5} />
          </div>
          Logout
        </Link>
      </div>
    </div>
  );
}

export default MyAccount;
