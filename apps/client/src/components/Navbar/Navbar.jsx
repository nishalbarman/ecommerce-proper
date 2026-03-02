import React from "react";
import Link from "next/link";

import { cookies } from "next/headers";

import NavbarPartNonLogged from "./NavbarPartNonLogged";
import Image from "next/image";

import tree_leaf from "../../../public/bg.png";

async function Navbar({ title }) {
  const links = [
    {
      title: "Home",
      description: "Home screen, explore products",
      path: "/",
    },
    {
      title: "Contact",
      description: "Contact us page",
      path: "/",
    },
    {
      title: "About",
      description: "About Us page",
      path: "/",
    },
    {
      title: "Sign Up",
      description: "SignUp page",
      path: "/",
    },
  ];

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  console.log("Token from Navbar function", token);

  return (
    <div className="flex w-full border-[rgb(0,0,0,0.1)] border-b-[1px] justify-between h-[80px] max-md:h-[66px] lg:pl-[10%] lg:pr-[10%] pl-[3%] pr-[3%] bg-gradient-to-r from-[#FFFEE5] to-white relative">
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

      <div className="flex flex-row">
        <Link href={"/"} className="flex flex-center items-center w-fit">
          <img
            draggable={false}
            // src="/assets/logo/logo-horizontal.png"
            src="/assets/logo/new-logo.png"
            className="max-md:hidden h-[90px] max-sm:h-[60px] p-2 select-none user-select-none mix-blend-multiply"
          />

          <img
            draggable={false}
            // src="/assets/logo/logo-horizontal.png"
            src="/assets/logo/new-logo.png"
            className="md:hidden h-[70px] p-2 select-none user-select-none mix-blend-multiply"
          />
        </Link>
      </div>

      <NavbarPartNonLogged token={token} />
    </div>
  );
}

export default Navbar;
