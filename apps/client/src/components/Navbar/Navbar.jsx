import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";

import NavbarPartNonLogged from "./NavbarPartNonLogged";

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
    <div className="flex w-full border-[rgb(0,0,0,0.1)] border-b-[1px] justify-between h-[80px] max-md:h-[66px] lg:pl-[10%] lg:pr-[10%] pl-[3%] pr-[3%] bg-white">
      <Link href={"/"} className="flex flex-center items-center w-fit">
        <svg
          // width="200"
          height="100"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg">
          {/* Editable color */}
          <g stroke="black" fill="none" strokeWidth={4}>
            {/* Stems */}
            <path d="M100 120 L90 70" />
            <path d="M100 120 L110 60" />
            <path d="M100 120 L100 50" />

            {/* Flowers */}
            <circle cx="90" cy="70" r="10" />
            <circle cx="110" cy="60" r="10" />
            <circle cx="100" cy="50" r="10" />

            {/* Leaves */}
            <path d="M85 80 Q80 70 85 60" />
            <path d="M115 70 Q120 60 115 50" />

            {/* Paper wrap */}
            <path d="M80 120 L120 120 L100 160 Z" />
          </g>
        </svg>
        <span className="max-sm:font-inconsolata font-marker text-2xl uppercase font-bold text-black max-md:hidden">
          <span className="max-sm:font-inconsolata font-marker text-2xl uppercase font-bold text-black">
            {title}
          </span>
        </span>
      </Link>
      {/* <div className="hidden min-[1168px]:flex flex-center gap-5 items-center">
        {links.map((item, index) => {
          return (
            <Link key={index} className="text-xl font-marker" href={item.path}>
              {item.title}
            </Link>
          );
        })}
      </div> */}
      <NavbarPartNonLogged />
    </div>
  );
}

export default Navbar;
