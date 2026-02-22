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
      <div className="flex flex-row">
        <Link href={"/"} className="flex flex-center items-center w-fit">
          <img
            draggable={false}
            // src="/assets/logo/logo-horizontal.png"
            src="/assets/logo/new-logo.png"
            className="max-md:hidden h-[90px] max-sm:h-[60px] p-2 select-none user-select-none"
          />

          <img
            draggable={false}
            src="/assets/logo/logo-horizontal.png"
            className="md:hidden h-[70px] p-2 select-none user-select-none"
          />
          {/* <span className="max-sm:font-inconsolata font-marker text-2xl uppercase font-bold text-black max-md:hidden ml-4">
            <span className="max-sm:font-inconsolata font-marker text-2xl uppercase font-bold text-black">
              Petal Perfection
            </span>
          </span> */}
        </Link>
      </div>
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
